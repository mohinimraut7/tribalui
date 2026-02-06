// import Sidebar from "./Sidebar";
// import { Outlet } from "react-router-dom";

// export default function DashboardLayout() {
//   return (
//     <div className="min-h-screen flex bg-gray-100">
      
//       {/* Sidebar */}
//       <Sidebar />

//       {/* Main Content */}
//       <div className="flex-1 p-4 md:p-6">
//         <Outlet />
//       </div>

//     </div>
//   );
// }

// ===============================


import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Page Content */}
      <div className="flex-1 overflow-auto bg-gray-100">
        <Outlet />
      </div>
    </div>
  );
}
