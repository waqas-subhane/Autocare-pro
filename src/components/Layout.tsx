import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "./ThemeProvider";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Car, LogOut, User as UserIcon, Calendar } from "lucide-react";
import { auth } from "@/src/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Layout({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme();
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 font-sans">
      <header className="sticky top-0 z-50 w-full bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto flex h-20 items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-3 font-extrabold text-2xl tracking-tighter">
            <span className="text-3xl">🏎️</span>
            <span>AutoCare Pro</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-wide">
            <Link to="/" className="transition-opacity hover:opacity-80 border-b-2 border-transparent hover:border-white pb-1">Book Service</Link>
            {user && <Link to="/appointments" className="transition-opacity hover:opacity-80 border-b-2 border-transparent hover:border-white pb-1">My Appointments</Link>}
          </nav>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="flex items-center gap-2 cursor-pointer">
                      <span className="text-xs font-bold hidden sm:inline">{user.displayName || "User"}</span>
                      <div className="h-8 w-8 rounded-full bg-yellow-400 border-2 border-white flex items-center justify-center text-black font-bold text-xs">
                        {user.displayName?.[0] || <UserIcon className="h-4 w-4" />}
                      </div>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-bold">{user.displayName || "User"}</p>
                        <p className="w-[180px] truncate text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuItem asChild>
                      <Link to="/appointments" className="flex items-center gap-2 font-semibold">
                        <Calendar className="h-4 w-4" /> My Appointments
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive font-semibold">
                      <LogOut className="h-4 w-4 mr-2" /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button asChild variant="secondary" className="h-8 rounded-full font-bold text-xs">
                  <Link to="/login">Login</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10">
        {children}
      </main>

      <footer className="bg-card border-t py-10">
        <div className="container mx-auto flex flex-col items-center justify-between gap-6 md:flex-row px-6">
          <div className="flex items-center gap-2 font-bold text-xl opacity-50">
            <span>🏎️</span> AutoCare Pro
          </div>
          <p className="text-center text-sm font-medium text-muted-foreground md:text-left">
            © 2026 AutoCare Pro. Premium Automotive Excellence.
          </p>
        </div>
      </footer>
    </div>
  );
}
