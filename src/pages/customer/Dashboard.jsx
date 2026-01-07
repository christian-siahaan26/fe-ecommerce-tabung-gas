import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { salesService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Loading from "../../components/ui/Loading";
import { formatCurrency } from "../../utils/helpers";
import DualAxisBarChart from "../../components/charts/DualAxisBarChart";

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalOrders: 0,
    inProcess: 0,
    completed: 0,
    pendingPayment: 0,
  });

  const [allPaidOrders, setAllPaidOrders] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [lastActiveOrder, setLastActiveOrder] = useState(null);

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState([
    new Date().getFullYear(),
  ]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (allPaidOrders.length > 0 || availableYears.length > 0) {
      const processed = processChartData(allPaidOrders, selectedYear);
      setChartData(processed);
    }
  }, [selectedYear, allPaidOrders]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await salesService.getAll({ page: 1, limit: 1000 });

      let userOrders = [];
      if (response.status && response.data) {
        if (Array.isArray(response.data.data)) {
          userOrders = response.data.data;
        } else if (Array.isArray(response.data)) {
          userOrders = response.data;
        }
      }

      const totalOrders = userOrders.length;

      const pendingPayment = userOrders.filter(
        (o) => o.status === "PENDING"
      ).length;

      const completed = userOrders.filter((o) => {
        if (o.status !== "SUCCESS") return false;
        const delivery = o.delivery && o.delivery[0];
        const dStatus = delivery
          ? (delivery.delivery_status || "").toUpperCase()
          : "";
        return dStatus === "SENT";
      }).length;

      const inProcess = userOrders.filter((o) => {
        if (o.status !== "SUCCESS") return false;
        const delivery = o.delivery && o.delivery[0];
        const dStatus = delivery
          ? (delivery.delivery_status || "").toUpperCase()
          : "";
        return dStatus !== "SENT" && dStatus !== "CANCELLED";
      }).length;

      setStats({ totalOrders, pendingPayment, completed, inProcess });

      const paidOrders = userOrders.filter((o) => o.status === "SUCCESS");
      setAllPaidOrders(paidOrders);

      const years = [
        ...new Set(paidOrders.map((o) => new Date(o.created_at).getFullYear())),
      ];
      if (years.length > 0) {
        setAvailableYears(years.sort((a, b) => b - a));
      }

      setChartData(processChartData(paidOrders, selectedYear));

      if (userOrders.length > 0) {
        setLastActiveOrder(userOrders[0]);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const processChartData = (orders, year) => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Agu",
      "Sep",
      "Okt",
      "Nov",
      "Des",
    ];

    const monthlyData = months.map((month) => ({
      name: month,
      expenditure: 0,
      count: 0,
    }));

    const filteredOrders = orders.filter((order) => {
      const orderYear = new Date(order.created_at).getFullYear();
      return orderYear === parseInt(year);
    });

    filteredOrders.forEach((order) => {
      const date = new Date(order.created_at);
      const monthIndex = date.getMonth();

      if (monthlyData[monthIndex]) {
        monthlyData[monthIndex].expenditure += order.total_amount;
        monthlyData[monthIndex].count += 1;
      }
    });

    return monthlyData;
  };

  const getDeliveryStatusLabel = (order) => {
    if (order.status === "PENDING") return "Menunggu Bayar";
    const delivery = order.delivery && order.delivery[0];
    const status = delivery
      ? (delivery.delivery_status || "").toUpperCase()
      : "";

    if (status === "SENT") return "Diterima";
    if (status === "ON_THE_ROAD" || status === "ON_DELIVERY")
      return "Kurir Jalan";
    if (order.status === "SUCCESS") return "Diproses";
    return "-";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Halo, {user?.name || "Pelanggan"}! 👋
            </h1>
            <p className="text-gray-600">
              Berikut ringkasan aktivitas pembelian gas Anda.
            </p>
          </div>
          <Button onClick={() => navigate("/customer/buy")}>
            + Beli Gas Baru
          </Button>
        </div>

        {/* --- GRID STATS (STYLE ADMIN) --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Total Pesanan */}
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Pesanan</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.totalOrders}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
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
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
            </div>
          </Card>

          {/* Card 2: Sedang Proses/Diantar (Blue) */}
          <Card className="border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sedang Proses</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">
                  {stats.inProcess}
                </p>
                <p className="text-xs text-gray-400 mt-1">Diproses/Diantar</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-yellow-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </Card>

          {/* Card 3: Selesai Diantar (Green) */}
          <Card className="border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Selesai Diantar</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {stats.completed}
                </p>
                <p className="text-xs text-gray-400 mt-1">Pesanan Sukses</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
          </Card>

          {/* Card 4: Menunggu Pembayaran (Red) */}
          <Card className="border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Belum Bayar</p>
                <p className="text-3xl font-bold text-red-600 mt-1">
                  {stats.pendingPayment}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Menunggu Pembayaran
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Grafik Pengeluaran */}
          <div className="lg:col-span-2">
            <DualAxisBarChart
              title="Grafik Pengeluaran & Aktivitas"
              data={chartData}
              year={selectedYear}
              years={availableYears}
              onYearChange={setSelectedYear}
              height="h-80"
              bar1Key="expenditure"
              bar1Label="Total Belanja"
              bar1Color="#3B82F6"
              bar2Key="count"
              bar2Label="Frekuensi"
              bar2Color="#F59E0B"
            />
          </div>

          {/* Last Order */}
          <div className="lg:col-span-1">
            <Card className="h-full flex flex-col">
              <h3 className="font-bold text-gray-800 mb-4">Pesanan Terakhir</h3>
              {loading ? (
                <Loading />
              ) : lastActiveOrder ? (
                <div className="flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-xs text-gray-500 uppercase font-semibold">
                        Order ID
                      </p>
                      <p className="font-mono text-lg font-bold text-gray-800">
                        #{lastActiveOrder.order_id.split("-")[1]}
                      </p>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Status</span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          lastActiveOrder.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-700"
                            : lastActiveOrder.status === "SUCCESS"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {getDeliveryStatusLabel(lastActiveOrder)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total</span>
                      <span className="font-bold text-primary-600">
                        {formatCurrency(lastActiveOrder.total_amount)}
                      </span>
                    </div>
                  </div>
                  <Button
                    className="w-full mt-6"
                    variant="outline"
                    onClick={() =>
                      navigate(`/customer/orders/${lastActiveOrder.order_id}`)
                    }
                  >
                    Lihat Detail
                  </Button>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500">
                  <p className="mb-4">Anda belum melakukan pemesanan.</p>
                  <Button size="sm" onClick={() => navigate("/customer/buy")}>
                    Beli Sekarang
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CustomerDashboard;
