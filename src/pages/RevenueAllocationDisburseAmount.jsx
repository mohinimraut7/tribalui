import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";
import { FiSearch, FiRefreshCw } from "react-icons/fi";
import { toast } from "react-toastify";
import Loader from "../components/common/Loader";


/* ---------- FY HELPER ---------- */
const getFinancialYears = () => {
  const years = [];
  const currentYear = new Date().getFullYear();
  const fyStart =
    new Date().getMonth() >= 3 ? currentYear : currentYear - 1;

  for (let i = 0; i < 10; i++) {
    const start = fyStart - i;
    const end = (start + 1).toString().slice(-2);
    years.push(`${start}-${end}`);
  }

  return years;
};

const getDateRangeFromFY = (fy) => {
  if (!fy) return {};

  const [startYear, endShort] = fy.split("-");
  const endYear = "20" + endShort;

  return {
    startDate: `${startYear}-04-01`,
    endDate: `${endYear}-03-31`,
  };
};

export default function RevenueAllocationDisburseAmount() {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  /* ---------- STATES ---------- */
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);

  const [openModal, setOpenModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);

  const [disburseAmount, setDisburseAmount] = useState("");
  const [activityName, setActivityName] = useState("");
  const [billUcUpload, setBillUcUpload] = useState(null);
  const [loading, setLoading] = useState(false);

  const [openAddActivityModal, setOpenAddActivityModal] = useState(false);

  const [orderDate, setOrderDate] = useState("");
  const [orderNo, setOrderNo] = useState("");
  const [amountSanctioned, setAmountSanctioned] = useState("");
  const [subject, setSubject] = useState("");
  const [details, setDetails] = useState("");
  const [billUpload, setBillUpload] = useState(null);
    const [attachment, setAttachment] = useState(null);

  const [disburseDate, setDisburseDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  /* ---------- FINANCIAL YEAR ---------- */
  const financialYears = getFinancialYears();
  const locationFY = location.state?.financialYear;

  const [financialYear, setFinancialYear] = useState(
    locationFY || financialYears[0]
  );

const [isFyFromOrder, setIsFyFromOrder] = useState(false);

  const [filterFY, setFilterFY] = useState("All");
const [searchOrderNo, setSearchOrderNo] = useState("");

const [debounceTimer, setDebounceTimer] = useState(null);

const [excelFile, setExcelFile] = useState(null);


  const { startDate, endDate } = getDateRangeFromFY(financialYear);


// const handleOrderNoChange = async (value) => {
//   setOrderNo(value);

//   if (!value || value.length < 3) {
//     setIsFyFromOrder(false);
//     return;
//   }

//   try {
//     const res = await axiosInstance.get(
//       `/revenue/fy/${encodeURIComponent(value)}`
//     );

//     if (res.data?.financialYear) {
//       setFinancialYear(res.data.financialYear);
//       setIsFyFromOrder(true);
//     } else {
//       setIsFyFromOrder(false);
//       toast.error("Financial year not found. Please add revenue first.");

//       // ✅ close modal
//       setOpenAddActivityModal(false);
//       return;
//     }
//   } catch (err) {
//     setIsFyFromOrder(false);
//     toast.error("Financial year not found. Please add revenue first.");

//     // ✅ close modal
//     setOpenAddActivityModal(false);
//     return;
//   }
// };

  

const handleOrderNoChange = async (value) => {
  setOrderNo(value);

  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  const timer = setTimeout(async () => {

    if (!value || value.length < 3) {
      setIsFyFromOrder(false);
      return;
    }

    try {
      const res = await axiosInstance.get(
        `/revenue/fy/${encodeURIComponent(value)}`
      );

      if (res.data?.financialYear) {
        setFinancialYear(res.data.financialYear);
        setIsFyFromOrder(true);
      } else {
        setIsFyFromOrder(false);
        toast.error("Financial year not found. Please add revenue first.");

        // ✅ close modal
        setOpenAddActivityModal(false);
        return;
      }
    } catch (err) {
      setIsFyFromOrder(false);
      toast.error("Financial year not found. Please add revenue first.");

      // ✅ close modal
      setOpenAddActivityModal(false);
      return;
    }

  }, 500); // delay

  setDebounceTimer(timer);
};





/* ---------- RESET DATE IF OUTSIDE FY ---------- */
  useEffect(() => {
    if (orderDate && (orderDate < startDate || orderDate > endDate)) {
      setOrderDate("");
    }
  }, [financialYear]);


  useEffect(() => {
  let filtered = [...activities];

  // FY filter
  if (filterFY !== "All") {
    filtered = filtered.filter(
      (a) => a.financialYear === filterFY
    );
  }

  // Order No filter
  if (searchOrderNo.trim()) {
    filtered = filtered.filter((a) =>
      a.orderNo
        ?.toLowerCase()
        .includes(searchOrderNo.toLowerCase())
    );
  }

  setFilteredActivities(filtered);
}, [filterFY, searchOrderNo, activities]);


  /* ---------- FETCH ---------- */
  useEffect(() => {
    fetchAllActivities();
  }, []);

  const fetchAllActivities = async () => {
    try {
      const res = await axiosInstance.get("/revenue");
      const revenues = res.data.data || [];

      const all = revenues.flatMap((rev) =>
        (rev.activities || []).map((act) => ({
          ...act,
          financialYear: rev.financialYear,
        }))
      );

      setActivities(all);
      setFilteredActivities(all);
    } catch (err) {
      console.log(err);
    }
  };

  /* ---------- LAST ROW CHECK ---------- */
  const isLastRowOfSanction = (list, row) => {
    const sameRows = list.filter(
      (a) =>
        a.sanctionedOrderNo === row.sanctionedOrderNo &&
        a.financialYear === row.financialYear
    );

    return sameRows[sameRows.length - 1]?._id === row._id;
  };

  /* ---------- DISBURSE ---------- */
  const handleDisburse = async () => {
    const amount = Number(disburseAmount);

    if (!amount || amount <= 0) {
      toast.error("Enter valid amount");
      return;
    }

    if (amount > selectedActivity.pendingAmount) {
      toast.error("Amount exceeds pending");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("disburseAmount", amount);
      formData.append("activityName", activityName);
      formData.append("disburseDate", disburseDate);

      if (attachment)
        formData.append("attachment",attachment);

      await axiosInstance.put(
        `/revenue/activity/${encodeURIComponent(
          selectedActivity.orderNo
        )}`,
        formData
      );

      fetchAllActivities();
      setOpenModal(false);
      setDisburseAmount("");
    } finally {
      setLoading(false);
    }
  };



  const handleSaveActivity = async () => {
  try {
    if (!orderDate) {
      toast.error("Please select Order Date");
      return;
    }

    setLoading(true); // ✅ START loader
    const fd = new FormData();

    fd.append("sanctionedOrderDate", orderDate);
    fd.append("orderNo", orderNo);
    fd.append("disburseAmount", disburseAmount);
    fd.append("subject", subject);
    fd.append("details", details);
    fd.append("financialYear", financialYear);

    if (!attachment) {
      toast.error("Attach document");
      return;
    }

    fd.append("attachment", attachment);

    if (excelFile) {
  fd.append("excelFile", excelFile);
}

    await axiosInstance.post("/revenue/activity", fd);

    toast.success("Activity added successfully ✅");

    setOpenAddActivityModal(false);
    fetchAllActivities();

    // reset form
    setOrderDate("");
    setOrderNo("");
    setDisburseAmount("");
    setSubject("");
    setDetails("");
    setAttachment(null);
    setExcelFile(null);   // ✅ add this

  } catch (err) {
    toast.error("Failed to add activity");
  }finally {
    setLoading(false); // ✅ ALWAYS STOP loader
  }
};


const handleClearFilters = () => {
  setSearchOrderNo("");
  setFilterFY("All");
  setFinancialYear(financialYears[0]);
  setFilteredActivities(activities);
};







  /* ---------- UI ---------- */
  return (
<>
{loading && <Loader />}

 <div className="p-6 bg-gray-50 min-h-full">

      {/* <button
        onClick={() => setOpenAddActivityModal(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        + Add Disbursement
      </button> */}
      <div className="flex justify-end">
  <button
    onClick={() => setOpenAddActivityModal(true)}
    className="px-4 py-2 bg-blue-600 text-white rounded-lg"
  >
    + Add Disbursement
  </button>
</div>



<div className="bg-white shadow rounded-xl p-3 mt-4 flex flex-wrap sm:flex-nowrap sm:items-center gap-3">


  <div className="flex items-center border rounded px-2 w-[300px]">
    <FiSearch />
    <input
      placeholder="Search Order No"
      className="p-1 outline-none w-full"
      value={searchOrderNo}
      onChange={(e) => setSearchOrderNo(e.target.value)}
    />
  </div>

  {/* Refresh */}
  {/* <button
    onClick={fetchAllActivities}
    className="p-2 border rounded"
  >
    <FiRefreshCw size={18} />
  </button> */}

<button
  onClick={handleClearFilters}
  className="p-2 border rounded"
  title="Clear Filters"
>
  <FiRefreshCw size={18} />
</button>


  <select
  className="border rounded px-2 py-1 w-[200px]"
  value={financialYear}
  onChange={(e) => {
    setFinancialYear(e.target.value);
    setFilterFY(e.target.value); // ✅ table filter
  }}
>
  {financialYears.map((fy) => (
    <option key={fy}>{fy}</option>
  ))}
</select>

</div>

      <div className="bg-white rounded-2xl shadow border mt-4 overflow-hidden">
  <div className="w-full overflow-x-auto">
    <table className="min-w-max w-full text-sm">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-5 py-3 text-left">FY</th>
          <th className="px-5 py-3 text-left">Order No</th>
          <th className="px-5 py-3 text-left">Subject</th>
           <th className="px-5 py-3 text-left">Details</th>
          <th className="px-5 py-3 text-left">Disburse Amt.</th>
          <th className="px-5 py-3 text-left">Pending</th>
          <th className="px-5 py-3 text-left">Document</th>
        </tr>
      </thead>

      <tbody>
        {filteredActivities.map((a) => (
          <tr key={a._id} className="border-t">
            <td className="px-5 py-3">{a.financialYear}</td>
            <td className="px-5 py-3">{a.orderNo}</td>
            <td className="px-5 py-3">{a.subject || "-"}</td>
            <td className="px-5 py-3">{a.details || "-"}</td>
            <td className="px-5 py-3 text-red-600">
              ₹{a.disburseAmount}
            </td>
            <td className="px-5 py-3 text-green-700 font-semibold">
              ₹{a.pendingAmount}
            </td>
           

<td className="px-6 py-4 space-y-1">



{/* {a.attachmentUrl && (
  <div className="flex items-center gap-2">

  
    <button
      onClick={() => window.open(a.attachmentUrl, "_blank")}
      className="text-blue-600 underline text-left"
    >
      📄 {a.attachmentName}
    </button>

   
    <button
      onClick={async () => {
        try {
          const response = await fetch(a.attachmentUrl);
          const fileBlob = await response.blob();

        
          const blob = new Blob([fileBlob], {
            type: a.attachmentName?.toLowerCase().endsWith(".pdf")
              ? "application/pdf"
              : fileBlob.type,
          });

          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = a.attachmentName; 
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        } catch (err) {
          console.error("Download failed", err);
        }
      }}
      className="text-gray-600 hover:text-black"
      title="Download"
    >
      ⬇
    </button>

  </div>
)} */}

{/* -------------------- */}


{/* {a.attachmentUrl && (
  <div className="flex items-center gap-2">

   
    <button
      onClick={() => {
        const previewUrl = `https://docs.google.com/gview?url=${encodeURIComponent(
          a.attachmentUrl
        )}&embedded=true`;
        window.open(previewUrl, "_blank");
      }}
      className="text-blue-600 underline text-left"
    >
      📄 {a.attachmentName}
    </button>

  
    <button
      onClick={async () => {
        try {
          const response = await fetch(a.attachmentUrl);
          const fileBlob = await response.blob();

          const blob = new Blob([fileBlob], {
            type: "application/pdf",
          });

          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = a.attachmentName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        } catch (err) {
          console.error("Download failed", err);
        }
      }}
      className="text-gray-600 hover:text-black"
      title="Download"
    >
      ⬇
    </button>

  </div>
)} */}

{/* -------------- */}

{a.attachmentUrl && (
  <div className="flex items-center gap-2">

    {/* Preview */}
    <button
      onClick={() => {
        const isPdf = a.attachmentName
          ?.toLowerCase()
          .endsWith(".pdf");

        if (isPdf) {
          // ✅ PDF → Google Viewer
          const previewUrl = `https://docs.google.com/gview?url=${encodeURIComponent(
            a.attachmentUrl
          )}&embedded=true`;
          window.open(previewUrl, "_blank");
        } else {
          // ✅ Image → Direct open
          window.open(a.attachmentUrl, "_blank");
        }
      }}
      className="text-blue-600 underline text-left"
    >
      📄 {a.attachmentName}
    </button>

    {/* Download */}
    <button
      onClick={async () => {
        try {
          const response = await fetch(a.attachmentUrl);
          const fileBlob = await response.blob();

          const blob = new Blob([fileBlob], {
            type: a.attachmentName?.toLowerCase().endsWith(".pdf")
              ? "application/pdf"
              : fileBlob.type,
          });

          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = a.attachmentName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        } catch (err) {
          console.error("Download failed", err);
        }
      }}
      className="text-gray-600 hover:text-black"
      title="Download"
    >
      ⬇
    </button>

  </div>
)}


{/* ------------------------------ */}

{a.excelUrl && (
  <button
    onClick={async () => {
      try {
        const response = await fetch(a.excelUrl);
        const blob = await response.blob();

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = a.excelName;   // ✅ force correct name
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error("Download failed", err);
      }
    }}
    className="block text-green-700 underline text-left"
  >
    📊 {a.excelName}
  </button>
)}



</td>




          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>

      {/* ADD ACTIVITY MODAL */}
      {openAddActivityModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white w-full max-w-xl p-6 rounded-xl">

  <div className="flex justify-between items-center mb-3 w-full">
  <h2 className="font-bold">Add Activity</h2>

  <button
    onClick={() => setOpenAddActivityModal(false)}
    className="text-xl font-bold text-gray-600 hover:text-black"
  >
    ✕
  </button>
</div>

 <input
  placeholder="Order No"
  value={orderNo}
  onChange={(e) => handleOrderNoChange(e.target.value)}
  className="w-full border p-2 mb-2"
/>

            {/* *** */}
           {isFyFromOrder ? (
  <div className="w-full border p-2 mb-2 bg-gray-100">
    {financialYear}
  </div>
) : (
  <select
    className="w-full border p-2 mb-2"
    value={financialYear}
    onChange={(e) => setFinancialYear(e.target.value)}
  >
    {financialYears.map((fy) => (
      <option key={fy}>{fy}</option>
    ))}
  </select>
)}


            <div className="text-sm mb-2">
              Allowed Date Range: {startDate} to {endDate}
            </div>

            <input
              type="date"
              value={orderDate}
              onChange={(e) => setOrderDate(e.target.value)}
              min={startDate}
              max={endDate}
              className="w-full border p-2 mb-2"
            />
            <input
              type="number"
              placeholder="Disburse Amount"
              value={disburseAmount}
              onChange={(e) => setDisburseAmount(e.target.value)}
              className="w-full border p-2 mb-2"
            />

            <input
  placeholder="Subject"
  value={subject}
  onChange={(e) => setSubject(e.target.value)}
  className="w-full border p-2 mb-2"
/>
{/* <input
              type="file"
              onChange={(e) => setAttachment(e.target.files[0])}
            /> */}


<div className="mb-3">
  <label className="block text-sm font-semibold text-gray-700 mb-2">
    Upload Attachment
  </label>

  <input
    type="file"
    onChange={(e) => setAttachment(e.target.files[0])}
    className="w-full text-sm text-gray-600
               file:mr-4 file:py-2 file:px-4
               file:rounded-lg file:border-0
               file:text-sm file:font-semibold
               file:bg-blue-50 file:text-blue-700
               hover:file:bg-blue-100
               cursor-pointer"
  />
</div>



<div className="mb-3">
  <label className="block text-sm font-semibold text-gray-700 mb-2">
    Upload Excel File
  </label>

  <input
    type="file"
    accept=".xls,.xlsx,.csv"
    onChange={(e) => setExcelFile(e.target.files[0])}
    className="w-full text-sm text-gray-600
               file:mr-4 file:py-2 file:px-4
               file:rounded-lg file:border-0
               file:text-sm file:font-semibold
               file:bg-green-50 file:text-green-700
               hover:file:bg-green-100
               cursor-pointer"
  />
</div>




          


<textarea
  placeholder="Details"
  value={details}
  onChange={(e) => setDetails(e.target.value)}
  rows={3}
  className="w-full border p-2 mb-3"
/>

  {/* <button
    onClick={async () => {
      try {


        if (!orderDate) {
        alert("Please select Order Date");
        return;
      }
        const fd = new FormData();

        fd.append("sanctionedOrderDate", orderDate);
        fd.append("orderNo", orderNo);
        fd.append("disburseAmount",disburseAmount);
        fd.append("subject", subject);
        fd.append("details", details);
        fd.append("financialYear", financialYear);

         if (!attachment) return alert("Attach document");
      fd.append("attachment", attachment);

        await axiosInstance.post("/revenue/activity", fd);

        toast.success("Activity added successfully ✅");

        setOpenAddActivityModal(false);
        fetchAllActivities();

        // reset form
        setOrderDate("");
        setOrderNo("");
        setDisburseAmount("");
        setSubject("");
        setDetails("");
        setAttachment(null);


      } catch (err) {
        alert("Failed to add activity");
      }
    }}
    className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
  >
    Save Activity
  </button> */}


<button
  onClick={handleSaveActivity}
  className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
>
  Save Activity
</button>


          </div>
        </div>
      )}

    </div>
</>

    
   
  );
}
