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
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 👈 ログイン済み判定
  const [checkingAuth, setCheckingAuth] = useState(true); // 初回フラグ
  const navigate = useNavigate();

  // ✅ 初回チェック：ログイン済みか
  useEffect(() => {
    axiosInstance.get("/api/user")
      .then(() => {
        setMessage("すでにログインしています。一度ログアウトしてください。");
        setIsLoggedIn(true);
        setCheckingAuth(false);
        setTimeout(() => navigate("/"), 1500); // 👈 一瞬表示 → リダイレクト
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
        setMessage('入力されたユーザーは登録されていません');
      } else {
        setMessage('Login failed.');
      }
    }
  };

  // ✅ チェック中なら何も表示しない
  if (checkingAuth) return null;

  return (
    <AppLayout>
      <Card className="max-w-4xl mx-auto w-full mt-20 mb-8 shadow-md">
        <CardContent className="p-8 space-y-6">
          <h2 className="text-2xl font-bold">Login</h2>

          {message && (
            <p className="text-sm text-center text-red-500">{message}</p>
          )}

          {/* ✅ ログイン済みの場合はフォーム表示しない */}
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
