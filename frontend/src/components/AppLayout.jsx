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

  const isVerifyDisabled = !isLoggedIn || isSupporter;
  const verifyTooltip = !isLoggedIn
    ? "Please log in"
    : isSupporter
    ? "Supporters cannot verify identity"
    : "";

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="h-20 bg-white-500 text-blue-900 border-b border-blue-200 flex items-center justify-between px-8 shadow-lg">
        <div className="flex items-center">
          <Link to="/" className="text-4xl font-extrabold text-blue-900 hover:text-blue-700 transition-colors duration-200">
            FundMyThesis
          </Link>
        </div>

        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="text-xl font-medium hover:text-blue-600 hover:underline hover:decoration-blue-600 transition-all duration-200 flex items-center"
          >
            Home
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="text-xl font-medium text-blue-900 hover:bg-transparent hover:text-blue-600 hover:underline hover:decoration-blue-600 transition-all duration-200 flex items-center"
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

          <AdminLink />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="text-xl font-medium text-blue-900 hover:bg-transparent hover:text-blue-600 hover:underline hover:decoration-blue-600 transition-all duration-200 flex items-center"
              >
                Profile
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-blue-100 text-blue-900 border border-blue-200 shadow-lg rounded-md overflow-hidden">
              <DropdownMenuItem asChild>
                <Link
                  to="/register"
                  className="block px-4 py-2 text-base hover:bg-blue-200 hover:text-blue-900 transition-colors duration-200"
                >
                  Sign up
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  to="/login"
                  className="block px-4 py-2 text-base hover:bg-blue-200 hover:text-blue-900 transition-colors duration-200"
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
                  title={isEditDisabled ? "Please log in" : ""}
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
                  Identity Verification
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  to="/logout"
                  className="block px-4 py-2 text-base hover:bg-blue-200 hover:text-blue-900 transition-colors duration-200"
                >
                  Log out
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      <div className="md:hidden">
        <MobileMenu />
      </div>

      <main>
        {children}
      </main>

      <footer className="text-center text-sm text-gray-500 py-4 border-t">
        © {new Date().getFullYear()} FundMyThesis. All rights reserved.
      </footer>
    </div>
  );
}

