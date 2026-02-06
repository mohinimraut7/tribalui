import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../redux/slices/authSlice";
import { useNavigate, Link } from "react-router-dom";
import bgImage from "../assets/bg.webp";
import axiosInstance from "../services/axiosInstance";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    userName: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!form.userName.trim()) {
      alert("Username टाका ✅");
      return;
    }

    if (!form.password) {
      alert("Password टाका ✅");
      return;
    }

    try {
      const res = await axiosInstance.post("/login", {
        userName: form.userName,
        password: form.password,
      });

      const data = res.data;

      if (!data.success) {
        alert(data.message);
        return;
      }

      const userPayload = {
        id: data.user.id,
        fullName: data.user.fullName,
        userName: data.user.userName,
        role: data.user.role,
        departmentName: data.user.departmentName,
      };

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      dispatch(loginSuccess(userPayload));
      localStorage.setItem("authUser", JSON.stringify(userPayload));
      localStorage.setItem("userRole", data.user.role);

      navigate("/dashboard");

    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        "Server error. Backend चालू आहे का?";
      alert(msg);
    }
  };

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative z-10 w-full min-h-screen flex flex-col md:flex-row">
        {/* LEFT SIDE */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-6 md:px-20 text-white">
          <h1 className="text-4xl md:text-6xl font-bold text-center md:text-left">
            <span>Fund</span>
            <span className="text-blue-300 block">Tracking</span>
          </h1>

          <div className="mt-4 mb-8 w-24 h-1 bg-blue-400 rounded-full mx-auto md:mx-0"></div>

            <div className="hidden md:block">
              <p className="mt-6 text-xl font-semibold text-white drop-shadow max-w-lg">
                You can securely access the Fund Allocation Tracker using your
                official credentials.
              </p>

              <p className="mt-6 text-lg text-slate-200 drop-shadow max-w-lg">
                Secure and real-time fund monitoring system
              </p>
            </div>
        </div>

        {/* LOGIN CARD */}
        <div className="w-full md:w-1/2 flex items-center justify-center px-6">
          <div className="w-full max-w-md rounded-2xl bg-white/25 backdrop-blur-xl border border-white/30 shadow-2xl p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <h2 className="text-3xl font-bold text-blue-600 text-center">
                LOGIN
              </h2>

              <div>
                <label className="block text-sm text-white mb-2">
                  Username
                </label>
                <input
                  name="userName"
                  value={form.userName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-white/90 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-white mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-white/90 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                SIGN IN
              </button>

              <div className="text-center text-sm text-white">
                Not registered yet?{" "}
                <Link to="/register" className="text-blue-300 underline">
                  Register here
                </Link>
              </div>
            </form>
          </div>
        </div>
        {/* Mobile Description */}
<div className="md:hidden mt-6 text-center px-6 pb-6">
  <p className="text-base font-semibold text-white drop-shadow">
    You can securely access the Fund Allocation Tracker using your
    official credentials.
  </p>

  <p className="mt-3 text-sm text-slate-200 drop-shadow">
    Secure and real-time fund monitoring system
  </p>
</div>

      </div>
    </div>
  );
}
