import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await login(email, password);
      toast.success("Welcome back!");
      if (data.user.role === "admin") navigate("/admin");
      else navigate("/catalogue");
    } catch (err) {
      const detail = err.response?.data?.detail;
      const msg = typeof detail === "string" ? detail
        : Array.isArray(detail) ? detail.map(e => e.msg || JSON.stringify(e)).join(" ")
        : "Login failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="login-page" className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-medium text-[#0A0A0A] mb-2">Retailer Login</h1>
          <p className="text-[#4B5563] text-sm font-body">Access your B2B account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm font-body" data-testid="login-error">
              {error}
            </div>
          )}
          <div>
            <Label htmlFor="email" className="text-xs font-semibold tracking-wider uppercase text-[#4B5563] font-body">Email</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="mt-1 rounded-sm border-[#E5E7EB] focus-visible:ring-[#4AB868]"
              placeholder="Enter your email" required data-testid="login-email-input" />
          </div>
          <div>
            <Label htmlFor="password" className="text-xs font-semibold tracking-wider uppercase text-[#4B5563] font-body">Password</Label>
            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="mt-1 rounded-sm border-[#E5E7EB] focus-visible:ring-[#4AB868]"
              placeholder="Enter your password" required data-testid="login-password-input" />
          </div>
          <Button type="submit" disabled={loading}
            className="w-full bg-[#359E58] hover:bg-[#2e884c] text-white rounded-sm py-6 text-sm font-medium"
            data-testid="login-submit-button">
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <p className="text-center mt-8 text-sm text-[#4B5563] font-body">
          Don't have an account?{" "}
          <Link to="/register" className="text-[#359E58] font-medium hover:underline" data-testid="login-register-link">Apply as Retailer</Link>
        </p>
      </div>
    </div>
  );
}
