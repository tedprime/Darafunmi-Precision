import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { login } from "../../../services/auth.jsx";
import { useAuth } from "../../../contexts/AuthContext";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await login(email, password);
      if (data?.data) setUser(data.data);
      navigate("/dashboard");
    } catch {
      setError("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Panel — decorative blue split */}
      <div className="hidden lg:flex w-1/2 bg-blue-600 relative overflow-hidden items-center justify-center">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-500 rounded-full opacity-40" />
        <div className="absolute -bottom-16 -right-16 w-80 h-80 bg-blue-700 rounded-full opacity-40" />
        <div className="relative z-10 text-center px-12">
          <div className="bg-white text-blue-600 text-3xl font-extrabold px-6 py-4 rounded-2xl inline-block mb-6 shadow-lg">
            DPT
          </div>
          <h1 className="text-white text-4xl font-bold leading-tight mb-4">
            Darafunmi Precision
            <br />
            Technologies
          </h1>
          <p className="text-blue-100 text-lg">
            Admin management portal for calibrations, certifications, and more.
          </p>
        </div>
      </div>

      {/* Right Panel — form */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="bg-blue-600 text-white text-2xl font-extrabold px-5 py-3 rounded-xl inline-block">
              DPT
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-1">
            Welcome back
          </h2>
          <p className="text-gray-500 mb-8">Sign in to your admin account</p>

          {/* Error banner */}
          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div className="relative">
              <label className="block text-xs font-semibold text-blue-600 mb-1 ml-1">
                Email Address
              </label>
              <div className="flex items-center border-2 border-gray-200 rounded-xl px-4 py-3 focus-within:border-blue-500 transition-colors bg-white">
                <Mail size={18} className="text-gray-400 mr-3 shrink-0" />
                <input
                  type="email"
                  placeholder="admin@dpt.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 outline-none text-gray-800 bg-transparent text-sm placeholder-gray-400"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="relative">
              <label className="block text-xs font-semibold text-blue-600 mb-1 ml-1">
                Password
              </label>
              <div className="flex items-center border-2 border-gray-200 rounded-xl px-4 py-3 focus-within:border-blue-500 transition-colors bg-white">
                <Lock size={18} className="text-gray-400 mr-3 shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 outline-none text-gray-800 bg-transparent text-sm placeholder-gray-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-gray-400 hover:text-gray-600 ml-2"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="text-right">
              <a href="#" className="text-sm text-blue-600 hover:underline">
                Forgot your password?
              </a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  Login <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-10">
            Darafunmi Precision Technologies Ltd. &copy; {new Date().getFullYear()} All rights
            reserved
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
