import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/slices/authSlice";
import { FiChevronLeft, FiMenu } from "react-icons/fi";


export default function Sidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // open | collapsed | hidden
  const [mode, setMode] = useState("open");

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  // toggle cycle
  const toggleSidebar = () => {
    if (mode === "open") setMode("collapsed");
    else if (mode === "collapsed") setMode("hidden");
    else setMode("open");
  };

  
const linkClass = ({ isActive }) =>
  `flex items-center gap-2 px-4 py-3 font-medium transition-all
   ${
     isActive
       ? "text-blue-600"
       : "text-gray-700"
   }`;


  /* ==============================
     Hidden Mode — Floating Button
  ============================== */
  if (mode === "hidden") {
    return (
      <>
        <button
          onClick={() => setMode("open")}
          className="fixed top-5 left-3 z-50 bg-blue-600 text-white px-3 py-2 rounded-md shadow-md hover:bg-blue-700 transition"
        >
          ☰
        </button>
      </>
    );
  }

  return (
    <aside
      className={`${
        mode === "open" ? "w-[250px]" : "w-[80px]"
      } min-h-screen bg-white border-r shadow-lg flex flex-col transition-all duration-300 overflow-hidden`}
    >
      {/* Header */}
      <div className="px-4 pt-6 pb-5 border-b flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          
         

<div
  className={`
    h-12 w-12 rounded-2xl
    flex items-center justify-center text-xl
    ${
      mode === "collapsed"
        ? "bg-transparent text-blue-600 shadow-none"
        : "bg-transparent text-blue-600 shadow-none sm:bg-gradient-to-r sm:from-blue-600 sm:to-indigo-600 sm:text-white sm:shadow-md"
    }
  `}
>
  ₹
</div>



          {mode === "open" && (
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                Fund Tracker
              </h2>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          )}
        </div>

        <button
          onClick={toggleSidebar}
          className="text-gray-600 hover:text-black"
        >
          {mode === "open" && <FiChevronLeft size={28} strokeWidth={3}/>}
          {mode === "collapsed" && "❌"}
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-2 py-6 flex flex-col gap-2">
        <NavLink to="/dashboard" className={linkClass}>
          <span className="text-lg">🏠</span>
          {mode === "open" && <span>Dashboard</span>}
        </NavLink>
        <NavLink to="/revenue-allocation" className={linkClass}>
    <span className="text-lg">💰</span>
    {mode === "open" && <span>Revenue</span>}
  </NavLink>
    <NavLink to="/revenue-allocation-disburse" className={linkClass}>
    <span className="text-lg">💸</span>
    {mode === "open" && <span>Disburse</span>}
  </NavLink>
      </nav>
       

      {/* Profile */}
      {mode === "open" && (
        <div className="p-4 border-t">
          <div className="bg-gray-50 rounded-2xl p-4 mb-3 shadow-sm">
            <p className="text-sm font-semibold text-gray-800">
              {user?.fullName || user?.userName || "User"}
            </p>

            <p className="text-xs text-gray-500 mt-1">
              Role: <b>{user?.role}</b>
            </p>

            {user?.departmentName && (
              <p className="text-xs text-gray-500 mt-1">
                Dept: <b>{user.departmentName}</b>
              </p>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="w-full bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      )}
    </aside>
  );
}
