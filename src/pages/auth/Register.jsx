import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    addres: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Nama lengkap harus diisi";
    if (!formData.email) newErrors.email = "Email harus diisi";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email tidak valid";

    if (!formData.password) newErrors.password = "Password harus diisi";
    else if (formData.password.length < 6)
      newErrors.password = "Password minimal 6 karakter";

    if (!formData.phone) newErrors.phone = "Nomor HP harus diisi";
    if (!formData.addres) newErrors.addres = "Alamat harus diisi";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      const result = await register(formData);

      if (result.success) {
        navigate("/customer/dashboard");
      } else {
        setErrorMessage(result.message || "Registrasi gagal.");
      }
    } catch (error) {
      console.error("ERROR REGISTER:", error);
      const msg =
        error?.message || "Terjadi kesalahan sistem. Silakan coba lagi.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-2xl">G</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">Gas 3Kg</span>
          </Link>
        </div>

        <Card>
          <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            Daftar Akun
          </h1>
          <p className="text-center text-gray-600 mb-6">
            Buat akun untuk mulai memesan gas
          </p>

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nama Lengkap"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Contoh: Budi Santoso"
              error={errors.name}
            />

            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="nama@email.com"
              error={errors.email}
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimal 6 karakter"
              error={errors.password}
            />

            <Input
              label="Nomor HP"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="08123456789"
              error={errors.phone}
            />

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Alamat Lengkap
              </label>
              <textarea
                name="addres"
                value={formData.addres}
                onChange={handleChange}
                rows="3"
                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary-500 outline-none transition
                  ${
                    errors.addres
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-300"
                  }`}
                placeholder="Nama jalan, nomor rumah, kelurahan..."
              />
              {errors.addres && (
                <span className="text-xs text-red-500">{errors.addres}</span>
              )}
            </div>

            <Button type="submit" fullWidth loading={loading}>
              {loading ? "Mendaftar..." : "Daftar Sekarang"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              Sudah punya akun?{" "}
              <Link
                to="/login"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Login disini
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Register;
