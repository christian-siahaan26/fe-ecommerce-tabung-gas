import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DualAxisBarChart from "../../components/charts/DualAxisBarChart";
import { deliveryService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Loading from "../../components/ui/Loading";

const DriverDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [stats, setStats] = useState({
    total: 0,
    ready: 0,
    onTheRoad: 0,
    sent: 0,
  });

  const [myAllTasks, setMyAllTasks] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState([
    new Date().getFullYear(),
  ]);

  useEffect(() => {
    fetchStats();
  }, [user]);

  useEffect(() => {
    if (myAllTasks.length > 0 || availableYears.length > 0) {
      const processed = processChartData(myAllTasks, selectedYear);
      setChartData(processed);
    }
  }, [selectedYear, myAllTasks]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await deliveryService.getAll();

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

      setMyAllTasks(myTasks);

      const finishedTasks = myTasks.filter((t) => t.delivery_status === "SENT");
      const years = [
        ...new Set(
          finishedTasks.map((t) => new Date(t.created_at).getFullYear())
        ),
      ];
      if (years.length > 0) {
        setAvailableYears(years.sort((a, b) => b - a));
      }

      setStats({
        total: myTasks.length,
        ready: myTasks.filter((t) => t.delivery_status === "READY").length,
        onTheRoad: myTasks.filter(
          (t) =>
            t.delivery_status === "ON_THE_ROAD" ||
            t.delivery_status === "ON_DELIVERY"
        ).length,
        sent: finishedTasks.length,
      });

      setChartData(processChartData(myTasks, selectedYear));
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const processChartData = (tasks, year) => {
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
      count: 0,
      deliveredValue: 0,
    }));

    const filteredTasks = tasks.filter((task) => {
      const taskYear = new Date(task.created_at).getFullYear();
      return task.delivery_status === "SENT" && taskYear === parseInt(year);
    });

    filteredTasks.forEach((task) => {
      const date = new Date(task.created_at);
      const monthIndex = date.getMonth();

      if (monthlyData[monthIndex]) {
        monthlyData[monthIndex].count += 1;

        const orderAmount = task.order ? task.order.total_amount : 0;
        monthlyData[monthIndex].deliveredValue += orderAmount;
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
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard Kurir
            </h1>
            <p className="text-gray-600 mt-1">
              Halo, {user?.name}! Semangat mengantar.
            </p>
          </div>
          <Button onClick={() => navigate("/driver/tasks")}>Lihat Tugas</Button>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Total Tugas</p>
              <p className="text-4xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </Card>
          <Card className="bg-yellow-50 border-yellow-100">
            <div className="text-center">
              <p className="text-sm text-yellow-800 mb-2">Siap Diantar</p>
              <p className="text-4xl font-bold text-yellow-600">
                {stats.ready}
              </p>
            </div>
          </Card>
          <Card className="bg-blue-50 border-blue-100">
            <div className="text-center">
              <p className="text-sm text-blue-800 mb-2">Sedang Jalan</p>
              <p className="text-4xl font-bold text-blue-600">
                {stats.onTheRoad}
              </p>
            </div>
          </Card>
          <Card className="bg-green-50 border-green-100">
            <div className="text-center">
              <p className="text-sm text-green-800 mb-2">Selesai</p>
              <p className="text-4xl font-bold text-green-600">{stats.sent}</p>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-3">
            <DualAxisBarChart
              title="Grafik Pengantaran Selesai"
              data={chartData}
              year={selectedYear}
              years={availableYears}
              onYearChange={setSelectedYear}
              height="h-80"
              
              bar1Key="deliveredValue"
              bar1Label="Nilai Barang"
              bar1Color="#10B981"
              bar2Key="count"
              bar2Label="Jumlah Paket"
              bar2Color="#3B82F6"
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DriverDashboard;
