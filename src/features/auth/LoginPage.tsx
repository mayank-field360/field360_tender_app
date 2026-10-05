import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import api from "@/api/axios";
import Spinner from "@/components/ui/Spinner";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import type { LoginResponse } from "@/types";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});

  function validate(): boolean {
    const errs: typeof errors = {};
    if (!username.trim()) errs.username = "Username or phone is required";
    if (!password) errs.password = "Password is required";
    else if (password.length < 4) errs.password = "Password must be at least 4 characters";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const { data } = await api.post<LoginResponse>("/user/login/", {
        username: username.trim(),
        password,
      });
      login(data.token, data.user);
      toast.success("Welcome back!");
      navigate("/", { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.response?.data?.message || "Invalid credentials";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      {/* Left visual panel */}
      <div className="login-visual">
        <div className="login-visual-content">
          <div className="login-visual-logo">
            <ShieldCheck size={36} color="white" />
          </div>
          <h1>Field360 Tender</h1>
          <p>
            Your centralized portal for managing Material &amp; Service tender bids.
            Submit proposals, track statuses, and stay ahead of deadlines.
          </p>
        </div>
      </div>

      {/* Right login form */}
      <div className="login-form-side">
        <div className="login-form-header">
          <h2>Welcome Back</h2>
          <p>Enter your credentials to access your tender dashboard</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="login-username">
              Username / Phone
            </label>
            <input
              id="login-username"
              className={`form-input ${errors.username ? "error" : ""}`}
              type="text"
              placeholder="Enter your username or phone"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setErrors((p) => ({ ...p, username: undefined })); }}
              autoComplete="username"
              autoFocus
            />
            {errors.username && <span className="form-error">{errors.username}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="login-password"
                className={`form-input ${errors.password ? "error" : ""}`}
                type={showPw ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
                autoComplete="current-password"
                style={{ width: "100%", paddingRight: 44 }}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? <><Spinner size={18} /> Signing in...</> : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
