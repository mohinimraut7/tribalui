import React, { useEffect, useState } from "react";
import axiosInstance from "../services/axiosInstance";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function RevenueAllocation() {
  const [open, setOpen] = useState(false);
  const [totalRevenue, setTotalRevenue] = useState("");

  const [departmentName, setDepartmentName] = useState("");
  const [attachment, setAttachment] = useState(null);

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  const [role, setRole] = useState("");
  const [financialYear, setFinancialYear] = useState("");

  // ✅ store all revenues
  const [revenues, setRevenues] = useState([]);
  const [orderNo, setOrderNo] = useState("");
  

  const navigate = useNavigate();

  useEffect(() => {
    const savedRole = localStorage.getItem("userRole");
    setRole(savedRole || "Collector Office");
  }, []);

  const userrole = localStorage.getItem("userRole");


  const user = JSON.parse(localStorage.getItem("authUser"));






  /* ===============================
      FETCH ALL REVENUE
  =============================== */
  const fetchRevenues = async () => {
    try {
      setPageLoading(true);

      const res = await axiosInstance.get("/revenue");
      const data = Array.isArray(res.data) ? res.data : res.data?.data;

      if (data?.length) {
        const roleWiseData = data
          .filter((r) => r.role === role)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setRevenues(roleWiseData);
      } else {
        setRevenues([]);
      }
    } catch (err) {
      console.log("GET revenue error:", err);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    if (role) fetchRevenues();
  }, [role]);

  /* ===============================
      SAVE REVENUE
  =============================== */
  const handleSave = async () => {
    // if (!financialYear) return alert("Please select Financial Year");
    // if (!departmentName) return alert("Enter department name");
    // if (!totalRevenue) return alert("Enter total revenue");
    // if (!attachment) return alert("Attach document");


if (!financialYear) return toast.error("Please select Financial Year");
if (!departmentName) return toast.error("Enter department name");
if (!totalRevenue) return toast.error("Enter total revenue");
if (!attachment) return toast.error("Attach document");


    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("orderNo",orderNo);
        formData.append("totalRevenue", Number(totalRevenue));
      formData.append("departmentName", departmentName);
      formData.append("financialYear", financialYear);
      formData.append("role", role);
      formData.append("attachment", attachment);

      const res = await axiosInstance.post("/addRevenue", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (!res.data?.success) {
        toast.error("Something went wrong");
        return;
      }

      toast.success("Revenue added successfully ✅");

      setOpen(false);
      setTotalRevenue("");
      setDepartmentName("");
      setAttachment(null);

      fetchRevenues(); // refresh list
    } catch (err) {
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
      FINANCIAL YEARS
  =============================== */
  const getFinancialYears = (count = 10) => {
    const years = [];
    const today = new Date();
    const year = today.getFullYear();
    const startYear = today.getMonth() >= 3 ? year : year - 1;

    for (let i = 0; i < count; i++) {
      const fyStart = startYear - i;
      const fyEnd = (fyStart + 1).toString().slice(-2);
      years.push(`${fyStart}-${fyEnd}`);
    }
    return years;
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-full">
      
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border p-4 flex flex-col sm:flex-row sm:justify-between gap-3">
        <h1 className="text-xl font-bold text-gray-800">
          Revenue Allocation
        </h1>

        {/* {userrole !== "Super Admin" && ( */}
          <button
            onClick={() => setOpen(true)}
            className="px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold w-full sm:w-auto"
          >
            + Add Revenue
          </button>
        {/* )} */}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border mt-6 overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-gray-50 text-xs uppercase">
            <tr>
              {/* <th className="px-3 sm:px-6 py-3 text-left">Order No.</th> */}
              <th className="px-3 sm:px-6 py-3 text-left">Order No.</th>
              <th className="px-3 sm:px-6 py-3 text-left">Department</th>
              <th className="px-3 sm:px-6 py-3 text-left">Financial Year</th>
              <th className="px-3 sm:px-6 py-3 text-left">Total</th>
              <th className="px-3 sm:px-6 py-3 text-left">Document</th>
              {/* <th className="px-3 sm:px-6 py-3 text-left">Action</th> */}
            </tr>
          </thead>

          <tbody>
            {pageLoading ? (
              <tr>
                <td colSpan="5" className="px-6 py-6 text-center">
                  Loading...
                </td>
              </tr>
            ) : revenues.length ? (
              revenues.map((rev) => (
                <tr key={rev._id} className="border-t">
                  <td className="px-6 py-4">
                    {rev.orderNo}
                  </td>
                  <td className="px-6 py-4">
                    {rev.departmentName}
                  </td>

                  <td className="px-6 py-4">
                    {rev.financialYear}
                  </td>

                  <td className="px-6 py-4">
                    ₹ {Number(rev.totalRevenue).toLocaleString("en-IN")}
                  </td>

                  <td className="px-6 py-4">
                    <a
                      href={rev.attachmentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline"
                    >
                      {rev.attachmentName}
                    </a>
                  </td>

                  {/* <td className="px-6 py-4">
                    <button
                      className="px-4 py-1.5 bg-blue-600 text-white rounded"
                      onClick={() =>
                        navigate(`/revenue/${rev._id}/activity`, {
                          state: { financialYear: rev.financialYear },
                        })
                      }
                    >
                      View / Add Activity
                    </button>
                  </td> */}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-6 text-center">
                  No revenue found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl p-4 sm:p-6 space-y-4 mx-3">

            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">Add Revenue</h2>
              <button onClick={() => setOpen(false)}>✕</button>
            </div>
               <input
          value={orderNo}
          onChange={(e) => setOrderNo(e.target.value)}
          className="w-full border px-4 py-2 rounded-lg"
          placeholder="Order No."
        />



<div className="w-full">
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Department
  </label>

  <input
    type="text"
    value={user?.departmentName || ""}
    disabled
    className="w-full px-3 py-2 border rounded-md bg-gray-100 text-gray-700 cursor-not-allowed"
  />
</div>





            <select
              value={financialYear}
              onChange={(e) => setFinancialYear(e.target.value)}
              className="w-full border px-4 py-3 rounded-xl"
            >
              <option value="">Select Financial Year</option>
              {getFinancialYears().map((fy) => (
                <option key={fy}>{fy}</option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Total Revenue"
              value={totalRevenue}
              onChange={(e) => setTotalRevenue(e.target.value)}
              className="w-full border px-4 py-3 rounded-xl"
            />

            <input
              type="file"
              onChange={(e) => setAttachment(e.target.files[0])}
            />

            <button
              onClick={handleSave}
              className="w-full bg-blue-600 text-white py-3 rounded-xl"
            >
              Save Revenue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

