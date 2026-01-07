import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import Card from "../ui/Card";
import { formatCurrency } from "../../utils/helpers";

const DualAxisBarChart = ({
  title,
  data,
  year,
  years,
  onYearChange,
  bar1Key,
  bar1Label,
  bar1Color,
  bar2Key,
  bar2Label,
  bar2Color,
  height = "h-96",
}) => {
  return (
    <Card className="h-full">
      {/* Header Grafik & Filter Tahun */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="font-bold text-gray-800 text-lg">
          {title} ({year})
        </h3>

        <div className="flex items-center gap-2">
          <label htmlFor="yearFilter" className="text-sm text-gray-600">
            Tahun:
          </label>
          <select
            id="yearFilter"
            value={year}
            onChange={(e) => onYearChange(parseInt(e.target.value))}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-primary-500 focus:border-primary-500 outline-none"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Render Chart */}
      {data && data.length > 0 ? (
        <div className={`w-full ${height}`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E5E7EB"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6B7280" }}
                dy={10}
              />

              {/* Sumbu Y Kiri (Uang/Nilai) */}
              <YAxis
                yAxisId="left"
                axisLine={false}
                tickLine={false}
                tick={{ fill: bar1Color, fontSize: 12 }}
                tickFormatter={(value) =>
                  value === 0 ? "0" : `${value / 1000}k`
                }
              />

              {/* Sumbu Y Kanan (Jumlah/Qty) */}
              <YAxis
                yAxisId="right"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fill: bar2Color, fontSize: 12 }}
                tickFormatter={(value) => value}
              />

              <Tooltip
                cursor={{ fill: "#F3F4F6" }}
                formatter={(value, name) => {
                  if (name === bar1Key)
                    return [formatCurrency(value), bar1Label];
                  if (name === bar2Key) return [`${value} Pcs`, bar2Label];
                  return [value, name];
                }}
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />

              <Legend
                verticalAlign="top"
                height={36}
                formatter={(value) => {
                  return value === bar1Key
                    ? `${bar1Label} (Rp)`
                    : `${bar2Label} (Qty)`;
                }}
              />

              {/* Bar 1 (Nilai/Uang) */}
              <Bar
                yAxisId="left"
                dataKey={bar1Key}
                fill={bar1Color}
                radius={[4, 4, 0, 0]}
                barSize={30}
                name={bar1Key}
              />

              {/* Bar 2 (Jumlah) */}
              <Bar
                yAxisId="right"
                dataKey={bar2Key}
                fill={bar2Color}
                radius={[4, 4, 0, 0]}
                barSize={30}
                name={bar2Key}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-64 flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-lg">
          <p>Tidak ada data untuk ditampilkan.</p>
        </div>
      )}
    </Card>
  );
};

export default DualAxisBarChart;
