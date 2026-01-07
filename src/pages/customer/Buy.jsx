import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { salesService } from "../../services/api";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { formatCurrency } from "../../utils/helpers";

const PRICE_PER_UNIT = 20000;
const PRODUCT_ID = "cmieed8ul0000llezcr4lm4qt";

const CustomerBuy = () => {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totalPrice = quantity * PRICE_PER_UNIT;

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    if (value > 0 && value <= 100) {
      setQuantity(value);
      setError("");
    }
  };

  const handleBuy = async () => {
    if (quantity < 1) {
      setError("Jumlah minimal 1 tabung");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const orderPayload = {
        items: [
          {
            product_id: PRODUCT_ID,
            quantity: parseInt(quantity),
          },
        ],
      };

      const response = await salesService.create(orderPayload);

      if (response.status && response.data?.midtrans?.token) {
        const snapToken = response.data.midtrans.token;

        window.snap.pay(snapToken, {
          onSuccess: function (result) {
            console.log("Payment success:", result);
            sukses;
            navigate(`/customer/dashboard`);
          },
          onPending: function (result) {
            console.log("Payment pending:", result);
            navigate(`/customer/dashboard`);
          },
          onError: function (result) {
            console.log("Payment error:", result);
            setError("Pembayaran gagal. Silakan coba lagi.");
            setLoading(false);
          },
          onClose: function () {
            console.log("Payment popup closed");
            setLoading(false);
          },
        });
      } else {
        setError(response.message || "Gagal membuat pesanan");
        setLoading(false);
      }
    } catch (err) {
      console.error("Buy error:", err);
      setError(err.response?.data?.message || "Terjadi kesalahan sistem");
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Beli Gas 3Kg</h1>
          <p className="text-gray-600 mt-1">Pesan gas dengan mudah dan cepat</p>
        </div>

        <Card>
          <div className="space-y-6">
            {/* Product Info */}
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-20 h-20 bg-primary-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-primary-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900">
                  Tabung Gas 3Kg
                </h3>
                <p className="text-gray-600">Berkualitas & Aman</p>
                <p className="text-primary-600 font-bold mt-1">
                  {formatCurrency(PRICE_PER_UNIT)} / tabung
                </p>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Quantity Input */}
            <Input
              label="Jumlah Tabung"
              type="number"
              name="quantity"
              value={quantity}
              onChange={handleQuantityChange}
              min="1"
              max="100"
              required
            />

            {/* Input Alamat */}
            <div className="text-sm text-gray-500 bg-blue-50 p-3 rounded-lg border border-blue-100">
              <span className="font-semibold text-blue-700">
                Info Pengiriman:
              </span>{" "}
              Gas akan dikirim ke alamat yang terdaftar di profil akun Anda.
            </div>

            {/* Price Summary */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">
                  Harga per tabung ({quantity}x)
                </span>
                <span className="text-gray-900">
                  {formatCurrency(PRICE_PER_UNIT)}
                </span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold">
                <span className="text-gray-900">Total Pembayaran</span>
                <span className="text-primary-600">
                  {formatCurrency(totalPrice)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => navigate("/customer/dashboard")}
                disabled={loading}
                fullWidth
              >
                Batal
              </Button>
              <Button onClick={handleBuy} loading={loading} fullWidth>
                Buat Pesanan
              </Button>
            </div>

            <div className="text-sm text-gray-500 text-center">
              Anda akan diarahkan ke halaman pembayaran Midtrans
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CustomerBuy;
