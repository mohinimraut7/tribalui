import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";

import Login from "./pages/Login";
import Registration from "./pages/Registration";
import Dashboard from "./pages/Dashboard";
import RevenueAllocation from "./pages/RevenueAllocation";
import DashboardLayout from "./components/common/DashboardLayout";

import { loginSuccess } from "./redux/slices/authSlice"; // ✅ import
import AddRevenueActivity from "./pages/AddRevenueActivity";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import RevenueAllocationViewSP from "./pages/RevenueAllocationViewSP";
import RevenueAllocationDisburseAmount from "./pages/RevenueAllocationDisburseAmount";

function ProtectedRoute() {
  const { isLoggedIn } = useSelector((state) => state.auth);

  
  const storedUser = localStorage.getItem("authUser");

  
  if (isLoggedIn || storedUser) {
    return <DashboardLayout />;
  }

  return <Navigate to="/" replace />;
}

export default function App() {
  const dispatch = useDispatch();

 
  useEffect(() => {
    const storedUser = localStorage.getItem("authUser");

    if (storedUser) {
      dispatch(loginSuccess(JSON.parse(storedUser)));
    }
  }, [dispatch]);

  return (
    <>
       <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
      />

       <Routes>
      <Route path="/" element={<Navigate to="/login"/>} />
    
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Registration />} />

    
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/revenue-allocation" element={<RevenueAllocation />} />
        {/* <Route path="/revenue-allocation-sp" element={<RevenueAllocationViewSP />} /> */}
   <Route path="/revenue-allocation-disburse" element={<RevenueAllocationDisburseAmount />} />

{/*      
        <Route
        path="/revenue/:revenueId/activity"
       element={<AddRevenueActivity />}
       /> */}



       
        <Route
        path="/revenue/addactivity"
       element={<AddRevenueActivity />}
       />
      </Route>

     
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    
    </>
   
  );
}

