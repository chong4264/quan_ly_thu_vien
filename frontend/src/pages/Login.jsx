import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoginHeader from "../components/login/LoginHeader";
import LoginHero from "../components/login/LoginHero";
import LoginForm from "../components/login/LoginForm";
import LoginFooter from "../components/login/LoginFooter";

export default function Login() {
  const { user, isStaff } = useAuth();
  // Đã đăng nhập rồi thì không cần hiện form nữa
  if (user)
    return (
      <Navigate
        to={isStaff ? "/dashboard-tong-quan" : "/tra-cuu-sach"}
        replace
      />
    );

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen flex flex-col">
      <LoginHeader />
      <main className="w-full flex-1 pt-16 bg-surface flex flex-col justify-center">
        <div className="w-full max-w-7xl mx-auto px-margin-desktop py-space-xl min-h-[calc(100vh-8rem)] flex items-center justify-center">
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 rounded-xl bg-surface-container-lowest shadow-xl overflow-hidden">
            <LoginHero />
            <LoginForm />
          </div>
        </div>
      </main>
      <LoginFooter />
    </div>
  );
}
