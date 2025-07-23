import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
export function DashBoard(){

    return(
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 pb-2 pl-2">
          管理者ページ
        </h1>

        <div className="pl-4 flex flex-col gap-10 mb-6">
          <Link
            to="/admin/verify"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-10 px-4 rounded shadow"
          >
           本人確認申請一覧
          </Link>
            <Link
            to="/admin/review"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-10 px-4 rounded shadow"
          >
            キャンペーン投稿申請一覧
          </Link>
          <Link
            to="/admin/pay"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-10 px-4 rounded shadow"
          >
           支払い情報
          </Link>
        </div>
      </div>
    </AppLayout>
    );
}