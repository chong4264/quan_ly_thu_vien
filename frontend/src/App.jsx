import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./components/layout/AdminLayout";
import ReaderLayout from "./components/layout/ReaderLayout";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Login from "./pages/Login";
import { adminRoutes, readerRoutes } from "./router/pages";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute staffOnly />}>
        <Route element={<AdminLayout />}>
          {adminRoutes.map(([path, Page]) => (
            <Route key={path} path={path} element={<Page />} />
          ))}
        </Route>
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<ReaderLayout />}>
          {readerRoutes.map(([path, Page]) => (
            <Route key={path} path={path} element={<Page />} />
          ))}
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
