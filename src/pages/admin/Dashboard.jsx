import { useState, useEffect } from "react";
import { salesService, deliveryService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Card from "../../components/ui/Card";
import Loading from "../../components/ui/Loading";
import { formatCurrency } from "../../utils/helpers";
import DualAxisBarChart from "../../components/charts/DualAxisBarChart";

const AdminDashboard = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    totalSalesCount: 0,
    totalRevenue: 0,
    totalDeliveries: 0,
    pendingDeliveries: 0,
    completedDeliveries: 0,
    pendingPaymentCount: 0,
  });

  const [allPaidOrders, setAllPaidOrders] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState([
    new Date().getFullYear(),
  ]);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (allPaidOrders.length > 0) {
      const processed = processChartData(allPaidOrders, selectedYear);
      setChartData(processed);
    }
  }, [selectedYear, allPaidOrders]);

  const fetchStats = async () => {
    try {
      setLoading(true);

      const [salesResponse, deliveriesResponse] = await Promise.all([
        salesService.getAll(),
        deliveryService.getAll(),
      ]);

      const getArrayData = (res) => {
        if (res.status && res.data && Array.isArray(res.data.data))
          return res.data.data;
        if (res.success && Array.isArray(res.data)) return res.data;
        if (Array.isArray(res)) return res;
        return [];
      };

      const sales = getArrayData(salesResponse);
      const deliveries = getArrayData(deliveriesResponse);

      const totalSalesCount = sales.length;
      const paidOrders = sales.filter((s) => s.status === "SUCCESS");
      setAllPaidOrders(paidOrders);

      const years = [
        ...new Set(paidOrders.map((o) => new Date(o.created_at).getFullYear())),
      ];
      if (years.length > 0) {
        setAvailableYears(years.sort((a, b) => b - a));
      }

      const totalRevenue = paidOrders.reduce(
        (acc, curr) => acc + curr.total_amount,
        0
      );

      const pendingPaymentCount = sales.filter(
        (s) => s.status === "PENDING"
      ).length;

      const totalDeliveries = paidOrders.length;
      const completedDeliveries = deliveries.filter((d) => {
        const status = (
          d.delivery_status ||
          d.deliveryStatus ||
          ""
        ).toUpperCase();
        return status === "SENT";
      }).length;

      const pendingDeliveries = totalDeliveries - completedDeliveries;

      setStats({
        totalSalesCount,
        totalRevenue,
        totalDeliveries,
        pendingDeliveries,
        completedDeliveries,
        pendingPaymentCount,
      });

      setChartData(processChartData(paidOrders, selectedYear));
    } catch (error) {
      console.error("Failed to fetch stats:", error);
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
      revenue: 0,
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
        monthlyData[monthIndex].revenue += order.total_amount;
        monthlyData[monthIndex].count += 1;
      }
    });

    return monthlyData;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Loading fullScreen />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard Admin
            </h1>
            <p className="text-gray-600 mt-1">
              Ringkasan performa penjualan dan pengiriman.
            </p>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-sm text-gray-500">Total Pendapatan Bersih</p>
            <p className="text-2xl font-bold text-primary-600">
              {formatCurrency(stats.totalRevenue)}
            </p>
          </div>
        </div>

        {/* --- GRID STATS (Tidak Berubah) --- */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Transaksi</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.totalSalesCount}
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
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2-2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Perlu Diantar</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">
                  {stats.pendingDeliveries}
                </p>
                <p className="text-xs text-gray-400 mt-1">Siap Kirim</p>
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

          <Card className="border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Selesai Diantar</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {stats.completedDeliveries}
                </p>
                <p className="text-xs text-gray-400 mt-1">Diterima User</p>
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

          <Card className="border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Menunggu Pembayaran</p>
                <p className="text-3xl font-bold text-red-600 mt-1">
                  {stats.pendingPaymentCount}
                </p>
                <p className="text-xs text-gray-400 mt-1">Belum Bayar</p>
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

        {/* --- BAGIAN GRAFIK --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-3">
            <DualAxisBarChart
              title="Grafik Performa Penjualan"
              data={chartData}
              year={selectedYear}
              years={availableYears}
              onYearChange={setSelectedYear}
              bar1Key="revenue"
              bar1Label="Pendapatan"
              bar1Color="#4F46E5"
              bar2Key="count"
              bar2Label="Jumlah Order"
              bar2Color="#F59E0B"
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
