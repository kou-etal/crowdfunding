// src/components/MobileMenu.jsx
import { useEffect, useState } from "react";
import { axiosInstance } from "../api/axiosInstance";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { AdminLink } from "./AdminLink";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export default function MobileMenu() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    axiosInstance
      .get("/api/profile")
      .then((res) => setUser(res.data))
      .catch(() => setUser(null));
  }, []);

  const isLoggedIn  = !!user;
  const isSupporter = user?.role === "supporter";
  const isVerified  = user?.is_verified == 1;
  const isAdmin     = user?.role === "admin" || user?.is_admin === 1;

  // 投稿可否＆ツールチップ
  const isPostDisabled =
    !isLoggedIn ? true :
    isSupporter ? true :
    !isVerified;

  const postTooltip =
    !isLoggedIn
      ? "Please log in"
      : isSupporter
      ? "Supporters cannot post"
      : !isVerified
      ? "Identity verification is required"
      : "";

  const preventIfDisabled = (e) => {
    if (isPostDisabled) {
      e.preventDefault();
      if (postTooltip) alert(postTooltip);
    }
  };

  // メニュー配列
  const items = [];

  items.push({
    key: "home",
    node: (
      <Button asChild variant="ghost" className="w-full text-base py-2 text-white">
        <Link className="block w-full text-center" to="/">Home</Link>
      </Button>
    ),
  });

  if (!isLoggedIn || isSupporter) {
    items.push({
      key: "explore",
      node: (
        <Button
          variant="ghost"
          className="w-full text-base py-2 text-white"
          onClick={() => {
            window.history.pushState({}, "", "/#explore");
            setTimeout(() => {
              document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" });
            }, 80);
          }}
        >
          <span className="block w-full text-center">Explore Projects</span>
        </Button>
      ),
    });
  }

  if (isLoggedIn && !isSupporter) {
    items.push({
      key: "projects",
      node: (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={`w-full text-base py-2 ${isPostDisabled ? "text-gray-400" : "text-white"}`}
              title={isPostDisabled ? postTooltip : ""}
            >
              <span className="block w-full text-center">Projects</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-[12rem] bg-blue-100 text-blue-900 border border-blue-200 shadow-lg rounded-md overflow-hidden">
            <DropdownMenuItem asChild>
              <Link
                to={isPostDisabled ? "#" : "/post"}
                onClick={preventIfDisabled}
                className={`block px-4 py-2 text-base ${
                  isPostDisabled ? "text-gray-400 cursor-not-allowed" : "hover:bg-blue-200 hover:text-blue-900"
                }`}
                title={isPostDisabled ? postTooltip : ""}
              >
                New Project
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                to={isPostDisabled ? "#" : "/myprojects"}
                onClick={preventIfDisabled}
                className={`block px-4 py-2 text-base ${
                  isPostDisabled ? "text-gray-400 cursor-not-allowed" : "hover:bg-blue-200 hover:text-blue-900"
                }`}
                title={isPostDisabled ? postTooltip : ""}
              >
                My Projects
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    });
  }

  if (isAdmin) {
    items.push({
      key: "admin",
      node: (
        <div className="w-full">
          <div className="mx-auto max-w-[12rem]">
            <div className="w-full">
              <AdminLink />
            </div>
          </div>
        </div>
      ),
    });
  }

  if (isLoggedIn && !isVerified && !isSupporter) {
    items.push({
      key: "verify",
      node: (
        <Button asChild variant="ghost" className="w-full text-base py-2 text-red-400">
          <Link className="block w-full text-center" to="/verify">Verify Your Account</Link>
        </Button>
      ),
    });
  }

  if (isLoggedIn) {
    items.push({
      key: "edit",
      node: (
        <Button asChild variant="ghost" className="w-full text-base py-2 text-white">
          <Link className="block w-full text-center" to="/edit">Edit profile</Link>
        </Button>
      ),
    });
    items.push({
      key: "logout",
      node: (
        <Button asChild variant="ghost" className="w-full text-base py-2 text-white">
          <Link className="block w-full text-center" to="/logout">Log out</Link>
        </Button>
      ),
    });
  } else {
    items.push({
      key: "signup",
      node: (
        <Button asChild variant="ghost" className="w-full text-base py-2 text-white">
          <Link className="block w-full text-center" to="/register">Sign up</Link>
        </Button>
      ),
    });
    items.push({
      key: "login",
      node: (
        <Button asChild variant="ghost" className="w-full text-base py-2 text-white">
          <Link className="block w-full text-center" to="/login">Log in</Link>
        </Button>
      ),
    });
  }

  // 段分け（4=1段, 5=3+2, 6=3+3）
  const makeRows = (arr) => {
    const n = arr.length;
    if (n <= 4) return [arr];
    if (n === 5) return [arr.slice(0, 3), arr.slice(3)];
    if (n === 6) return [arr.slice(0, 3), arr.slice(3)];
    const rows = [];
    for (let i = 0; i < n; i += 3) rows.push(arr.slice(i, i + 3));
    return rows;
  };

  const rows = makeRows(items);

  return (
    <>
      {/* ロゴ帯 */}
      <div className="bg-white border-b border-blue-200 px-4 py-2 flex flex-col items-start">
        <Link
          to="/"
          className="text-3xl font-extrabold text-blue-900 hover:text-blue-700 transition-colors duration-200"
        >
          FundMyThesis
        </Link>
        {isLoggedIn && (
          <span className="text-sm text-gray-500 italic pl-1">
            You are a <strong>{isSupporter ? "Supporter" : "Researcher"}</strong>
          </span>
        )}
      </div>

      {/* 段組みメニュー（各セルとボタンを w-full にして幅を完全均等化） */}
      <nav className="bg-slate-800 text-white border-b shadow-sm">
        {rows.map((row, idx) => {
          const cols =
            row.length === 2 ? "grid-cols-2" :
            row.length === 4 ? "grid-cols-4" :
            "grid-cols-3";
          return (
            <div key={idx} className={`grid ${cols} gap-0 px-0`}>
              {row.map((it) => (
                <div key={it.key} className="border-r border-white/10 last:border-r-0">
                  <div className="px-2 py-2">
                    {it.node}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </nav>
    </>
  );
}


