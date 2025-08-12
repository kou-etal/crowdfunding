import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { axiosInstance } from '../api/axiosInstance';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AppLayout from '../components/AppLayout';

export function LogoutTest() {
  const [message, setMessage] = useState("Logging out...");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        // CSRFクッキー確保（Sanctum想定）
        await axiosInstance.get('/sanctum/csrf-cookie', { withCredentials: true });
        await axiosInstance.post('/logout', null, { withCredentials: true });
        setMessage('Log out successful.');
        // ★ ここで遷移して AppLayout を再マウント → /api/profile が未ログインに更新される
        navigate('/', { replace: true });
      } catch (err) {
        console.error('Logout failed', err?.response?.data);
        setMessage('Logout failed.');
      }
    })();
  }, [navigate]);

  // リダイレクト前の一瞬だけ見えるUI（任意）
  return (
    <AppLayout>
      <div className="min-dvh w-full flex items-center justify-center px-4">
        <Card className="w-full max-w-xl shadow-md">
          <CardContent className="p-8 space-y-6 text-center">
            <h2 className="text-2xl font-bold">{message}</h2>
            <Button asChild className="w-full bg-blue-600 text-white font-semibold hover:bg-blue-700">
              <Link to="/">Top</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

