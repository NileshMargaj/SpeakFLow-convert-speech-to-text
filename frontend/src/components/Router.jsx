import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Layout from "./Layout";
import Register from "../pages/Register";
import Login from "../pages/Login";

import Landing from "../pages/Landing";
import History from "../pages/History";
import SavedFiles from "../pages/SavedFiles";

const Dashboard = Landing;




export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout><Dashboard /></Layout>} />
        <Route path="/history" element={<Layout><History /></Layout>} />
        <Route path="/saved" element={<Layout><SavedFiles /></Layout>} />
        <Route path="/register" element={<Layout><Register /></Layout>} />
        <Route path="/login" element={<Layout><Login /></Layout>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

