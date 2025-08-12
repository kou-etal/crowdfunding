import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../api/axiosInstance";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import AppLayout from "../components/AppLayout";

export function LoginFormTest() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      await axiosInstance.get("/sanctum/csrf-cookie", { withCredentials: true });
      await axiosInstance.post(
        "/login",
        { email, password, password_confirmation: password },
        { withCredentials: true }
      );
      navigate("/");
    } catch (err) {
      console.error("Login failed", err?.response?.data);
      if (err?.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors({ general: ["Invalid login credentials."] });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <Card className="max-w-xl mx-auto mt-16 md:mt-20 shadow-md">
        <CardContent className="p-8 space-y-6">
          <h1 className="text-2xl font-bold text-center text-blue-900">
            Log in to FundMyThesis
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4" aria-label="Login form">
            {/* Email */}
            <div>
              <Label htmlFor="email">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"       // ★端末間の入力補助差を統一
                autoCapitalize="none"
                spellCheck={false}
                aria-required="true"
                aria-describedby="email-desc"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. example@mail.com"
                required
              />
              <span id="email-desc" className="sr-only">
                Enter a valid email address
              </span>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email[0]}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password">
                Password <span className="text-red-500">*</span>
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"  // ★Samsungのオートフィル挙動を安定化
                autoCapitalize="none"
                spellCheck={false}
                aria-required="true"
                aria-describedby="password-desc"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
              <span id="password-desc" className="sr-only">
                Enter your account password
              </span>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password[0]}</p>
              )}
            </div>

            {/* エラー全般 */}
            {errors.general && (
              <p className="text-red-500 text-sm mt-1 text-center">
                {errors.general[0]}
              </p>
            )}

            <Button
              type="submit"
              className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log in"}
            </Button> 
          </form>
        </CardContent>
      </Card>
    </AppLayout>
  );
}



