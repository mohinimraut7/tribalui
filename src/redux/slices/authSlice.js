// import { createSlice } from "@reduxjs/toolkit";

// const initialState = {
//   user: null,
//   isLoggedIn: false,
// };

// const authSlice = createSlice({
//   name: "auth",
//   initialState,
//   reducers: {
//     loginSuccess: (state, action) => {
//       state.user = action.payload; // { name, role }
//       state.isLoggedIn = true;
//     },
//     logout: (state) => {
//       state.user = null;
//       state.isLoggedIn = false;
//     },
//   },
// });

// export const { loginSuccess, logout } = authSlice.actions;
// export default authSlice.reducer;



import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isLoggedIn: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      // expected payload:
      // { id, fullName, userName, role, departmentName }
      state.user = action.payload;
      state.isLoggedIn = true;
    },

    logout: (state) => {
      state.user = null;
      state.isLoggedIn = false;

      // optional cleanup
      localStorage.removeItem("authUser");
      localStorage.removeItem("token");
      localStorage.removeItem("userRole");
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
