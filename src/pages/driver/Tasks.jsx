import { useState, useEffect } from "react";
import { deliveryService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Loading from "../../components/ui/Loading";
import Alert from "../../components/ui/Alert";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import { formatDate } from "../../utils/helpers";

const DriverTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetTask, setTargetTask] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await deliveryService.getAll({ limit: 1000 });

      let allTasks = [];
      if (
        response.status &&
        response.data &&
        Array.isArray(response.data.data)
      ) {
        allTasks = response.data.data;
      } else if (Array.isArray(response.data)) {
        allTasks = response.data;
      }

      const myTasks = allTasks.filter(
        (t) => t.courir_name?.toLowerCase() === user?.name?.toLowerCase()
      );

      setTasks(myTasks);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIC PAGINATION (POTONG DATA) ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTasks = tasks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(tasks.length / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const confirmUpdateStatus = (deliveryId, newStatus) => {
    setTargetTask({ id: deliveryId, newStatus });
    setIsModalOpen(true);
  };

  const handleExecuteUpdate = async () => {
    if (!targetTask) return;

    setUpdatingId(targetTask.id);

    try {
      const payload = { delivery_status: targetTask.newStatus };
      const response = await deliveryService.updateStatus(
        targetTask.id,
        payload
      );

      const isSuccess =
        response.status === true ||
        (response.message &&
          response.message.toLowerCase().includes("success")) ||
        response.data;

      if (isSuccess) {
        setAlert({
          type: "success",
          message: "Status berhasil diperbarui!",
        });
        fetchTasks();
      } else {
        setAlert({
          type: "error",
          message: response.message || "Gagal update status.",
        });
      }
    } catch (err) {
      console.error("Update error:", err);
      setAlert({
        type: "error",
        message: err.message?.data?.message || "Terjadi kesalahan sistem.",
      });
    } finally {
      setUpdatingId(null);
      setIsModalOpen(false);
      setTargetTask(null);
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || "").toUpperCase();
    if (s === "SENT")
      return (
        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-bold">
          SELESAI
        </span>
      );
    if (s === "ON_THE_ROAD" || s === "ON_DELIVERY")
      return (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-bold">
          SEDANG JALAN
        </span>
      );
    return (
      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-bold">
        SIAP
      </span>
    );
  };

  const openWhatsApp = (phone) => {
    if (!phone) return;
    let formatted = phone.replace(/\D/g, "");
    if (formatted.startsWith("0")) {
      formatted = "62" + formatted.substring(1);
    }
    window.open(`https://wa.me/${formatted}`, "_blank");
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
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleExecuteUpdate}
        title="Konfirmasi Update Status"
        confirmLabel="Ya, Ubah"
        variant="primary"
        isLoading={updatingId !== null}
        message={
          targetTask
            ? `Apakah Anda yakin ingin mengubah status menjadi "${
                targetTask.newStatus === "SENT" ? "SELESAI" : "SEDANG JALAN"
              }"?`
            : ""
        }
      />
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Tugas Pengantaran
          </h1>
          <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded shadow-sm border">
            Total Tugas: <b>{tasks.length}</b>
          </span>
        </div>

        {loading ? (
          <Loading />
        ) : tasks.length === 0 ? (
          <Card>
            <div className="text-center py-12 text-gray-500">
              <p>Belum ada tugas pengantaran.</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-6">
              {currentTasks.map((task) => {
                const status = (task.delivery_status || "").toUpperCase();
                const customer = task.order?.user;

                return (
                  <Card
                    key={task.delivery_id}
                    className="border-l-4 border-primary-500"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between space-y-4 md:space-y-0">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-lg font-bold text-gray-900">
                            #{task.delivery_id.substring(0, 8)}...
                          </span>
                          {getStatusBadge(status)}
                        </div>

                        <div className="space-y-1 text-sm text-gray-600 mb-4">
                          <p>
                            <span className="font-medium">Order ID:</span>{" "}
                            <span className="font-mono text-blue-600">
                              {task.order_id}
                            </span>
                          </p>
                          <p>
                            <span className="font-medium">Tanggal:</span>{" "}
                            {formatDate(task.created_at)}
                          </p>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 max-w-md">
                          <p className="text-xs text-gray-500 font-bold uppercase mb-2">
                            Info Penerima (Customer)
                          </p>

                          {customer ? (
                            <div className="space-y-2 text-sm">
                              <div className="flex items-start gap-2">
                                <span className="text-gray-400 mt-0.5">👤</span>
                                <span className="font-medium text-gray-900">
                                  {customer.name}
                                </span>
                              </div>

                              <div className="flex items-start gap-2">
                                <span className="text-gray-400 mt-0.5">📍</span>
                                <div className="flex-1">
                                  <span className="text-gray-700 block mb-1">
                                    {customer.addres || "Alamat tidak tersedia"}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-gray-400">📞</span>
                                <span className="text-gray-700 font-mono">
                                  {customer.phone || "-"}
                                </span>

                                {customer.phone && (
                                  <button
                                    onClick={() => openWhatsApp(customer.phone)}
                                    className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded hover:bg-green-200"
                                  >
                                    Chat WA
                                  </button>
                                )}
                              </div>
                            </div>
                          ) : (
                            <p className="text-red-500 text-sm italic">
                              Data customer tidak ditemukan.
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 min-w-[140px] mt-4 md:mt-0">
                        {status === "READY" && (
                          <Button
                            onClick={() =>
                              confirmUpdateStatus(
                                task.delivery_id,
                                "ON_THE_ROAD"
                              )
                            }
                          >
                            🚀 Mulai Jalan
                          </Button>
                        )}

                        {(status === "ON_THE_ROAD" ||
                          status === "ON_DELIVERY") && (
                          <Button
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() =>
                              confirmUpdateStatus(task.delivery_id, "SENT")
                            }
                            loading={updatingId === task.delivery_id}
                          >
                            ✅ Selesai
                          </Button>
                        )}

                        {status === "SENT" && (
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <span className="text-sm font-bold text-gray-400">
                              Tugas Selesai
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {tasks.length > 0 && (
              <div className="flex items-center justify-between pt-4 mt-4 px-2">
                <div className="text-sm text-gray-700">
                  Halaman <span className="font-bold">{currentPage}</span> dari{" "}
                  <span className="font-bold">{totalPages || 1}</span>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                  >
                    &larr; Sebelumnya
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                  >
                    Selanjutnya &rarr;
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DriverTasks;
