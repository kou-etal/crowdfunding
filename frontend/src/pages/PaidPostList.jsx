import { useEffect, useState } from 'react';
import { axiosInstance } from '../api/axiosInstance';
import AppLayout from '../components/AppLayout';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ja';

dayjs.extend(relativeTime);
dayjs.locale('en');

export function PaidPostList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = () => {
    axiosInstance.get('/api/paid-posts')
      .then(res => {
        setPosts(res.data);
        setLoading(false);
      })
      .catch(err => console.error('取得失敗', err));
  };

  const toggleLike = async (postId) => {
    try {
      await axiosInstance.post(`/api/paid-posts/${postId}/like`);
      fetchPosts();
    } catch (err) {
      console.error('いいね失敗', err);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex justify-center text-center items-center">
      <p className="text-3xl font-light tracking-widest uppercase text-gray-500 animate-pulse">Loading...</p>
    </div>
  );
  const handlePurchase = async (postId) => {
  try {
    const res = await axiosInstance.post('/api/paid-posts/checkout', {
      paid_post_id: postId,
      success_url: window.location.origin + '/paid-posts',  // 成功時に戻るページ
      cancel_url: window.location.href,                     // キャンセル時に現在ページ
    });
    window.location.href = res.data.url; // Stripe Checkoutへ遷移
  } catch (err) {
    console.error('購入処理に失敗しました', err);
    alert('購入処理に失敗しました');
  }
};

  return (

  <AppLayout>
    <div className="w-full max-w-2xl mx-auto space-y-6 p-4">
      <h2 className="text-2xl font-bold mb-4">Paid Posts</h2>
      <div className="h-px bg-gray-300 mb-16" />

      {posts.map(post => (
        <div key={post.id} className="border rounded p-4 shadow-sm">
          {/* ユーザー情報 */}
          <div className="flex items-center mb-2">
            <img
              src={post.user.profile_image}
              alt="profile"
              className="w-10 h-10 rounded-full object-cover mr-2"
            />
            <span className="font-semibold">{post.user.name}</span>
          </div>

          {/* タイトルと本文 */}
          <h3 className="text-lg font-semibold">{post.title}</h3>
          <p className="mb-2 text-gray-700">
            {post.body ? post.body : 'この投稿を読むには購入が必要です'}
          </p>

          {/* 画像 */}
          {post.images.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {post.images.map(img => (
                <img
                  key={img.id}
                  src={img.path}
                  alt="images"
                  className={`w-32 h-32 object-cover rounded ${post.purchased ? '' : 'blur-sm'}`}
                />
              ))}
            </div>
          )}

          {/* いいね・日付・価格 */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center">
              <button
                onClick={() => toggleLike(post.id)}
                className="text-2xl mr-2"
              >
                {post.liked_by_me ? '❤️' : '♡'}
              </button>
              <span className="mr-4">{post.likes_count}</span>
              <span>{dayjs(post.created_at).fromNow()}</span>
            </div>
            {!post.purchased && (
              <span className="text-red-500 font-semibold">{post.price}円</span>
            )}
          </div>

          {/* 購入ボタン */}
          {!post.purchased && (
            <button
              onClick={() => handlePurchase(post.id)}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              ¥{post.price} で購入
            </button>
          )}
        </div>
      ))}
    </div>
  </AppLayout>
);

}
