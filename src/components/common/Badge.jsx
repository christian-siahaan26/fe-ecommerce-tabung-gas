const statusColors = {
  // Pengantaran
  READY: "bg-blue-100 text-blue-800",
  ON_THE_ROAD: "bg-yellow-100 text-yellow-800",
  SENT: "bg-green-100 text-green-800",

  // Pembayaran
  PENDING: "bg-gray-100 text-gray-800",
  SUCCESS: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
  CHALLENGE: "bg-orange-100 text-orange-800",
};

const Badge = ({ status, children }) => {
  const colorClass = statusColors[status] || "bg-gray-100 text-gray-800";
  return (
    <span
      className={`px-2 py-1 text-xs font-semibold rounded-full ${colorClass}`}
    >
      {children || status}
    </span>
  );
};

export default Badge;
