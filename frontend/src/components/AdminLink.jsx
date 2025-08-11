import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { axiosInstance } from '../api/axiosInstance';
import { Button } from "./ui/button";

export function AdminLink() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get('/api/user');
        setUser(res.data);
      } catch (error) {
        console.error('ユーザー情報取得エラー:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) return null;
  if (!user || !user.is_admin) return null;

  return (
    <div>
  <Button
                asChild
                variant="ghost"
                className="text-xl text-red-500 font-medium hover:text-red-500 hover:underline"
              >
                <Link to="/admin/dashboard">Admin</Link>
              </Button>
    </div>
  );
}
