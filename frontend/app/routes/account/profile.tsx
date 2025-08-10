import type { Route } from "./+types/profile";
import { useAuth } from "~/lib/auth";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  User,
  Package,
  Truck,
  Upload,
  Settings,
  ArrowRight,
} from "~/components/ui/icons";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "My Account - Lazada Lite" },
    {
      name: "description",
      content: "Manage your account settings and profile",
    },
  ];
}

export default function Profile() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  if (!user) {
    return null; // This will briefly show while redirecting
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "vendor":
        return <Package className='h-6 w-6' />;
      case "shipper":
        return <Truck className='h-6 w-6' />;
      default:
        return <User className='h-6 w-6' />;
    }
  };

  const getRoleColor = (role: string) => {
    return "bg-gray-100 text-gray-900";
  };

  const getRoleLinks = () => {
    switch (user.role) {
      case "vendor":
        return [
          { href: "/vendor/products", label: "My Products" },
          { href: "/vendor/products/new", label: "Add New Product" },
        ];
      case "shipper":
        return [{ href: "/shipper/orders", label: "Active Orders" }];
      case "customer":
        return [
          { href: "/products", label: "Browse Products" },
          { href: "/cart", label: "Shopping Cart" },
        ];
      default:
        return [];
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    try {
      // TODO: Implement actual file upload
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate upload
      toast.success("Profile picture updated");
      setFile(null);
    } catch (error) {
      toast.error("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className='container mx-auto px-4 py-10'>
      <div className='max-w-4xl mx-auto space-y-10'>
        {/* Header */}
        <div className='text-center'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>My Account</h1>
          <p className='text-gray-600'>
            Manage your account settings and profile information
          </p>
        </div>

        {/* Profile Overview */}
        <Card>
          <CardHeader>
            <div className='flex items-center space-x-4'>
              <Avatar className='h-16 w-16'>
                <AvatarFallback className='bg-gray-100 text-gray-900'>
                  {getRoleIcon(user.role)}
                </AvatarFallback>
              </Avatar>
              <div className='flex-1'>
                <div className='flex items-center gap-3 mb-2'>
                  <CardTitle className='text-2xl'>
                    {user.name || user.businessName || user.username}
                  </CardTitle>
                  <Badge
                    className={`rounded-full border bg-white ${getRoleColor(user.role)} px-2 py-0.5 text-xs`}
                  >
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                </div>
                <CardDescription className='text-lg'>
                  @{user.username}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
              <div className='space-y-4'>
                <h3 className='font-semibold text-gray-900'>
                  Account Information
                </h3>
                <div className='space-y-3 text-sm'>
                  <div className='flex justify-between border-b pb-2'>
                    <span className='text-gray-600'>Username:</span>
                    <span className='font-medium'>{user.username}</span>
                  </div>
                  <div className='flex justify-between border-b pb-2'>
                    <span className='text-gray-600'>Role:</span>
                    <span className='font-medium capitalize'>{user.role}</span>
                  </div>
                  {user.name && (
                    <div className='flex justify-between border-b pb-2'>
                      <span className='text-gray-600'>Name:</span>
                      <span className='font-medium'>{user.name}</span>
                    </div>
                  )}
                  {user.businessName && (
                    <div className='flex justify-between border-b pb-2'>
                      <span className='text-gray-600'>Business:</span>
                      <span className='font-medium'>{user.businessName}</span>
                    </div>
                  )}
                  {user.distributionHub && (
                    <div className='flex justify-between border-b pb-2'>
                      <span className='text-gray-600'>Hub:</span>
                      <span className='font-medium'>
                        {user.distributionHub}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className='space-y-4'>
                <h3 className='font-semibold text-gray-900'>Quick Actions</h3>
                <div className='space-y-2'>
                  {getRoleLinks().map((link, index) => (
                    <button
                      key={index}
                      onClick={() => navigate(link.href)}
                      className='group w-full inline-flex items-center justify-between rounded-lg border px-3 py-2 text-left hover:bg-gray-50'
                    >
                      <span className='inline-flex items-center gap-2'>
                        <Settings className='h-4 w-4' />
                        {link.label}
                      </span>
                      <ArrowRight className='h-4 w-4 opacity-70 transition-transform group-hover:translate-x-0.5' />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Picture Upload */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Upload className='h-5 w-5' />
              Profile Picture
            </CardTitle>
            <CardDescription>
              Update your profile picture. This will be visible to other users
              on the platform.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='flex items-center gap-4'>
                <Input
                  type='file'
                  accept='image/*'
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className='flex-1 border-dashed'
                />
                <Button
                  onClick={handleUpload}
                  disabled={!file || isUploading}
                  className='min-w-[110px]'
                >
                  {isUploading ? "Uploading..." : "Upload"}
                </Button>
              </div>
              <p className='text-xs text-gray-600'>PNG or JPG up to 2MB.</p>
              {file && (
                <p className='text-sm text-gray-600'>
                  Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)}{" "}
                  MB)
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Account Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Account Activity</CardTitle>
            <CardDescription>
              Your activity summary on Lazada Lite
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-center'>
              <div className='space-y-2 rounded-lg border p-4'>
                <div className='text-2xl font-bold text-gray-900'>
                  {user.role === "customer"
                    ? "12"
                    : user.role === "vendor"
                      ? "8"
                      : "25"}
                </div>
                <div className='text-sm text-gray-600'>
                  {user.role === "customer"
                    ? "Orders Placed"
                    : user.role === "vendor"
                      ? "Products Listed"
                      : "Deliveries Made"}
                </div>
              </div>
              <div className='space-y-2 rounded-lg border p-4'>
                <div className='text-2xl font-bold text-gray-900'>
                  {user.role === "customer"
                    ? "3"
                    : user.role === "vendor"
                      ? "45"
                      : "98%"}
                </div>
                <div className='text-sm text-gray-600'>
                  {user.role === "customer"
                    ? "Items in Cart"
                    : user.role === "vendor"
                      ? "Total Sales"
                      : "Success Rate"}
                </div>
              </div>
              <div className='space-y-2 rounded-lg border p-4'>
                <div className='text-2xl font-bold text-gray-900'>
                  {user.role === "customer"
                    ? "5"
                    : user.role === "vendor"
                      ? "4.8"
                      : "4.9"}
                </div>
                <div className='text-sm text-gray-600'>
                  {user.role === "customer"
                    ? "Wishlist Items"
                    : user.role === "vendor"
                      ? "Avg Rating"
                      : "Customer Rating"}
                </div>
              </div>
              <div className='space-y-2 rounded-lg border p-4'>
                <div className='text-2xl font-bold text-gray-900'>7</div>
                <div className='text-sm text-gray-600'>Days Active</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Educational Notice */}
        <div className='bg-gray-50 border border-gray-200 rounded-xl p-6'>
          <h3 className='font-semibold text-gray-900 mb-2'>
            Educational Project
          </h3>
          <p className='text-gray-700 text-sm'>
            This is a demonstration account for learning purposes. All data
            shown is mock data and no real transactions or personal information
            is processed.
          </p>
        </div>
      </div>
    </div>
  );
}
