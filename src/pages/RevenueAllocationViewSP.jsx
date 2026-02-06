import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "../services/axiosInstance";

/* ================= FY UTILS ================= */
const getCurrentFinancialYear = () => {
  const today = new Date();
  const y = today.getFullYear();
  return today.getMonth() + 1 >= 4
    ? `${y}-${String(y + 1).slice(2)}`
    : `${y - 1}-${String(y).slice(2)}`;
};

const generateFinancialYears = (count = 10) => {
  const [start] = getCurrentFinancialYear().split("-");
  return Array.from({ length: count }, (_, i) => {
    const y = Number(start) - i;
    return `${y}-${String(y + 1).slice(2)}`;
  });
};
/* ============================================ */

export default function RevenueAllocationViewSP() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [fy, setFy] = useState(getCurrentFinancialYear());
  const [role, setRole] = useState("ALL");

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/revenue");
        setData(res.data?.data || []);
      } catch (e) {
        console.log("SP fetch error", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /* ================= FILTER ================= */
  const filtered = useMemo(() => {
    return data.filter((r) => {
      if (fy && r.financialYear !== fy) return false;
      if (role !== "ALL" && r.role !== role) return false;
      return true;
    });
  }, [data, fy, role]);

  /* ================= TOTALS ================= */
  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, r) => {
        acc.revenue += Number(r.totalRevenue || 0);
        acc.allocated += Number(r.allocatedAmount || 0);
        acc.utilized += Number(r.utilizedAmount || 0);
        acc.remaining += Number(r.remainingAmount || 0);

        acc.sanctioned += (r.activities || []).reduce(
          (s, a) => s + Number(a.amountSanctioned || 0),
          0
        );

        acc.pending += (r.activities || []).reduce(
          (s, a) => s + Number(a.pendingAmount || 0),
          0
        );

        return acc;
      },
      {
        revenue: 0,
        allocated: 0,
        utilized: 0,
        remaining: 0,
        sanctioned: 0,
        pending: 0,
      }
    );
  }, [filtered]);

  /* ================= UI ================= */
  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="bg-white rounded-2xl border p-5">
        <h1 className="text-xl font-bold text-gray-800">
          Super Admin – Revenue Allocation
        </h1>
        <p className="text-sm text-gray-500">
          Financial year & role wise consolidated report
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <select
          value={fy}
          onChange={(e) => setFy(e.target.value)}
          className="px-4 py-3 border rounded-xl"
        >
          {generateFinancialYears().map((y) => (
            <option key={y}>{y}</option>
          ))}
        </select>

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="px-4 py-3 border rounded-xl"
        >
          <option value="ALL">All Roles</option>
          <option value="Collector Office">Collector Office</option>
          <option value="Corporation / NagarPalika">
            Corporation / NagarPalika
          </option>
          <option value="Grampanchayat">Grampanchayat</option>
        </select>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
        <Stat label="Total Revenue" value={totals.revenue} />
        <Stat label="Allocated" value={totals.allocated} />
        <Stat label="Utilized" value={totals.utilized} />
        <Stat label="Remaining" value={totals.remaining} />
        <Stat label="Sanctioned" value={totals.sanctioned} />
        <Stat label="Pending (Activities)" value={totals.pending} />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr className="[&>th]:px-5 [&>th]:py-3 text-left">
              <th>Role</th>
              <th>FY</th>
              <th>Total</th>
              <th>Allocated</th>
              <th>Utilized</th>
              <th>Remaining</th>
              <th>Revenue Doc</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r._id} className="border-t [&>td]:px-5 [&>td]:py-3">
                <td>{r.role}</td>
                <td>{r.financialYear}</td>
                <td>₹{r.totalRevenue.toLocaleString("en-IN")}</td>
                <td>₹{r.allocatedAmount.toLocaleString("en-IN")}</td>
                <td>₹{r.utilizedAmount.toLocaleString("en-IN")}</td>
                <td>₹{r.remainingAmount.toLocaleString("en-IN")}</td>
                <td>
                  <a
                    href={`${import.meta.env.VITE_FILE_BASE_URL}/${r.attachmentUrl}`}
                    // href={`http://localhost:5000${r.attachmentUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 font-semibold"
                  >
                    View
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading && (
          <div className="p-6 text-center text-gray-500">Loading…</div>
        )}
      </div>
    </div>
  );
}

/* ================= CARD ================= */
function Stat({ label, value }) {
  return (
    <div className="bg-white rounded-xl border p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-bold text-gray-800">
        ₹{Number(value).toLocaleString("en-IN")}
      </p>
    </div>
  );
}
