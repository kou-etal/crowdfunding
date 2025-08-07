import { useEffect, useState } from "react";
import { axiosInstance } from "../api/axiosInstance";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { AdminLink } from "./AdminLink";

export default function MobileMenu() {
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

  return (
    <>
      {/* 1段目: ロゴとロール */}
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

      {/* 2段目: メニュー（AppLayoutと同期） */}
      <nav className="bg-slate-800 text-white flex flex-wrap justify-around items-center py-2 border-b shadow-sm">
        <Button asChild variant="ghost" className="text-sm px-2 py-1 text-white">
          <Link to="/">Home</Link>
        </Button>

        {(!isLoggedIn || isSupporter) && (
          <Button
            onClick={() => {
              window.history.pushState({}, "", "/#explore");
              setTimeout(() => {
                const el = document.getElementById("explore");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }, 100);
            }}
            variant="ghost"
            className="text-sm px-2 py-1 text-white"
          >
            Explore Projects
          </Button>
        )}

        {isLoggedIn && !isSupporter && (
          <>
            <Button
              asChild
              variant="ghost"
              className={`text-sm px-2 py-1 ${
                isPostDisabled ? "text-gray-400" : "text-white"
              }`}
              title={postTooltip}
              disabled={isPostDisabled}
            >
              <Link to={isPostDisabled ? "#" : "/post"}>New Project</Link>
            </Button>

            <Button
              asChild
              variant="ghost"
              className={`text-sm px-2 py-1 ${
                isPostDisabled ? "text-gray-400" : "text-white"
              }`}
              title={postTooltip}
              disabled={isPostDisabled}
            >
              <Link to={isPostDisabled ? "#" : "/myprojects"}>My Projects</Link>
            </Button>
          </>
        )}

        <AdminLink />

        {isLoggedIn && !isVerified && !isSupporter && (
          <Button asChild variant="ghost" className="text-sm px-2 py-1 text-red-400">
            <Link to="/verify">Verify Your Account</Link>
          </Button>
        )}

        {isLoggedIn ? (
          <>
            <Button asChild variant="ghost" className="text-sm px-2 py-1 text-white">
              <Link to="/edit">Edit profile</Link>
            </Button>
            <Button asChild variant="ghost" className="text-sm px-2 py-1 text-white">
              <Link to="/logout">Log out</Link>
            </Button>
          </>
        ) : (
          <>
            <Button asChild variant="ghost" className="text-sm px-2 py-1 text-white">
              <Link to="/register">Sign up</Link>
            </Button>
            <Button asChild variant="ghost" className="text-sm px-2 py-1 text-white">
              <Link to="/login">Log in</Link>
            </Button>
          </>
        )}
      </nav>
    </>
  );
}

