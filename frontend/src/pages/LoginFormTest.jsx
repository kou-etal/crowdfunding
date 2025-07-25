import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '../api/axiosInstance';
import AppLayout from '../components/AppLayout';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginFormTest() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axiosInstance.get("/api/user")
      .then(() => {
        setMessage("You are already logged in. Please log out first.");
        setIsLoggedIn(true);
        setCheckingAuth(false);
        setTimeout(() => navigate("/"), 1500);
      })
      .catch(() => {
        setIsLoggedIn(false);
        setCheckingAuth(false);
      });
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      await axiosInstance.get('/sanctum/csrf-cookie');
      await axiosInstance.post('/login', { email, password });
      setMessage('Log in successful.');
      setTimeout(() => navigate('/'), 1000);
    } catch (err) {
      if (err.response?.status === 422) {
        setMessage('The entered user is not registered.');
      } else {
        setMessage('Login failed.');
      }
    }
  };

  if (checkingAuth) return null;

  return (
    <AppLayout>
      <Card className="max-w-4xl mx-auto w-full mt-20 mb-8 shadow-md">
        <CardContent className="p-8 space-y-6">
          <h2 className="text-2xl font-bold">Login</h2>

          {message && (
            <p className="text-sm text-center text-red-500">{message}</p>
          )}

          {!isLoggedIn && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                required
              />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
              />
              <Button type="submit" className="w-full">
                Log in
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}

