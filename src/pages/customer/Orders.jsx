import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { salesService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Loading from "../../components/ui/Loading";
import { formatCurrency, formatDate } from "../../utils/helpers";

const CustomerOrders = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // STATE UNTUK PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [meta, setMeta] = useState({
    total: 0,
    lastPage: 1,
    hasNextPage: false,
    hasPrevPage: false,
    page: 1,
  });

  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const response = await salesService.getAll({
        page: currentPage,
        limit: limit,
      });

      if (response.status && response.data) {
        if (Array.isArray(response.data.data)) {
          setOrders(response.data.data);
          setMeta(response.data.meta || {});
        } else {
          setOrders(response.data);
        }
      } else {
        console.warn("Format data API tidak sesuai ekspektasi");
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = () => {
    if (meta.hasNextPage) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (meta.hasPrevPage) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const getDeliveryStatusData = (order) => {
    if (order.status === "PENDING") {
      return { label: "Menunggu Pembayaran", color: "gray", code: "PENDING" };
    }

    const deliveryData = order.delivery && order.delivery[0];

    if (deliveryData) {
      const rawStatus = (
        deliveryData.delivery_status ||
        deliveryData.deliveryStatus ||
        ""
      ).toUpperCase();

      if (rawStatus === "SENT") {
        return { label: "Diterima", color: "green", code: "SENT" };
      }
      if (rawStatus === "ON_THE_ROAD" || rawStatus === "ON_DELIVERY") {
        return {
          label: "Dalam Pengiriman",
          color: "blue",
          code: "ON_DELIVERY",
        };
      }
      if (rawStatus === "READY") {
        return { label: "Siap Dikirim", color: "yellow", code: "READY" };
      }
    }

    if (order.status === "SUCCESS") {
      return { label: "Diproses", color: "yellow", code: "PROCESSING" };
    }

    return { label: "-", color: "gray", code: "UNKNOWN" };
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Riwayat Pesanan
            </h1>
            <p className="text-gray-600">Daftar semua pembelian gas Anda.</p>
          </div>
          <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded shadow-sm border">
            Total: <b>{meta.total || orders.length}</b>
          </span>
        </div>

        <Card>
          {loading ? (
            <div className="py-8">
              <Loading />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Belum ada riwayat pesanan.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">
                        Order ID
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">
                        Total
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">
                        Status Pembayaran
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">
                        Status Pengiriman
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">
                        Tanggal
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => {
                      const deliveryInfo = getDeliveryStatusData(order);

                      return (
                        <tr
                          key={order.order_id}
                          className="border-b hover:bg-gray-50 transition"
                        >
                          <td className="py-3 px-4 text-sm font-mono">
                            {order.order_id
                              ? `#${order.order_id.split("-")[1]}`
                              : "-"}
                          </td>

                          <td className="py-3 px-4 font-medium">
                            {formatCurrency(order.total_amount)}
                          </td>

                          <td className="py-3 px-4">
                            <Badge status={order.status} type="payment" />
                          </td>

                          {/* DATA STATUS PENGIRIMAN */}
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold 
                              ${
                                deliveryInfo.color === "green"
                                  ? "bg-green-100 text-green-800"
                                  : ""
                              }
                              ${
                                deliveryInfo.color === "blue"
                                  ? "bg-blue-100 text-blue-800"
                                  : ""
                              }
                              ${
                                deliveryInfo.color === "yellow"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : ""
                              }
                              ${
                                deliveryInfo.color === "gray"
                                  ? "bg-gray-100 text-gray-800"
                                  : ""
                              }
                            `}
                            >
                              {deliveryInfo.label}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-sm text-gray-600">
                            {formatDate(order.created_at)}
                          </td>

                          <td className="py-3 px-4">
                            <button
                              onClick={() =>
                                navigate(`/customer/orders/${order.order_id}`)
                              }
                              className="text-sm text-primary-600 font-medium hover:underline focus:outline-none"
                            >
                              Detail
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* KONTROL PAGINATION DI BAWAH TABEL */}
              <div className="flex items-center justify-between border-t pt-4 mt-4 px-2">
                <div className="text-sm text-gray-700">
                  Halaman <span className="font-bold">{currentPage}</span> dari{" "}
                  <span className="font-bold">{meta.lastPage || 1}</span>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevPage}
                    disabled={!meta.hasPrevPage || loading}
                  >
                    &larr; Sebelumnya
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={!meta.hasNextPage || loading}
                  >
                    Selanjutnya &rarr;
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CustomerOrders;
