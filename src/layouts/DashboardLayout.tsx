import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, KeyRound, Users, Settings, LogOut } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { logout } from "@/store/slices/authSlice";
import { motion } from "framer-motion";

const navItems = [
  { to: "/dashboard", label: "Tableau de bord", Icon: LayoutDashboard },
  { to: "/passwords", label: "Mots de passe", Icon: KeyRound },
  { to: "/users", label: "Utilisateurs", Icon: Users },
  { to: "/settings", label: "Paramètres", Icon: Settings },
];

export default function DashboardLayout() {
  const { user } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const title = navItems.find((n) => location.pathname.startsWith(n.to))?.label || "";

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <aside className="w-64 border-r hidden md:flex md:flex-col">
        <div className="h-16 border-b flex items-center px-4 text-lg font-semibold">VaultPro</div>
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-md px-3 py-2 transition-colors ${
                  isActive ? "bg-muted text-primary" : "hover:bg-muted/60"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm font-medium">{label}</span>
            </NavLink>
          ))}
        </nav>
        <button onClick={handleLogout} className="m-2 inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted/60">
          <LogOut className="h-4 w-4" />
          Déconnexion
        </button>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b flex items-center justify-between px-4">
          <motion.h1
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="text-lg font-semibold"
          >
            {title}
          </motion.h1>
          <div className="text-sm opacity-80">
            {user ? `${user.firstName} ${user.lastName}` : ""}
          </div>
        </header>

        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
