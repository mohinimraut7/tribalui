import React, { useState, useEffect } from "react";
import { useParams, useNavigate,useLocation  } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";
import { toast } from "react-toastify";



export default function AddRevenueActivity() {
  const { revenueId } = useParams();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activities, setActivities] = useState([]);


  const [form, setForm] = useState({
    sanctionedOrderNo: "",
    sanctionedOrderDate: "",
    amountSanctioned: 0,
    amountSpent: 0,
      activityName: "",            // ✅ ADD THIS
    vendorBeneficiaryDetails: "",
    billUcUpload: null,
  });

  const [leftoverAmount, setLeftoverAmount] = useState(0);

  const todayDate = new Date().toLocaleDateString("en-GB");

  const location = useLocation();
  // console.log("ocation.state",location.state)
const financialYear = location.state?.financialYear;


  // ---------- Auto Calculate Leftover ----------
  useEffect(() => {
    const sanctioned = Number(form.amountSanctioned || 0);
    const spent = Number(form.amountSpent || 0);

    if (sanctioned && spent) {
      const left = sanctioned - spent;
      setLeftoverAmount(left >= 0 ? left : 0);
    } else {
      setLeftoverAmount(0);
    }
  }, [form.amountSanctioned, form.amountSpent]);


  useEffect(() => {
  const fetchActivities = async () => {
    try {
      const res = await axiosInstance.get("/revenue");

      const matchedRevenue = res.data.data.find(
        (item) => String(item._id) === String(revenueId)
      );

      console.log("Matched revenue:", matchedRevenue);

      if (matchedRevenue && Array.isArray(matchedRevenue.activities)) {
        setActivities(matchedRevenue.activities);
      } else {
        setActivities([]);
      }
    } catch (err) {
      console.error("Error fetching activities", err);
    }
  };

  fetchActivities();
}, [revenueId]);


  // ---------- Handle Input Change ----------
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm({ ...form, [name]: files ? files[0] : value });
  };

  const isOverSpent = Number(form.amountSpent) > Number(form.amountSanctioned);

  // ---------- Save Handler ----------
  const handleSave = async () => {
    const {
      sanctionedOrderNo,
      sanctionedOrderDate,
      amountSanctioned,
      // amountSpent,
      billUcUpload,
    } = form;

    if (
      !sanctionedOrderNo ||
      !sanctionedOrderDate ||
      !amountSanctioned 
      // !amountSpent
    ) {
      // alert("Please fill all required fields ❌");
      toast.warning("Please fill all required fields ❌");

      return;
    }

    // if (Number(amountSpent) > Number(amountSanctioned)) {
    //   toast.warning("Please fill all required fields ❌");
    //   return;
    // }

    if (!billUcUpload) {
      // alert("Please upload Bill / UC document ✅");
      toast.warning("Please upload Bill / UC document ❌");

      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("revenueId", revenueId);
      formData.append("sanctionedOrderNo", sanctionedOrderNo);
      formData.append("sanctionedOrderDate", sanctionedOrderDate);
      formData.append("amountSanctioned", amountSanctioned);
      formData.append("amountSpent",0);
      formData.append(
        "vendorBeneficiaryDetails",
        form.vendorBeneficiaryDetails,
      );
      formData.append("billUcUpload", billUcUpload);
      formData.append("leftoverAmount",0);

      await axiosInstance.post("/revenue/addActivity", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // alert("Activity saved successfully ✅");
      toast.success("Activity saved successfully ✅");

      navigate("/revenue-allocation");
    } 
    // catch (error) {
    //   alert("Failed to save activity ❌");
    // } 
    catch (error) {
  const msg =
    error?.response?.data?.message ||
    "Failed to save activity ❌";

  toast.error(msg);
}

    finally {
      setLoading(false);
    }
  };



  // financialYear = "2025-26"
const getDateRangeFromFY = (fy) => {
  if (!fy) return {};

  const [startYear, endYearShort] = fy.split("-");
  const start = `${startYear}-04-01`;        // 1 April
  const end = `20${endYearShort}-03-31`;      // 31 March

  return { start, end };
};

const { start: minDate, end: maxDate } =
  getDateRangeFromFY(financialYear);


  // ================= UI =================

  return (
    <div className="p-6 bg-gray-50 min-h-full relative">
      {/* ================= PAGE HEADER ================= */}
      {/* <div className="bg-white rounded-2xl shadow-sm border p-5">
        <h1 className="text-xl font-bold text-gray-800">Revenue Activity</h1>
        <p className="text-sm text-gray-500 mt-1">
          Add sanctioned & expenditure details
        </p>
      </div> */}
      <div className="bg-white rounded-2xl shadow-sm border p-5 flex justify-between items-center">
  <div>
    <h1 className="text-xl font-bold text-gray-800">Revenue Activity</h1>
    <p className="text-sm text-gray-500 mt-1">
      Add sanctioned & expenditure details
    </p>
  </div>

  <button
    onClick={() => setOpen(true)}
    className="px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
  >
    + Add Activity
  </button>
</div>

{/* ================= ACTIVITIES TABLE ================= */}
{/* ================= ACTIVITIES TABLE ================= */}
<div className="mt-6 bg-white rounded-2xl shadow-sm border">
  <div className="px-5 py-4 border-b">
    <h2 className="text-lg font-bold text-gray-800">
      Activity History
    </h2>
  </div>

  {activities.length === 0 ? (
    <div className="p-6 text-center text-gray-500">
      No activities found
    </div>
  ) : (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-100">
          <tr className="[&>th]:py-2 [&>th]:px-5">
            <th className="text-left">Order No</th>
            <th className="text-left">Order Date</th>
              <th className="text-left">Subject</th>
            <th className="text-left">Sanctioned Amt.</th>
            <th className="text-left">Disburse Amount</th>
            <th className="text-left">Pending Amount</th>
            <th className="text-left">Details</th>
            <th className="text-left">Bill</th>
          </tr>
        </thead>

        <tbody>
          {activities.map((act) => (
            <tr key={act._id} className="border-t [&>td]:p-5">
              <td className="text-left">{act.sanctionedOrderNo}</td>
              <td className="text-left">
                {new Date(act.sanctionedOrderDate).toLocaleDateString("en-GB")}
              </td>
               <td className="text-left">
                {act.vendorBeneficiaryDetails}
              </td>
              <td className="text-left">
                ₹{act.amountSanctioned}
              </td>
              <td className="text-left">
                ₹{act.amountSpent}
              </td>
              <td className="text-left">
                ₹{act.pendingAmount}
              </td>
              <td className="text-left">
                {act.vendorBeneficiaryDetails}
              </td>
              <td className="text-left">
                <a
                  // href={`http://localhost:5000/${act.billUcUpload}`}
                    href={`${import.meta.env.VITE_FILE_BASE_URL}/${act.billUcUpload}`}
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
    </div>
  )}
</div>



      {/* ================= MODAL ================= */}
      {open && (
        <div className="fixed inset-0 bg-black/40 z-50 px-4 overflow-y-auto">
          <div className="min-h-screen flex items-center justify-center py-10">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl max-h-[90vh] flex flex-col">
              {/* HEADER */}
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">
                    Add Revenue Activity
                  </h2>
                  <p className="text-sm text-gray-500">
                    Record sanctioned & spent details
                  </p>
                </div>

                <button
                //   onClick={() => navigate(-1)}
                onClick={() => setOpen(false)}

                  className="text-gray-500 hover:text-gray-800 text-xl"
                >
                  ✕
                </button>
              </div>

              {/* BODY (SCROLLABLE) */}
              <div className="p-6 space-y-5 overflow-y-auto flex-1">
                {/* <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 border">
                  <span className="text-sm text-gray-600">Date</span>
                  <span className="text-sm font-semibold text-gray-800">
                    {todayDate}
                  </span>
                </div> */}
               

                
                   

{financialYear && (
  <div className="mb-4 px-5 py-3 rounded-xl border-2 border-blue-200 bg-blue-50">
    <p className="text-lg font-extrabold text-gray-900">
      Financial Year:
      <span className="ml-3 text-blue-900 text-2xl font-extrabold">
        {financialYear}
      </span>
    </p>

    <p className="text-sm font-semibold text-gray-700 mt-2">
      Allowed Date Range:
      <span className="ml-2 font-bold text-gray-900 text-base">
        {minDate} to {maxDate}
      </span>
    </p>
  </div>
)}


             
                <div>
  <label className="block text-sm font-semibold text-gray-700 mb-1">
    Sanctioned Order Date
  </label>

  <input
    type="date"
    name="sanctionedOrderDate"
    value={form.sanctionedOrderDate}
    onChange={handleChange}
    min={minDate}      // ✅ FY start
    max={maxDate}      // ✅ FY end
    className="w-full px-4 py-3 border rounded-xl outline-none"
  />
</div>

<div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Sanctioned Order No
                  </label>
                  <input
                    name="sanctionedOrderNo"
                    value={form.sanctionedOrderNo}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-xl outline-none"
                    placeholder="Enter order number"
                  />
                </div>


                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Amount Sanctioned (₹)
                    </label>
                    <input
                      type="number"
                      name="amountSanctioned"
                      value={form.amountSanctioned}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border rounded-xl outline-none"
                      min="0"
                    />
                  </div>

                   <div>
  <label className="block text-sm font-semibold text-gray-700 mb-1">
    Subject
  </label>
  <input
    type="text"
    name="activityName"
    value={form.activityName}
    onChange={handleChange}
    placeholder="Enter name"
    className="w-full px-4 py-3 border rounded-xl outline-none"
  />
</div>

                
                </div>

                

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Details
                  </label>
                  <textarea
                    name="vendorBeneficiaryDetails"
                    value={form.vendorBeneficiaryDetails}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-xl outline-none h-24"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Bill / UC Upload
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    name="billUcUpload"
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-xl bg-white"
                  />
                </div>
              </div>

              {/* FOOTER */}
              <div className="px-6 py-4 border-t flex justify-end gap-3">
                <button
                //   onClick={() => navigate(-1)}
                  onClick={() => setOpen(false)}
                  className="px-5 py-2 rounded-xl border text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSave}
                  disabled={loading || isOverSpent}
                  className={`px-6 py-2 rounded-xl text-white font-semibold ${
                    loading || isOverSpent
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {loading ? "Saving..." : "Save Activity"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ======================================== */}
    </div>
  );
}
