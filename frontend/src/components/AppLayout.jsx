import { useEffect, useState } from "react";
import { axiosInstance } from "../api/axiosInstance";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { AdminLink } from "./AdminLink";
import MobileMenu from "./MobileMenu";

export default function AppLayout({ children }) {

  const [user, setUser] = useState(null);

  useEffect(() => {
    axiosInstance
      .get("/api/profile")
      .then((res) => setUser(res.data))
      .catch(() => setUser(null));
  }, []);

  const isLoggedIn = !!user;
  const isSupporter = user?.role === "supporter";
  const isVerified = user?.is_verified == 1;

  // 投稿制御
  let isPostDisabled = true;
  let postTooltip = "";
  if (!isLoggedIn) {
    postTooltip = "ログインしてください";
  } else if (isSupporter) {
    postTooltip = "支援者は投稿できません";
  } else if (!isVerified) {
    postTooltip = "本人確認が必要です";
  } else {
    isPostDisabled = false;
  }

  // プロフィール編集
  const isEditDisabled = !isLoggedIn;

  // 本人確認（支援者は不可）
  const isVerifyDisabled = !isLoggedIn || isSupporter;
  const verifyTooltip = !isLoggedIn
    ? "ログインしてください"
    : isSupporter
    ? "支援者は本人確認できません"
    : "";

  return (
    <div className="min-h-screen flex flex-col">

      {/* PC用ナビ（そのまま） */}


<nav className="h-20 bg-white-500 text-blue-900 border-b border-blue-200 flex items-center justify-between px-8 shadow-lg"> {/* justify-end を justify-between に変更し、px-4 を px-8 に変更 */}
  {/* ロゴ/ブランド名 (左寄せ) */}
  <div className="flex items-center">
    <Link to="/" className="text-4xl font-extrabold text-blue-900 hover:text-blue-700 transition-colors duration-200">
      FundMyThesis
    </Link>
  </div>

  {/* ナビゲーションリンク (右寄せ) */}
  <div className="flex items-center gap-8"> {/* gap-5 から gap-8 に少し広げ、アイテムのサイズ調整 */}
    <Link
      to="/"
      className="text-xl font-medium hover:text-blue-600 hover:underline hover:decoration-blue-600 transition-all duration-200 flex items-center" // text-3xl から text-xl に、underlineをhover時のみに
    >
       Home
    </Link>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="text-xl font-medium text-blue-900 hover:bg-transparent hover:text-blue-600 hover:underline hover:decoration-blue-600 transition-all duration-200 flex items-center" // text-3xl から text-xl に、underlineをhover時のみに
        >
           Post 
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-blue-100 text-blue-900 border border-blue-200 shadow-lg rounded-md overflow-hidden">
        <DropdownMenuItem asChild>
          <Link
  to={isPostDisabled ? "#" : "/post"}
  className={`block px-4 py-2 text-base transition-colors duration-200 ${
    isPostDisabled
      ? "text-gray-400 cursor-not-allowed"
      : "hover:bg-blue-200 hover:text-blue-900"
  }`}
  title={isPostDisabled ? postTooltip : ""}
>
  Posts
</Link>

        </DropdownMenuItem>
  <DropdownMenuItem asChild>
          <Link
  to={isPostDisabled ? "#" : "/myprojects"}
  className={`block px-4 py-2 text-base transition-colors duration-200 ${
    isPostDisabled
      ? "text-gray-400 cursor-not-allowed"
      : "hover:bg-blue-200 hover:text-blue-900"
  }`}
  title={isPostDisabled ? postTooltip : ""}
>
  MyProjectStatus
</Link>

        </DropdownMenuItem>


        </DropdownMenuContent>
    </DropdownMenu>
    

    <AdminLink /> {/* AdminLinkコンポーネントはそのまま */}

    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="text-xl font-medium text-blue-900 hover:bg-transparent hover:text-blue-600 hover:underline hover:decoration-blue-600 transition-all duration-200 flex items-center" // text-3xl から text-xl に、underlineをhover時のみに
        >
           Profile 
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-blue-100 text-blue-900 border border-blue-200 shadow-lg rounded-md overflow-hidden">
        <DropdownMenuItem asChild>
          <Link
            to="/register"
            className="block px-4 py-2 text-base hover:bg-blue-200 hover:text-blue-900 transition-colors duration-200" // text-sm から text-base に変更 (ドロップダウン内の視認性向上)
          >
            Sign up
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            to="/login"
            className="block px-4 py-2 text-base hover:bg-blue-200 hover:text-blue-900 transition-colors duration-200" // text-sm から text-base に変更
          >
            Log in
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
  <Link
    to={isEditDisabled ? "#" : "/edit"}
    className={`block px-4 py-2 text-base transition-colors duration-200 ${
      isEditDisabled
        ? "text-gray-400 cursor-not-allowed"
        : "hover:bg-blue-200 hover:text-blue-900"
    }`}
    title={isEditDisabled ? "ログインしてください" : ""}
  >
    Edit profile
  </Link>
</DropdownMenuItem>

<DropdownMenuItem asChild>
  <Link
    to={isVerifyDisabled ? "#" : "/verify"}
    className={`block px-4 py-2 text-base transition-colors duration-200 ${
      isVerifyDisabled
        ? "text-gray-400 cursor-not-allowed"
        : "hover:bg-blue-200 hover:text-blue-900"
    }`}
    title={isVerifyDisabled ? verifyTooltip : ""}
  >
    Identify Verification
  </Link>
</DropdownMenuItem>
<DropdownMenuItem asChild>
          <Link
            to="/logout"
            className="block px-4 py-2 text-base hover:bg-blue-200 hover:text-blue-900 transition-colors duration-200" // text-sm から text-base に変更
          >
            Log out
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</nav>
{/* この下のコンテンツ領域の背景色は、ナビゲーションバーと合わせるなら削除、
    別の色にするならそのまま、または別の色を指定 */}
{/* <main className="bg-blue-50 min-h-screen py-8"> */}

      {/* スマホ用ナビ（上部に常時表示） */}
      <div className="md:hidden">
        <MobileMenu />
      </div>

     <main >
        {children}
      </main>

      <footer className="text-center text-sm text-gray-500 py-4 border-t">
        © {new Date().getFullYear()} FundMyThesis. All rights reserved.
      </footer>
    </div>
  );
}
