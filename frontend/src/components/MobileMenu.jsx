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
    axiosInstance.get("/api/profile")
      .then((res) => setUser(res.data))
      .catch(() => setUser(null));
  }, []);

 const isLoggedIn  = !!user;
  const isSupporter = user?.role === "supporter";
  const isVerified  = user?.is_verified == 1;

  const isAdmin = user?.role === "admin" || user?.is_admin === 1;

  // ここを追加
  const isPostDisabled = !isVerified; 
  const postTooltip = "Please verify your account before posting.";
  const preventIfDisabled = (e) => {
    if (isPostDisabled) {
      e.preventDefault();
    }
  };

  const items = [];

  items.push({
    key: "home",
    node: (
      <Button asChild variant="ghost" className="text-base px-3 py-1 text-white">
        <Link to="/">Home</Link>
      </Button>
    ),
  });

  if (!isLoggedIn || isSupporter) {
    items.push({
      key: "explore",
      node: (
        <Button
          onClick={() => {
            window.history.pushState({}, "", "/#explore");
            setTimeout(() => {
              document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" });
            }, 100);
          }}
          variant="ghost"
          className="text-base px-3 py-1 text-white"
        >
          Explore Projects
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
              className={`text-base px-3 py-1 ${isPostDisabled ? "text-gray-400" : "text-white"}`}
              title={isPostDisabled ? postTooltip : ""}
            >
              Projects
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-blue-100 text-blue-900 border border-blue-200 shadow-lg rounded-md overflow-hidden min-w-[12rem]">
            <DropdownMenuItem asChild>
              <Link
                to={isPostDisabled ? "#" : "/post"}
                onClick={preventIfDisabled}
                className={`block w-full px-4 py-2 text-base ${isPostDisabled ? "text-gray-400 cursor-not-allowed" : "hover:bg-blue-200 hover:text-blue-900"}`}
                title={isPostDisabled ? postTooltip : ""}
              >
                New Project
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                to={isPostDisabled ? "#" : "/myprojects"}
                onClick={preventIfDisabled}
                className={`block w-full px-4 py-2 text-base ${isPostDisabled ? "text-gray-400 cursor-not-allowed" : "hover:bg-blue-200 hover:text-blue-900"}`}
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

  // ★ 管理者のときだけ追加（ここが修正点）
  if (isAdmin) {
    items.push({
      key: "admin",
      node: (
        <div className="text-white">
          <AdminLink />
        </div>
      ),
    });
  }

  if (isLoggedIn && !isVerified && !isSupporter) {
    items.push({
      key: "verify",
      node: (
        <Button asChild variant="ghost" className="text-base px-3 py-1 text-red-400">
          <Link to="/verify">Verify Your Account</Link>
        </Button>
      ),
    });
  }

  if (isLoggedIn) {
    items.push({
      key: "edit",
      node: (
        <Button asChild variant="ghost" className="text-base px-3 py-1 text-white">
          <Link to="/edit">Edit profile</Link>
        </Button>
      ),
    });
    items.push({
      key: "logout",
      node: (
        <Button asChild variant="ghost" className="text-base px-3 py-1 text-white">
          <Link to="/logout">Log out</Link>
        </Button>
      ),
    });
  } else {
    items.push({
      key: "signup",
      node: (
        <Button asChild variant="ghost" className="text-base px-3 py-1 text-white">
          <Link to="/register">Sign up</Link>
        </Button>
      ),
    });
    items.push({
      key: "login",
      node: (
        <Button asChild variant="ghost" className="text-base px-3 py-1 text-white">
          <Link to="/login">Log in</Link>
        </Button>
      ),
    });
  }

  // 段分けロジックはそのままでOK（4なら [arr]）
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
        <Link to="/" className="text-3xl font-extrabold text-blue-900 hover:text-blue-700 transition-colors duration-200">
          FundMyThesis
        </Link>
        {isLoggedIn && (
          <span className="text-sm text-gray-500 italic pl-1">
            You are a <strong>{isSupporter ? "Supporter" : "Researcher"}</strong>
          </span>
        )}
      </div>

      {/* 段組みメニュー */}
      <nav className="bg-slate-800 text-white border-b shadow-sm">
        {rows.map((row, idx) => {
          const cols =
            row.length === 2 ? "grid-cols-2" :
            row.length === 4 ? "grid-cols-4" :
            "grid-cols-3";
          return (
            <div key={idx} className={`grid ${cols} gap-1 px-2 py-2`}>
              {row.map((it) => (
                <div key={it.key} className="flex justify-center">
                  {it.node}
                </div>
              ))}
            </div>
          );
        })}
      </nav>
    </>
  );
}
