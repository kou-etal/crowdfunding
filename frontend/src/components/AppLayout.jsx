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

  let isPostDisabled = true;
  let postTooltip = "";
  if (!isLoggedIn) {
    postTooltip = "Please log in";
  } else if (isSupporter) {
    postTooltip = "Supporters cannot post";
  } else if (!isVerified) {
    postTooltip = "Identity verification is required";
  } else {
    isPostDisabled = false;
  }

  const isEditDisabled = !isLoggedIn;

  return (
    <div className="min-h-screen flex flex-col">
   <nav className="h-20 bg-white-500 text-blue-900 border-b border-blue-200 flex items-center justify-between px-8 shadow-lg">
  {/* 左側ロゴとロール表示 */}
  <div className="flex flex-col items-start">
    <Link
      to="/"
      className="text-4xl font-extrabold text-blue-900 hover:text-blue-700 transition-colors duration-200"
    >
      FundMyThesis
    </Link>

    {/* ログイン時のみロール表示 */}
    {isLoggedIn && (
      <span className="text-sm text-gray-500 italic pl-1">
        You are a <strong>{isSupporter ? "Supporter" : "Researcher"}</strong>
      </span>
    )}
  </div>

  {/* ナビゲーション（右側） */}
  <div className="flex items-center gap-8">
    {/* Home */}
    <Button
      asChild
      variant="ghost"
      className="text-xl font-medium text-blue-900 hover:text-blue-600 hover:underline"
    >
      <Link to="/">Home</Link>
    </Button>

    {/* Projects（ログイン済み & 研究者のみ表示） */}
    {isLoggedIn && !isSupporter && (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="text-xl font-medium text-blue-900 hover:text-blue-600 hover:underline"
          >
            Projects
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
              New Project
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
              My Projects
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )}

    {/* Admin */}
    <AdminLink />

    {/* Verify Identity */}
    {isLoggedIn && !isVerified && !isSupporter && (
      <Button
        asChild
        variant="ghost"
        className="text-xl text-red-500 font-medium hover:text-red-500 hover:underline"
      >
        <Link to="/verify">Verify Your Account</Link>
      </Button>
    )}

    {/* ログイン・ログアウト系 */}
    {isLoggedIn ? (
      <>
        <Button
          asChild
          variant="ghost"
          className="text-xl font-medium text-blue-900 hover:text-blue-600 hover:underline"
        >
          <Link to="/edit">Edit profile</Link>
        </Button>
        <Button
          asChild
          variant="ghost"
          className="text-xl font-medium text-blue-900 hover:text-blue-600 hover:underline"
        >
          <Link to="/logout">Log out</Link>
        </Button>
      </>
    ) : (
      <>
        <Button
          asChild
          variant="ghost"
          className="text-xl font-medium text-blue-900 hover:text-blue-600 hover:underline"
        >
          <Link to="/register">Sign up</Link>
        </Button>
        <Button
          asChild
          variant="ghost"
          className="text-xl font-medium text-blue-900 hover:text-blue-600 hover:underline"
        >
          <Link to="/login">Log in</Link>
        </Button>
      </>
    )}
  </div>
</nav>


      {/* モバイルメニュー */}
      <div className="md:hidden">
        <MobileMenu />
      </div>

      {/* メイン */}
      <main>
        {children}
      </main>

      {/* フッター */}
      <footer className="text-center text-sm text-gray-500 py-4 border-t">
        © {new Date().getFullYear()} FundMyThesis. All rights reserved.
      </footer>
    </div>
  );
}


