import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { axiosInstance } from "../api/axiosInstance";
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
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    axiosInstance
      .get("/api/profile")
      .then((res) => setUser(res.data))
      .catch(() => setUser(null));

    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isLoggedIn = !!user;
  const isSupporter = user?.role === "supporter";
  const isVerified = user?.is_verified == 1;

  const handleExploreClick = () => {
    const scrollToExplore = () => {
      const el = document.getElementById("explore");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    if (location.pathname !== "/") {
      navigate("/", { replace: false });
      setTimeout(scrollToExplore, 250);
    } else {
      scrollToExplore();
    }
  };

  let isPostDisabled = true;
  let postTooltip = "";
  if (!isLoggedIn) postTooltip = "Please log in";
  else if (isSupporter) postTooltip = "Supporters cannot post";
  else if (!isVerified) postTooltip = "Identity verification is required";
  else isPostDisabled = false;

  return (
    // vhズレ対策：min-dvh（index.cssに追加済みユーティリティ）
    <div className="min-dvh flex flex-col">
      {/* ▼ ナビゲーション */}
      {isMobile ? (
        <MobileMenu user={user} />
      ) : (
        // w-full固定 / 高さはモバイル16, mdで20
        <nav className="w-full h-16 md:h-20 bg-white text-blue-900 border-b border-blue-200 flex items-center justify-between px-4 sm:px-6 md:px-8 shadow-lg">
          {/* 左：ロゴ＋ロール */}
          <div className="flex flex-col items-start">
            <Link
              to="/"
              className="text-3xl md:text-4xl font-extrabold text-blue-900 hover:text-blue-700 transition-colors duration-200"
            >
              FundMyThesis
            </Link>
            {isLoggedIn && (
              <span className="text-xs md:text-sm text-gray-500 italic pl-1">
                You are a <strong>{isSupporter ? "Supporter" : "Researcher"}</strong>
              </span>
            )}
          </div>

          {/* 右：ナビ（gap依存を避けspace-xで安定） */}
          <div className="flex items-center space-x-4 md:space-x-8">
            <Button
              asChild
              variant="ghost"
              className="text-base md:text-xl font-medium text-blue-900 hover:text-blue-600 hover:underline"
            >
              <Link to="/">Home</Link>
            </Button>

            {(!isLoggedIn || isSupporter) && (
              <Button
                onClick={handleExploreClick}
                variant="ghost"
                className="text-base md:text-xl font-medium text-blue-900 hover:text-blue-600 hover:underline"
              >
                Explore Projects
              </Button>
            )}

            {isLoggedIn && !isSupporter && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-base md:text-xl font-medium text-blue-900 hover:text-blue-600 hover:underline"
                  >
                    Projects
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-blue-100 text-blue-900 border border-blue-200 shadow-lg rounded-md overflow-hidden">
                  <DropdownMenuItem asChild>
                    <Link
                      to={isPostDisabled ? "#" : "/post"}
                      className={`block px-4 py-2 text-sm md:text-base transition-colors duration-200 ${
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
                      className={`block px-4 py-2 text-sm md:text-base transition-colors duration-200 ${
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

            <AdminLink />

            {isLoggedIn && !isVerified && !isSupporter && (
              <Button
                asChild
                variant="ghost"
                className="text-base md:text-xl text-red-500 font-medium hover:text-red-500 hover:underline"
              >
                <Link to="/verify">Verify Your Account</Link>
              </Button>
            )}

            {isLoggedIn ? (
              <>
                <Button
                  asChild
                  variant="ghost"
                  className="text-base md:text-xl font-medium text-blue-900 hover:text-blue-600 hover:underline"
                >
                  <Link to="/edit">Edit profile</Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  className="text-base md:text-xl font-medium text-blue-900 hover:text-blue-600 hover:underline"
                >
                  <Link to="/logout">Log out</Link>
                </Button>
              </>
            ) : (
              <>
                <Button
                  asChild
                  variant="ghost"
                  className="text-base md:text-xl font-medium text-blue-900 hover:text-blue-600 hover:underline"
                >
                  <Link to="/register">Sign up</Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  className="text-base md:text-xl font-medium text-blue-900 hover:text-blue-600 hover:underline"
                >
                  <Link to="/login">Log in</Link>
                </Button>
              </>
            )}
          </div>
        </nav>
      )}

      {/* ▼ メイン */}
      <main className="w-full">{children}</main>

      {/* ▼ フッター */}
      <footer className="w-full border-t mt-8">
        <div className="max-w-xl mx-auto text-center text-xs md:text-sm text-gray-500 py-4">
          © {new Date().getFullYear()} FundMyThesis. All rights reserved.
        </div>
      </footer>
    </div>
  );
}



