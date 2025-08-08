import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "@/store";

export default function ProtectedRoute() {
  const token = useAppSelector((s) => s.auth.token) || localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
}
