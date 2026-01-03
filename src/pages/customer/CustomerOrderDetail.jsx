import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { salesService } from "../../services/api";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Loading from "../../components/ui/Loading";
import { formatCurrency, formatDate } from "../../utils/helpers";

const CustomerOrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await salesService.getById(orderId);

      if (response.status && response.data) {
        setOrder(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch order detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDeliveryStatus = (orderData) => {
    const delivery = orderData.delivery && orderData.delivery[0];
    if (!delivery) return null;

    const status = (
      delivery.delivery_status ||
      delivery.deliveryStatus ||
      ""
    ).toUpperCase();

    if (status === "SENT")
      return {
        label: "Diterima",
        color: "green",
        text: "Pesanan telah diterima",
      };
    if (status === "ON_THE_ROAD" || status === "ON_DELIVERY")
      return {
        label: "Dalam Pengiriman",
        color: "blue",
        text: "Kurir sedang menuju lokasi",
      };
    if (status === "READY")
      return {
        label: "Siap Dikirim",
        color: "yellow",
        text: "Menunggu kurir mengambil barang",
      };

    return { label: "Diproses", color: "gray", text: "Sedang dipersiapkan" };
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-12">
          <Loading />
        </div>
      </DashboardLayout>
    );
  }

  if (!order) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-red-500">Data pesanan tidak ditemukan.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate(-1)}
          >
            Kembali
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const deliveryInfo = getDeliveryStatus(order);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/customer/orders")}
            className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              ></path>
            </svg>
            Kembali ke Riwayat
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Detail Pesanan</h1>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Bagian Kiri: Informasi Utama (2/3 lebar) */}
          <div className="md:col-span-2 space-y-6">
            {/* 1. Card Status & Info Dasar */}
            <Card>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="font-mono font-bold text-lg">
                    #{order.order_id.split("-")[1]}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 mb-1">Tanggal Pesanan</p>
                  <p className="font-medium">{formatDate(order.created_at)}</p>
                </div>
              </div>

              <div className="border-t border-b py-4 my-4 flex justify-between items-center">
                <span className="text-gray-600">Status Pembayaran</span>
                <Badge status={order.status} type="payment" />
              </div>

              {order.status === "PENDING" && order.snap_redirect_url && (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mt-4">
                  <p className="text-yellow-800 text-sm mb-2">
                    Pembayaran belum diselesaikan.
                  </p>
                  <a
                    href={order.snap_redirect_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block w-full text-center bg-primary-600 text-white py-2 rounded hover:bg-primary-700 transition"
                  >
                    Bayar Sekarang
                  </a>
                </div>
              )}
            </Card>

            {/* 2. Card Item Produk (DIPERBARUI) */}
            <Card>
              <h3 className="font-bold text-gray-900 mb-4">Rincian Produk</h3>
              {!order.order_items || order.order_items.length === 0 ? (
                <div className="text-gray-500 text-center py-4 italic bg-gray-50 rounded">
                  Data item produk tidak tersedia.
                </div>
              ) : (
                <div className="space-y-4">
                  {order.order_items.map((item, index) => (
                    <div
                      key={index}
                      // Ubah layout menjadi items-start agar deskripsi panjang tidak merusak layout
                      className="flex justify-between items-start border-b last:border-0 pb-4 last:pb-0"
                    >
                      <div className="flex gap-4">
                        {/* Icon Box */}
                        <div className="w-12 h-12 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center text-gray-400">
                          📦
                        </div>

                        {/* Detail Produk */}
                        <div>
                          <p className="font-medium text-gray-900">
                            {item.product?.name || "Produk Gas"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.quantity} x {formatCurrency(item.price)}
                          </p>

                          {/* --- MENAMPILKAN DESKRIPSI DISINI --- */}
                          {item.product?.description && (
                            <p className="text-xs text-gray-500 mt-1 italic max-w-md">
                              "{item.product.description}"
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Total Harga per Item */}
                      <p className="font-medium whitespace-nowrap ml-4">
                        {formatCurrency(item.quantity * item.price)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Bagian Kanan: Info Pengiriman & Ringkasan (1/3 lebar) */}
          <div className="space-y-6">
            <Card>
              <h3 className="font-bold text-gray-900 mb-4">
                Status Pengiriman
              </h3>
              {deliveryInfo ? (
                <div
                  className={`p-4 rounded-lg border ${
                    deliveryInfo.color === "green"
                      ? "bg-green-50 border-green-200"
                      : deliveryInfo.color === "blue"
                      ? "bg-blue-50 border-blue-200"
                      : "bg-yellow-50 border-yellow-200"
                  }`}
                >
                  <p
                    className={`font-bold ${
                      deliveryInfo.color === "green"
                        ? "text-green-700"
                        : deliveryInfo.color === "blue"
                        ? "text-blue-700"
                        : "text-yellow-700"
                    }`}
                  >
                    {deliveryInfo.label}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {deliveryInfo.text}
                  </p>

                  {order.delivery[0]?.courir_name && (
                    <div className="mt-3 pt-3 border-t border-gray-200/50">
                      <p className="text-xs text-gray-500">Kurir:</p>
                      <p className="font-medium text-gray-800">
                        {order.delivery[0].courir_name}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg text-gray-500 text-sm">
                  Pengiriman belum dijadwalkan.
                </div>
              )}
            </Card>

            <Card>
              <h3 className="font-bold text-gray-900 mb-4">Ringkasan Harga</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Total Harga</span>
                  <span>{formatCurrency(order.total_amount)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Biaya Layanan</span>
                  <span>Rp 0</span>
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg text-gray-900">
                  <span>Total Bayar</span>
                  <span className="text-primary-600">
                    {formatCurrency(order.total_amount)}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CustomerOrderDetail;
