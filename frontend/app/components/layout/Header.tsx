/* RMIT University Vietnam 
# Course: COSC2769 - Full Stack Development 
# Semester: 2025B 
# Assessment: Assignment 02 
# Author: Tran Hoang Linh
# ID: s4043097 */

import { Link, useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { useAuth } from "~/lib/auth";
import { logoutApi } from "~/lib/api";
import { getBackendImageUrl } from "~/lib/utils";
import {
  ShoppingCart,
  User,
  Package,
  Truck,
  Sun,
  Moon,
} from "~/components/ui/icons";
import { useTheme } from "~/lib/theme";

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch (e) {
      // Ignore API failure; still clear local state to protect UX/security
    } finally {
      logout();
      navigate("/");
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "vendor":
        return <Package className='h-4 w-4' />;
      case "shipper":
        return <Truck className='h-4 w-4' />;
      default:
        return <User className='h-4 w-4' />;
    }
  };

  const getUserInitials = () => {
    if (!user) return "U";
    const name = user.name || user.businessName || user.username;
    if (name) {
      return name
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase())
        .slice(0, 2)
        .join("");
    }
    return user.username?.charAt(0).toUpperCase() || "U";
  };

  const getRoleLinks = () => {
    if (!user) return null;

    switch (user.role) {
      case "vendor":
        return (
          <>
            <DropdownMenuItem asChild>
              <Link to='/vendor/products'>My Products</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to='/vendor/products/new'>Add Product</Link>
            </DropdownMenuItem>
          </>
        );
      case "shipper":
        return (
          <DropdownMenuItem asChild>
            <Link to='/shipper/orders'>Active Orders</Link>
          </DropdownMenuItem>
        );
      case "customer":
        return (
          <DropdownMenuItem asChild>
            <Link to='/cart'>Shopping Cart</Link>
          </DropdownMenuItem>
        );
      default:
        return null;
    }
  };

  return (
    <header className='border-b bg-white dark:bg-gray-950'>
      <div className='container mx-auto flex items-center justify-between px-4 py-3'>
        <Link to='/' className='flex items-center gap-2'>
          <div className='h-8 w-8 bg-black dark:bg-white rounded flex items-center justify-center'>
            <span className='text-white dark:text-black font-bold text-sm'>
              L
            </span>
          </div>
          <span className='font-semibold text-xl'>Lazada Lite</span>
        </Link>

        <nav className='hidden md:flex items-center gap-6'>
          {/* Only show Browse Products for customers and unauthenticated users */}
          {(!user || user.role === "customer") && (
            <Link
              to='/products'
              className='text-sm hover:underline transition-colors'
            >
              Browse Products
            </Link>
          )}
          {user && user.role === "vendor" && (
            <Link
              to='/vendor/products'
              className='text-sm hover:underline transition-colors'
            >
              My Products
            </Link>
          )}
          {user && user.role === "shipper" && (
            <Link
              to='/shipper/orders'
              className='text-sm hover:underline transition-colors'
            >
              Active Orders
            </Link>
          )}
          <Link
            to='/about'
            className='text-sm hover:underline transition-colors'
          >
            About
          </Link>
          <Link
            to='/help'
            className='text-sm hover:underline transition-colors'
          >
            Help
          </Link>
        </nav>

        <div className='flex items-center gap-3'>
          <Button
            variant='ghost'
            size='icon'
            aria-label='Toggle theme'
            onClick={toggleTheme}
          >
            {theme === "dark" ? (
              <Sun className='h-5 w-5' />
            ) : (
              <Moon className='h-5 w-5' />
            )}
          </Button>
          {isAuthenticated() && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='flex items-center gap-2'>
                  <Avatar className='h-8 w-8'>
                    {getBackendImageUrl(user?.profile_picture) && (
                      <AvatarImage
                        src={getBackendImageUrl(user.profile_picture)!}
                        alt={`${user?.name || user?.username}'s profile picture`}
                        className='object-cover'
                      />
                    )}
                    <AvatarFallback className='bg-gray-100 text-gray-900 text-xs font-medium'>
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <span className='hidden sm:inline'>
                    {user.name || user.businessName || user.username}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem asChild>
                  <Link to='/account'>My Account</Link>
                </DropdownMenuItem>
                {getRoleLinks()}
                <DropdownMenuItem onClick={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className='flex items-center gap-2'>
              <Link to='/login'>
                <Button variant='outline' size='sm'>
                  Login
                </Button>
              </Link>
              <Link to='/register/customer'>
                <Button size='sm'>Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
