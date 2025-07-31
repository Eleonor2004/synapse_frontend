// src/components/layout/NavBar.tsx
"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, User, LogIn, Home, Info, HelpCircle, Wrench, LayoutDashboard, LogOut } from "lucide-react";
import { ThemeSwitcher } from "../ThemeSwitcher";
import { LanguageSwitcher } from "../LanguageSwitcher";
import { useAuthStore } from '../../app/store/authStore';
import { useIsClient } from '../../hooks/useIsClient'; // Import the hook to prevent hydration errors

export function NavBar() {
  const t = useTranslations("NavBar");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  
  // --- REAL AUTHENTICATION STATE ---
  const { isAuthenticated, user, logout, initialize } = useAuthStore();
  // This custom hook returns `true` only after the component has mounted on the client
  const isClient = useIsClient();
  // ---------------------------------

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Initialize auth state from localStorage when the component first mounts
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Handle scroll effect for the header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close the mobile menu automatically when the user navigates to a new page
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const isActivePath = (path: string) => {
    return pathname === `/${locale}${path === '/' ? '' : path}`;
  };

  // --- Handle Logout Action ---
  const handleLogout = () => {
    logout(); // Call the logout action from our global store
    router.push(`/${locale}/login`); // Redirect the user to the login page
  };
  // --------------------------

  // Dynamically build the navigation items based on the authentication state
  const navigationItems = [
    { 
      href: '/', 
      label: t("home"), 
      icon: Home,
      active: isActivePath('/')
    },
    // --- HYDRATION FIX ---
    // Only add the "Workbench" item to the array if we are on the client AND the user is authenticated.
    // This ensures the server render and initial client render are identical.
    ...(isClient && isAuthenticated ? [{ 
      href: '/workbench', 
      label: 'Workbench', 
      icon: Wrench,
      active: isActivePath('/workbench')
    }] : []),
    // ---------------------
    { 
      href: '/about', 
      label: t("about"), 
      icon: Info,
      active: isActivePath('/about')
    },
    { 
      href: '/help', 
      label: t("help"), 
      icon: HelpCircle,
      active: isActivePath('/help')
    },
  ];

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'glass-morphism shadow-lg backdrop-blur-xl border-b border-white/20 dark:border-gray-700/50' 
            : 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50'
        }`}
      >
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-18">
            
            {/* Logo/Brand */}
            <Link 
              href={`/${locale}`} 
              className="flex items-center space-x-2 group"
            >
              <div className="relative">
                <div className="w-8 h-8 lg:w-10 lg:h-10 gradient-bg rounded-lg flex items-center justify-center shadow-brand transition-all duration-300 group-hover:shadow-brand-lg group-hover:scale-110">
                  <span className="text-white font-bold text-lg lg:text-xl">S</span>
                </div>
                <div className="absolute inset-0 gradient-bg rounded-lg opacity-0 group-hover:opacity-30 blur-md transition-all duration-300" />
              </div>
              <span className="font-bold text-xl lg:text-2xl gradient-text">
                SYNAPSE
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={`/${locale}${item.href === '/' ? '' : item.href}`}
                    className={`nav-link flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                      item.active 
                        ? 'bg-gradient-to-r from-[#1e0546]/10 to-[#8e43ff]/10 text-[#8e43ff] border border-[#8e43ff]/20' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-[#8e43ff] dark:hover:text-[#8e43ff]'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right side controls */}
            <div className="flex items-center space-x-3">
              
              {/* Dashboard/Login for Desktop */}
              <div className="hidden lg:flex items-center space-x-3">
                {/* --- HYDRATION FIX --- */}
                {isClient && isAuthenticated ? (
                  <>
                    <Link
                      href={`/${locale}/dashboard`}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                        isActivePath('/dashboard')
                          ? 'bg-gradient-to-r from-[#1e0546]/10 to-[#8e43ff]/10 text-[#8e43ff] border border-[#8e43ff]/20'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-[#8e43ff] dark:hover:text-[#8e43ff]'
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span className="font-medium">{user?.full_name || user?.username}</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 transition-all duration-300"
                      aria-label="Logout"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <Link
                    href={`/${locale}/login`}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#1e0546] to-[#8e43ff] text-white hover:shadow-brand transition-all duration-300 hover:scale-105"
                  >
                    <LogIn className="w-4 h-4" />
                    <span className="font-medium">Login</span>
                  </Link>
                )}
              </div>

              <LanguageSwitcher />
              <ThemeSwitcher />

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
                aria-label="Toggle mobile menu"
              >
                {isMenuOpen ? <X className="w-5 h-5 text-gray-700 dark:text-gray-300" /> : <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        </div>
      )}

      {/* Mobile Menu */}
      <div 
        className={`fixed top-16 left-0 right-0 z-50 lg:hidden transform transition-all duration-300 ease-in-out ${
          isMenuOpen 
            ? 'translate-y-0 opacity-100' 
            : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="glass-morphism m-4 rounded-xl shadow-xl border border-white/20 dark:border-gray-700/50 overflow-hidden">
          <nav className="py-4">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.href}
                  href={`/${locale}${item.href === '/' ? '' : item.href}`}
                  className={`flex items-center space-x-3 px-6 py-3 transition-all duration-300 ${
                    item.active 
                      ? 'bg-gradient-to-r from-[#1e0546]/10 to-[#8e43ff]/10 text-[#8e43ff] border-r-4 border-[#8e43ff]' 
                      : 'hover:bg-gray-100/50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:text-[#8e43ff] dark:hover:text-[#8e43ff]'
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
            
            {/* Mobile Auth Section */}
            <div className="border-t border-gray-200/50 dark:border-gray-700/50 mt-4 pt-4 px-6">
              {/* --- HYDRATION FIX --- */}
              {isClient && isAuthenticated ? (
                <>
                  <Link
                    href={`/${locale}/dashboard`}
                    className={`flex items-center space-x-3 py-3 transition-all duration-300 mb-2 ${
                      isActivePath('/dashboard')
                        ? 'text-[#8e43ff]'
                        : 'text-gray-700 dark:text-gray-300 hover:text-[#8e43ff] dark:hover:text-[#8e43ff]'
                    }`}
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    <span className="font-medium">{user?.full_name || user?.username}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 py-3 px-4 rounded-lg bg-red-500/10 text-red-500"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                  </button>
                </>
              ) : (
                <Link
                  href={`/${locale}/login`}
                  className="flex items-center justify-center space-x-3 py-3 px-4 rounded-lg bg-gradient-to-r from-[#1e0546] to-[#8e43ff] text-white shadow-brand transition-all duration-300"
                >
                  <LogIn className="w-5 h-5" />
                  <span className="font-medium">Login</span>
                </Link>
              )}
            </div>
          </nav>
        </div>
      </div>

      {/* Spacer to prevent content from hiding behind fixed navbar */}
      <div className="h-16 lg:h-18" />
    </>
  );
}