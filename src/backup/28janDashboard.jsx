import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";

/* ================= FY UTILITIES ================= */
const getCurrentFinancialYear = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  return month >= 4
    ? `${year}-${String(year + 1).slice(2)}`
    : `${year - 1}-${String(year).slice(2)}`;
};

const generateFinancialYears = (count = 10) => {
  const currentFY = getCurrentFinancialYear();
  const [startYear] = currentFY.split("-");



  const years = [];
  for (let i = 0; i < count; i++) {
    const y = Number(startYear) - i;
    years.push(`${y}-${String(y + 1).slice(2)}`);
  }
  return years;
};
/* ================================================= */

export default function Dashboard() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [revenues, setRevenues] = useState([]);
  const [loading, setLoading] = useState(false);

  // FY state
  const [selectedFY, setSelectedFY] = useState(getCurrentFinancialYear());
  const financialYears = useMemo(() => generateFinancialYears(10), []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  /* ================= FETCH DATA ================= */
  

  const fetchRevenues = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/revenue");
      const responseData = res.data;
      const data = Array.isArray(responseData)
        ? responseData
        : responseData?.data || [];
      setRevenues(data);
    } catch (err) {
      console.log("❌ Dashboard revenue fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenues();
  }, []);

  /* ================= ROLE FILTER ================= */
  const role = localStorage.getItem("userRole") || user?.role;

  const roleWiseRevenues = useMemo(() => {
    if (!role) return revenues;
    if (role === "Super Admin") return revenues;
    return revenues.filter((r) => r.role === role);
  }, [revenues, role]);

  /* ================= FY FILTER ================= */
  const fyWiseRevenues = useMemo(() => {
    return roleWiseRevenues.filter(
      (r) => r.financialYear === selectedFY
    );
  }, [roleWiseRevenues, selectedFY]);

  /* ================= CALCULATIONS ================= */
  const totalEntries = fyWiseRevenues.length;

  const totalRevenueSum = fyWiseRevenues.reduce(
    (sum, item) => sum + Number(item.totalRevenue || 0),
    0
  );

  const totalAllocatedSum = fyWiseRevenues.reduce(
    (sum, item) => sum + Number(item.allocatedAmount || 0),
    0
  );

  const avgAllocated =
    totalEntries > 0 ? totalAllocatedSum / totalEntries : 0;

  /* ================= RECENT ACTIVITY ================= */
  const recentActivity = useMemo(() => {
    return fyWiseRevenues
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 4);
  }, [fyWiseRevenues]);

  /* ================= CHART DATA ================= */
  const chartData = useMemo(() => {
    const latest10 = fyWiseRevenues
      .slice()
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .slice(-10);

    const maxVal = Math.max(
      ...latest10.map((x) => Number(x.allocatedAmount || 0)),
      1
    );

    return latest10.map((x) =>
      Math.max(
        5,
        Math.round((Number(x.allocatedAmount || 0) / maxVal) * 100)
      )
    );
  }, [fyWiseRevenues]);

  /* ================= UI ================= */
  return (
    <div className="w-full">
      {/* Top Header */}
      <div className="bg-white rounded-2xl shadow-sm border p-6 flex flex-col md:flex-row justify-between gap-4 md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Welcome {user?.username} ✅
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Role: <span className="font-semibold">{user?.role}</span>
          </p>
          {loading && (
            <p className="text-xs text-blue-600 mt-1 font-semibold">
              Loading real data...
            </p>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="hidden md:inline-flex bg-red-500 text-white px-5 py-2 rounded-xl hover:bg-red-600 transition font-semibold"
        >
          Logout
        </button>
      </div>

      {/* Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        {/* Card 1: Financial Year Dropdown */}
        <div className="bg-white rounded-2xl shadow-sm border p-5 flex flex-col justify-between">
          <p className="text-sm text-gray-500">Financial Year</p>

          <select
            value={selectedFY}
            onChange={(e) => setSelectedFY(e.target.value)}
            className="mt-2 px-4 py-2 border rounded-xl text-sm font-semibold"
          >
            {financialYears.map((fy) => (
              <option key={fy} value={fy}>
                {fy}
              </option>
            ))}
          </select>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-blue-600 text-sm font-semibold">
              Active FY
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-xl">
              📅
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl shadow-sm border p-5">
          <p className="text-sm text-gray-500">Total Budget Allocation</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-2">
            ₹{totalAllocatedSum.toLocaleString("en-IN")}
          </h3>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-green-600 text-sm font-semibold">↑ Live</span>
            <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center text-xl">
              💰
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl shadow-sm border p-5">
          <p className="text-sm text-gray-500">Average Allocation</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-2">
            ₹{avgAllocated.toFixed(2).toLocaleString("en-IN")}
          </h3>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-red-500 text-sm font-semibold">↓ Live</span>
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-xl">
              ✅
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-2xl shadow-sm border p-5">
          <p className="text-sm text-gray-500">Operations</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-2">
            ₹{totalRevenueSum.toLocaleString("en-IN")}
          </h3>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-indigo-600 text-sm font-semibold">Updated</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-xl">
              📊
            </div>
          </div>
        </div>
      </div>

      {/* बाकीचा UI (charts, recent activity, analytics) — unchanged */}
      {/* तुझ्या existing code प्रमाणेच चालू राहील */}
    </div>
  );
}
