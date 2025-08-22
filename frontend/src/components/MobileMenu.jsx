import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { AdminLink } from "./AdminLink";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export default function MobileMenu({ user }) {
  const isLoggedIn  = !!user;
  const isSupporter = user?.role === "supporter";
  const isVerified  = user?.is_verified == 1;
  const isAdmin     = user?.role === "admin" || user?.is_admin === 1;

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

  const btnBase  = "w-full min-h-11 py-2 text-white text-sm";
  const linkBase = "block w-full text-center whitespace-normal leading-snug";

  const items = [];

  items.push({
    key: "home",
    node: (
      <Button asChild variant="ghost" className={btnBase}>
        <Link className={linkBase} to="/">Home</Link>
      </Button>
    ),
  });

  if (!isLoggedIn || isSupporter) {
    items.push({
      key: "explore",
      node: (
        <Button
          variant="ghost"
          className={btnBase}
          onClick={() => {
            window.history.pushState({}, "", "/#explore");
            setTimeout(() => {
              document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" });
            }, 80);
          }}
        >
          <span className={linkBase}>Explore Projects</span>
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
              className={`${btnBase} ${isPostDisabled ? "text-gray-400" : "text-white"}`}
              title={isPostDisabled ? postTooltip : ""}
            >
              <span className={linkBase}>Projects</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-[12rem] bg-blue-100 text-blue-900 border border-blue-200 shadow-lg rounded-md overflow-hidden">
            <DropdownMenuItem asChild>
              <Link
                to={isPostDisabled ? "#" : "/post"}
                onClick={preventIfDisabled}
                className={`block px-4 py-2 text-sm ${isPostDisabled ? "text-gray-400 cursor-not-allowed" : "hover:bg-blue-200 hover:text-blue-900"}`}
                title={isPostDisabled ? postTooltip : ""}
              >
                New Project
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                to={isPostDisabled ? "#" : "/myprojects"}
                onClick={preventIfDisabled}
                className={`block px-4 py-2 text-sm ${isPostDisabled ? "text-gray-400 cursor-not-allowed" : "hover:bg-blue-200 hover:text-blue-900"}`}
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
        <div className="w-full min-h-11 flex items-center justify-center">
         
          <AdminLink user={user} />
        </div>
      ),
    });
  }

  if (isLoggedIn && !isVerified && !isSupporter) {
    items.push({
      key: "verify",
      node: (
        <Button asChild variant="ghost" className={`${btnBase} text-red-300`}>
          <Link className={linkBase} to="/verify">Verify Your Account</Link>
        </Button>
      ),
    });
  }

  if (isLoggedIn) {
    items.push({
      key: "edit",
      node: (
        <Button asChild variant="ghost" className={btnBase}>
          <Link className={linkBase} to="/edit">Edit profile</Link>
        </Button>
      ),
    });
    items.push({
      key: "logout",
      node: (
        <Button asChild variant="ghost" className={btnBase}>
          <Link className={linkBase} to="/logout">Log out</Link>
        </Button>
      ),
    });
  } else {
    items.push({
      key: "signup",
      node: (
        <Button asChild variant="ghost" className={btnBase}>
          <Link className={linkBase} to="/register">Sign up</Link>
        </Button>
      ),
    });
    items.push({
      key: "login",
      node: (
        <Button asChild variant="ghost" className={btnBase}>
          <Link className={linkBase} to="/login">Log in</Link>
        </Button>
      ),
    });
  }

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
  const fourTight = items.length === 4 ? "text-[13.5px] px-1" : "";

  return (
    <>
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

      <nav className="bg-slate-800 text-white border-b shadow-sm">
        {rows.map((row, idx) => {
          const cols = row.length === 2 ? "grid-cols-2" : row.length === 4 ? "grid-cols-4" : "grid-cols-3";
          return (
            <div key={idx} className={`grid ${cols} divide-x divide-white/10`}>
              {row.map((it) => (
                <div key={it.key} className="flex items-stretch">
                  <div className={`w-full px-2 py-1 ${fourTight}`}>{it.node}</div>
                </div>
              ))}
            </div>
          );
        })}
      </nav>
    </>
  );
}
