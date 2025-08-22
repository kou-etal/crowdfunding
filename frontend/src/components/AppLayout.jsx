import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { axiosInstance } from "../api/axiosInstance";
import ScrollManager from "@/components/ScrollManager";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { AdminLink } from "./AdminLink";
import MobileMenu from "./MobileMenu";
import Footer from "./Footer";

export default function AppLayout({ children }) {
  const [user, setUser] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const controller = new AbortController();

   
    axiosInstance
      .get("/api/session", { signal: controller.signal })
      .then((res) => {
        const data = res?.data;
        if (data && data.authenticated) {
          setUser(data.user || null);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null));

    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);

    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      controller.abort();
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", onScroll);
    };
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
    <div className="min-dvh flex flex-col">
      <ScrollManager />

      
      {isMobile ? (
        <div className="fixed inset-x-0 top-0 z-50 bg-white/75 supports-[backdrop-filter]:backdrop-blur-md border-b border-white/40">
          <MobileMenu user={user} />
        </div>
      ) : (
        <nav
          className={[
            "fixed inset-x-0 top-0 z-50",
            "h-16 md:h-20",
            "bg-white/60 supports-[backdrop-filter]:backdrop-blur-md border-b border-white/40",
            scrolled ? "bg-white/85 shadow-md" : "shadow-none",
            "text-blue-900 flex items-center justify-between px-4 sm:px-6 md:px-8 transition-[background-color,box-shadow] duration-300"
          ].join(" ")}
          role="navigation"
          aria-label="Global"
        >
         
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

          {/* 右：ナビ */}
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
                <DropdownMenuContent className="bg-white text-blue-900 border border-blue-200 shadow-lg rounded-md overflow-hidden">
                  <DropdownMenuItem asChild>
                    <Link
                      to={isPostDisabled ? "#" : "/post"}
                      className={`block px-4 py-2 text-sm md:text-base transition-colors duration-200 ${
                        isPostDisabled
                          ? "text-gray-400 cursor-not-allowed"
                          : "hover:bg-blue-50 hover:text-blue-900"
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
                          : "hover:bg-blue-50 hover:text-blue-900"
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

    
      <main className="w-full pt-20 md:pt-24">
        <div className="mt-3 md:mt-4" />
        {children}
      </main>

      <Footer />
    </div>
  );
}
