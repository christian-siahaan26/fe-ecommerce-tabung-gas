import { useState, useEffect } from "react";
import { authService } from "../../services/api";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Loading from "../../components/ui/Loading";
import Alert from "../../components/ui/Alert";
import ConfirmationModal from "../../components/ui/ConfirmationModal";

const AdminDrivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- STATE MODAL & FORM ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedId, setSelectedId] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  // --- STATE ALERT ---
  const [alert, setAlert] = useState(null);

  // --- STATE DELETE ---
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [driverToDelete, setDriverToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    addres: "",
  });

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const response = await authService.getCourirs();
      if (
        response.status &&
        response.data &&
        Array.isArray(response.data.data)
      ) {
        setDrivers(response.data.data);
      } else if (Array.isArray(response.data)) {
        setDrivers(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch drivers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setModalMode("create");
    setSelectedId(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      phone: "",
      addres: "",
    });
    setAlert(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (driver) => {
    setModalMode("edit");
    setSelectedId(driver.user_id);
    setFormData({
      name: driver.name || "",
      email: driver.email || "",
      password: "",
      phone: driver.phone || "",
      addres: driver.addres || "",
    });
    setAlert(null);
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const confirmDelete = (driver) => {
    setDriverToDelete(driver);
    setDeleteModalOpen(true);
  };

  const handleExecuteDelete = async () => {
    if (!driverToDelete) return;

    setIsDeleting(true);

    try {
      const response = await authService.deleteUser(driverToDelete.user_id);

      if (response.status === 204 || response.status === 200 || response.data) {
        setAlert({
          type: "success",
          message: `Driver "${driverToDelete.name}" berhasil dihapus.`,
        });
        setDrivers((prev) =>
          prev.filter((d) => d.user_id !== driverToDelete.user_id)
        );
      }
    } catch (err) {
      console.error("Gagal menghapus:", err);
      const msg = err.response?.data?.message || "Gagal menghapus driver.";
      setAlert({
        type: "error",
        message: `Error: ${msg}`,
      });
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setDriverToDelete(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setAlert(null);

    try {
      let response;

      if (modalMode === "create") {
        const payload = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: "COURIR",
          phone: formData.phone,
          addres: formData.addres,
        };

        response = await authService.register(payload);
      } else {
        const payload = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          addres: formData.addres,
        };

        if (formData.password && formData.password.trim() !== "") {
          payload.password = formData.password;
        }

        response = await authService.updateUser(selectedId, payload);
      }

      if (response.status) {
        setAlert({
          type: "success",
          message:
            modalMode === "create"
              ? "Driver berhasil ditambahkan!"
              : "Data driver diperbarui!",
        });
        setIsModalOpen(false);
        fetchDrivers();
      } else {
        setAlert({
          type: "error",
          message: response.message || "Gagal menyimpan data",
        });
      }
    } catch (err) {
      console.error(err);
      setAlert({
        type: "error",
        message: err.response?.data?.message || "Terjadi kesalahan sistem",
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <DashboardLayout>
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleExecuteDelete}
        title="Hapus Driver?"
        message={`Apakah Anda yakin ingin menghapus driver "${driverToDelete?.name}"? Data yang dihapus tidak dapat dikembalikan.`}
        isLoading={isDeleting}
      />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Data Pengantar (Kurir)
        </h1>
        <Button onClick={handleOpenCreate}>+ Tambah Driver</Button>
      </div>

      {loading ? (
        <Loading />
      ) : drivers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">Belum ada data driver/kurir.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drivers.map((driver) => (
            <Card key={driver.user_id} className="relative group">
              <div className="absolute top-4 right-4 flex space-x-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleOpenEdit(driver)}
                  className="p-2 bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-full transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => confirmDelete(driver)}
                  className="p-2 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-full transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-primary-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div className="overflow-hidden pr-20">
                  <h3 className="font-bold text-gray-900 truncate">
                    {driver.name}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">
                    {driver.email}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">No. HP:</span>
                  <span className="font-medium">{driver.phone || "-"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Alamat:</span>
                  <span
                    className="font-medium truncate w-1/2 text-right"
                    title={driver.addres}
                  >
                    {driver.addres || "-"}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold mb-4">
              {modalMode === "create" ? "Tambah Driver Baru" : "Edit Driver"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500 bg-gray-50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password{" "}
                  {modalMode === "edit" && (
                    <span className="text-gray-400 font-normal text-xs">
                      (Kosongkan jika tidak ingin mengubah)
                    </span>
                  )}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
                  placeholder={
                    modalMode === "edit" ? "******" : "Minimal 6 karakter"
                  }
                  required={modalMode === "create"}
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  No. HP
                </label>
                <input
                  type="number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alamat Domisili
                </label>
                <textarea
                  name="addres"
                  value={formData.addres}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
                  rows={3}
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitLoading}
                >
                  Batal
                </Button>
                <Button type="submit" loading={submitLoading}>
                  {modalMode === "create" ? "Simpan Driver" : "Update Data"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminDrivers;
