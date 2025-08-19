import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../api/axiosInstance";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import AppLayout from "../components/AppLayout";

export function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [passwordTooShort, setPasswordTooShort] = useState(false);

  const navigate = useNavigate();

  
  useEffect(() => {
    setPasswordTooShort(password.length > 0 && password.length < 8);
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    if (password !== passwordConfirm) {
      setErrors({ password_confirmation: ["Passwords do not match."] });
      setLoading(false);
      return;
    }

    try {
     
      await axiosInstance.get("/sanctum/csrf-cookie", { withCredentials: true });
      const res = await axiosInstance.post(
        "/api/register",
        {
          name: name.trim(),
          email: email.trim(),
          password,
          password_confirmation: passwordConfirm,
        },
        { withCredentials: true }
      );
      setMessage(res.data.message);
    } catch (err) {
      console.error("Registration failed:", err?.response?.data);
      if (err?.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

 
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => navigate("/"), 100);
      return () => clearTimeout(timer);
    }
  }, [message, navigate]);

  return (
    <AppLayout>
      <Card className="max-w-xl mx-auto mt-20 shadow-md">
        <CardContent className="p-8 space-y-6">
          <h1 className="text-2xl font-bold text-center text-blue-900">
            Sign Up for FundMyThesis
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4" aria-label="Registration form">
           
            <div>
              <Label htmlFor="name">
                Username <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                aria-required="true"
                aria-describedby="username-desc"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Taro Yamada"
                required
              />
              <span id="username-desc" className="sr-only">
                Enter your username
              </span>
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name[0]}</p>}
            </div>

           
            <div>
              <Label htmlFor="email">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                aria-required="true"
                aria-describedby="email-desc"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. example@mail.com"
                required
              />
              <span id="email-desc" className="sr-only">Enter a valid email address</span>
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email[0]}</p>}
            </div>

          
            <div>
              <Label htmlFor="password">
                Password <span className="text-red-500">*</span>
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                autoCapitalize="none"
                spellCheck={false}
                minLength={8}
                aria-required="true"
                aria-describedby="password-desc"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
              />
              <span id="password-desc" className="sr-only">
                Enter a strong password with at least 8 characters
              </span>
              {passwordTooShort && (
                <p className="text-red-500 text-sm mt-1">
                  Password must be at least 8 characters long.
                </p>
              )}
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password[0]}</p>}
            </div>

            
            <div>
              <Label htmlFor="passwordConfirm">
                Confirm Password <span className="text-red-500">*</span>
              </Label>
              <Input
                id="passwordConfirm"
                name="password_confirmation"
                type="password"
                autoComplete="new-password"
                autoCapitalize="none"
                spellCheck={false}
                aria-required="true"
                aria-describedby="password-confirm-desc"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="Re-enter your password"
                required
              />
              <span id="password-confirm-desc" className="sr-only">
                Re-enter the password to confirm
              </span>
              {errors.password_confirmation && (
                <p className="text-red-500 text-sm mt-1">{errors.password_confirmation[0]}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
            </Button>
          </form>

          
        </CardContent>
      </Card>
    </AppLayout>
  );
}

/*{message && (
            <p className="text-green-600 text-center font-medium mt-4" aria-live="polite">
              {message}
            </p>
          )}*/