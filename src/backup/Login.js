 import React, { useState } from "react";
  import { useDispatch } from "react-redux";
  import { loginSuccess } from "../redux/slices/authSlice";
  import { useNavigate } from "react-router-dom";
  import collectorData from "../data/collectorOffices.json";

  export default function Login() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [form, setForm] = useState({
      role: "collector",
      username: "",
      password: "",
      region: "", // ✅ collector role साठी
      collectorOffice: "", // ✅ district (collector role साठी)
      corporationDistrict: "", // ✅ corporation role साठी (district)
      municipality: "", // ✅ corporation role साठी (municipality/corporation)
    });

    const handleChange = (e) => {
      setForm({ ...form, [e.target.name]: e.target.value });
    };

    // ✅ Unique Regions (collector role साठी)
    const regions = [
      ...new Set(collectorData.collectorOffices.map((o) => o.region)),
    ];

    // ✅ Filter offices by selected region (collector role साठी)
    const filteredOffices = collectorData.collectorOffices.filter(
      (o) => o.region === form.region
    );

    // ✅ All districts (corporation role साठी)
    const districts = collectorData.collectorOffices.map((o) => o.district);

    // ✅ Corporation role: selected district object
    const selectedDistrictObj = collectorData.collectorOffices.find(
      (o) => o.district === form.corporationDistrict
    );

    // ✅ Corporation role: municipalities list
    const municipalityList = selectedDistrictObj?.municipalities || [];

    // const handleLogin = async (e) => {
    //   e.preventDefault();

    //   if (!form.password) {
    //     alert("Password टाका ✅");
    //     return;
    //   }

    //   // ✅ Collector validation
    //   if (form.role === "collector" && !form.region) {
    //     alert("Region निवडा ✅");
    //     return;
    //   }
    //   if (form.role === "collector" && !form.collectorOffice) {
    //     alert("Collector Office निवडा ✅");
    //     return;
    //   }

    //   // ✅ Corporation validation
    //   if (form.role === "corporation" && !form.corporationDistrict) {
    //     alert("District निवडा ✅");
    //     return;
    //   }
    //   if (form.role === "corporation" && !form.municipality) {
    //     alert("Corporation / NagarPalika निवडा ✅");
    //     return;
    //   }

    //   // 🔁 Role mapping (UI → Backend)
    //   const roleMap = {
    //     collector: "Collector Office",
    //     corporation: "Corporation / NagarPalika",
    //     grampanchayat: "Grampanchayat",
    //   };

    //   try {
    //     const res = await fetch("http://localhost:3001/login", {
    //       method: "POST",
    //       headers: {
    //         "Content-Type": "application/json",
    //       },
    //       body: JSON.stringify({
    //         role: roleMap[form.role],
    //         password: form.password,
    //       }),
    //     });

    //     const data = await res.json();

    //     if (data.success) {
    //       dispatch(
    //         loginSuccess({
    //           name: data.user.name,
    //           role: data.user.role,

    //           // ✅ collector role info
    //           region: form.region,
    //           collectorOffice: form.collectorOffice,

    //           // ✅ corporation role info
    //           corporationDistrict: form.corporationDistrict,
    //           municipality: form.municipality,
    //         })
    //       );
    //       navigate("/dashboard");
    //     } else {
    //       alert(data.message || "Login failed");
    //     }
    //   } catch (error) {
    //     alert("Server error. JSON Server चालू आहे का?");
    //   }
    // };

    
    const handleLogin = async (e) => {
    e.preventDefault();

    if (!form.password) {
      alert("Password टाका ✅");
      return;
    }

    // ✅ Collector validation
    if (form.role === "collector" && !form.region) {
      alert("Region निवडा ✅");
      return;
    }
    if (form.role === "collector" && !form.collectorOffice) {
      alert("Collector Office निवडा ✅");
      return;
    }

    // ✅ Corporation validation
    if (form.role === "corporation" && !form.corporationDistrict) {
      alert("District निवडा ✅");
      return;
    }
    if (form.role === "corporation" && !form.municipality) {
      alert("Corporation / NagarPalika निवडा ✅");
      return;
    }

    const roleMap = {
      collector: "Collector Offic",
      corporation: "Corporation / NagarPalika",
      grampanchayat: "Grampanchayat",
    };

    try {
      // ✅ Step 1: Login API
      const res = await fetch("http://localhost:3001/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: roleMap[form.role],
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Login failed");
        return;
      }

      // ✅ Step 2: role wise payload तयार कर
      let updatePayload = {};

      if (form.role === "collector") {
        updatePayload = {
          region: form.region,
          collectorOffice: form.collectorOffice,
        };
      }

      if (form.role === "corporation") {
        updatePayload = {
          district: form.corporationDistrict,
          municipality: form.municipality,
        };
      }
      
      

      // ✅ Step 3: user update in db.json (store)
      await fetch(`http://localhost:3001/users/${data.user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload),
      });

      // ✅ Step 4: redux store
      dispatch(
        loginSuccess({
          name: data.user.name,
          role: data.user.role,

          // collector role info
          region: form.region,
          collectorOffice: form.collectorOffice,

          // corporation role info
          corporationDistrict: form.corporationDistrict,
          municipality: form.municipality,
        })
      );

      navigate("/dashboard");
    } catch (error) {
      alert("Server error. JSON Server चालू आहे का?");
    }
  };

    
    
    
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 px-4">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 text-center">
            Fund Allocation Tracker ✅
          </h1>
          <p className="text-center text-gray-500 mt-2">Login to continue</p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            {/* Role */}
            <div>
              <label className="text-sm font-semibold text-gray-600">
                Select Role
              </label>
              <select
                name="role"
                value={form.role}
                onChange={(e) => {
                  handleChange(e);

                  // ✅ role change झाल्यावर reset
                  if (e.target.value === "collector") {
                    setForm((prev) => ({
                      ...prev,
                      corporationDistrict: "",
                      municipality: "",
                    }));
                  } else if (e.target.value === "corporation") {
                    setForm((prev) => ({
                      ...prev,
                      region: "",
                      collectorOffice: "",
                    }));
                  } else {
                    // grampanchayat
                    setForm((prev) => ({
                      ...prev,
                      region: "",
                      collectorOffice: "",
                      corporationDistrict: "",
                      municipality: "",
                    }));
                  }
                }}
                className="w-full mt-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
              >
                <option value="collector">Collector Office</option>
                <option value="corporation">Corporation / NagarPalika</option>
                <option value="grampanchayat">Grampanchayat</option>
              </select>
            </div>

            {/* ✅ Collector: Region Dropdown */}
            {form.role === "collector" && (
              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Select Region
                </label>
                <select
                  name="region"
                  value={form.region}
                  onChange={(e) => {
                    handleChange(e);

                    // ✅ region change झाला की office reset
                    setForm((prev) => ({
                      ...prev,
                      collectorOffice: "",
                    }));
                  }}
                  className="w-full mt-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
                >
                  <option value="">-- Select Region --</option>
                  {regions.map((region, index) => (
                    <option key={index} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* ✅ Collector: Offices Dropdown (Region select केल्यानंतर) */}
            {form.role === "collector" && form.region && (
              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Select Collector Office
                </label>

                <select
                  name="collectorOffice"
                  value={form.collectorOffice}
                  onChange={handleChange}
                  className="w-full mt-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
                >
                  <option value="">-- Select Office --</option>

                  {filteredOffices.map((office, index) => (
                    <option key={index} value={office.district}>
                      {office.district}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* ✅ Corporation / Nagarpalika: District Dropdown */}
            {form.role === "corporation" && (
              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Select District
                </label>
                <select
                  name="corporationDistrict"
                  value={form.corporationDistrict}
                  onChange={(e) => {
                    handleChange(e);

                    // ✅ district change झाला की municipality reset
                    setForm((prev) => ({
                      ...prev,
                      municipality: "",
                    }));
                  }}
                  className="w-full mt-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
                >
                  <option value="">-- Select District --</option>
                  {districts.map((dist, index) => (
                    <option key={index} value={dist}>
                      {dist}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* ✅ Corporation / Nagarpalika: Municipality Dropdown */}
            {form.role === "corporation" && form.corporationDistrict && (
              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Select Corporation / NagarPalika
                </label>

                <select
                  name="municipality"
                  value={form.municipality}
                  onChange={handleChange}
                  className="w-full mt-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
                >
                  <option value="">-- Select Corporation --</option>

                  {municipalityList.length === 0 ? (
                    <option value="" disabled>
                      No corporation available
                    </option>
                  ) : (
                    municipalityList.map((m, index) => (
                      <option key={index} value={m.name}>
                        {m.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
            )}

            {/* Username */}
            <div>
              <label className="text-sm font-semibold text-gray-600">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Enter username"
                className="w-full mt-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-semibold text-gray-600">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter password"
                className="w-full mt-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
            >
              Login
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-6">
            © {new Date().getFullYear()} Fund Tracker System
          </p>
        </div>
      </div>
    );
  }
