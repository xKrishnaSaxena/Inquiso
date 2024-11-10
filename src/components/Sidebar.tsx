import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  MenuIcon,
  HomeIcon,
  MessageCircleIcon,
  LogInIcon,
  LogOutIcon,
  SunMoon,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";
import { useEffect } from "react";

export default function Sidebar() {
  const { darkMode } = useTheme();
  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="lg:hidden">
            <MenuIcon className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className={`w-[200px] sm:w-[240px] ${
            darkMode ? "dark bg-black text-white" : "bg-white text-black"
          }`}
        >
          <SidebarContent />
        </SheetContent>
      </Sheet>
      <div className="hidden lg:block w-[200px] border-r">
        <SidebarContent />
      </div>
    </>
  );
}

function SidebarContent() {
  const { token, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  function handleButton() {
    if (token) {
      logout();
      navigate("/");
    } else {
      navigate("/");
    }
  }
  useEffect(() => {}, [token, logout]);

  return (
    <div className="py-4">
      <h2 className="mb-4 px-4 text-lg font-semibold">Menu</h2>
      <nav className="space-y-1">
        <a
          onClick={toggleTheme}
          className=" flex items-center px-4 py-2 text-sm dark:bg-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900"
        >
          <SunMoon className="mr-2 h-4 w-4" />
          {darkMode ? "Light Mode" : "Dark Mode"}
        </a>
        <a
          href="/posts"
          className="flex items-center px-4 py-2 text-sm dark:bg-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900"
        >
          <HomeIcon className="mr-2 h-4 w-4" />
          Posts
        </a>
        <a
          href="/dashboard"
          className="flex items-center px-4 py-2 text-sm dark:bg-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900"
        >
          <MessageCircleIcon className="mr-2 h-4 w-4" />
          Live Q&A
        </a>

        <Button
          variant="ghost"
          className="w-full justify-start px-4 py-2 text-sm"
          onClick={handleButton}
        >
          {token ? (
            <>
              <LogOutIcon className="mr-2 h-4 w-4" />
              Logout
            </>
          ) : (
            <>
              <LogInIcon className="mr-2 h-4 w-4" />
              Login
            </>
          )}
        </Button>
      </nav>
    </div>
  );
}
