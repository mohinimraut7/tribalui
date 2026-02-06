import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";

export default function RevenueAllocationDisburseAmount() {
  const location = useLocation();
  const navigate = useNavigate();

  const financialYear = location.state?.financialYear;

  const [sanctionedOrderNo, setSanctionedOrderNo] = useState("");
  const [activity, setActivity] = useState(null);
  const [revenueId, setRevenueId] = useState(null);

  const [disburseAmount, setDisburseAmount] = useState("");
  const [billUcUpload, setBillUcUpload] = useState(null);
  const [loading, setLoading] = useState(false);

  // ================= SEARCH SANCTIONED ORDER =================
  const handleSearch = async () => {
    if (!sanctionedOrderNo) {
      alert("Sanctioned Order No टाका");
      return;
    }

    try {
      const res = await axiosInstance.get(
        `/revenue/${encodeURIComponent(sanctionedOrderNo)}`
      );

      // backend returns ARRAY
      const firstMatch = res.data.data[0];

      setActivity(firstMatch.activity);
      setRevenueId(firstMatch.revenueId);
    } catch (err) {
      alert("हा Sanctioned Order No सापडला नाही ❌");
      setActivity(null);
      setRevenueId(null);
    }
  };

  // ================= DISBURSE AMOUNT =================
  const handleDisburse = async () => {
    if (!disburseAmount) {
      alert("Disburse amount टाका");
      return;
    }

    if (Number(disburseAmount) > activity.pendingAmount) {
      alert("Pending पेक्षा जास्त amount चालणार नाही ❌");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("amountSpent", disburseAmount);
      if (billUcUpload) {
        formData.append("billUcUpload", billUcUpload);
      }


      await axiosInstance.put(
        `/revenue/activity/${encodeURIComponent(
          sanctionedOrderNo
        )}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      alert("Amount disbursed successfully ✅");
      navigate(-1);
    } catch (err) {
      alert("Server error ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="bg-white rounded-2xl shadow border p-6 max-w-xl mx-auto">
        <h1 className="text-xl font-bold text-gray-800 mb-1">
          Disburse Amount
        </h1>

        <p className="text-xs text-gray-500 mb-4">
          Financial Year: <b>{financialYear}</b>
        </p>

        {/* ================= SEARCH ================= */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">
            Sanctioned Order No
          </label>

          <div className="flex gap-2">
            <input
              value={sanctionedOrderNo}
              onChange={(e) => setSanctionedOrderNo(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg"
              placeholder="aa/11/123"
            />

            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Search
            </button>
          </div>
        </div>

        {/* ================= ACTIVITY DETAILS ================= */}
        {activity && (
          <>
            <div className="bg-gray-50 border rounded-xl p-4 mb-4 space-y-1">
              <p className="text-sm">
                <b>Sanctioned:</b>{" "}
                ₹ {activity.amountSanctioned.toLocaleString("en-IN")}
              </p>

              {/* <p className="text-sm">
                <b>Spent:</b>{" "}
                ₹ {activity.amountSpent.toLocaleString("en-IN")}
              </p>

              <p className="text-sm font-semibold text-green-700">
                Pending: ₹ {activity.pendingAmount.toLocaleString("en-IN")}
              </p> */}
              <p className="text-sm">
                <b>Subject:</b>{" "}
                ₹ {activity.vendorBeneficiaryDetails}
              </p>
            </div>

            {/* ================= DISBURSE ================= */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Disburse Amount
                </label>
                <input
                  type="number"
                  value={disburseAmount}
                  onChange={(e) => setDisburseAmount(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">
                  Upload Bill / UC
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.png"
                  onChange={(e) =>
                    setBillUcUpload(e.target.files?.[0] || null)
                  }
                />
              </div>

              <button
                disabled={loading}
                onClick={handleDisburse}
                className={`w-full py-2 rounded-lg text-white font-semibold ${
                  loading
                    ? "bg-gray-400"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {loading ? "Processing..." : "Disburse Amount"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
