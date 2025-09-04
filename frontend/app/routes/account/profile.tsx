/* RMIT University Vietnam 
# Course: COSC2769 - Full Stack Development 
# Semester: 2025B 
# Assessment: Assignment 02 
# Author: Tran Hoang Linh
# ID: s4043097 */

import type { Route } from "./+types/profile";
import { useAuth } from "~/lib/auth";
import { uploadProfileImageApi, updatePasswordApi } from "~/lib/api";
import {
  profileImageUploadSchema,
  passwordChangeSchema,
} from "~/lib/validators";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Field } from "~/components/shared/Field";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { z } from "zod";
import { getBackendImageUrl, getApiErrorMessage } from "~/lib/utils";
import {
  User,
  Package,
  Truck,
  Upload,
  Settings,
  ArrowRight,
  XCircle,
  Eye,
  EyeOff,
} from "~/components/ui/icons";

type ProfileImageFormValues = z.infer<typeof profileImageUploadSchema>;
type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>;

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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentProfilePicture, setCurrentProfilePicture] = useState<
    string | null
  >(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const { register, handleSubmit, formState, watch, reset } =
    useForm<ProfileImageFormValues>({
      resolver: zodResolver(profileImageUploadSchema),
    });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: passwordFormState,
    reset: resetPassword,
  } = useForm<PasswordChangeFormValues>({
    resolver: zodResolver(passwordChangeSchema),
  });

  const watchedFile = watch("profileImage");

  // initialize current profile picture from user data
  useEffect(() => {
    if (user?.profile_picture && user.profile_picture.trim() !== "") {
      setCurrentProfilePicture(user.profile_picture);
    }
  }, [user?.profile_picture]);

  // redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
    }
  }, [user, navigate]);

  if (!user) {
    return null;
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

  const getUserAvatarUrl = () => {
    return getBackendImageUrl(currentProfilePicture);
  };

  const getUserInitials = () => {
    const name = user?.name || user?.businessName || user?.username;
    if (name) {
      return name
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase())
        .slice(0, 2)
        .join("");
    }
    return user?.username?.charAt(0).toUpperCase() || "U";
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

  // Handle file selection and preview
  useEffect(() => {
    if (watchedFile && watchedFile[0]) {
      const file = watchedFile[0];
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      // Cleanup function
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setPreviewUrl(null);
    }
  }, [watchedFile]);

  // Cleanup preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const onSubmit = async (data: ProfileImageFormValues) => {
    const file = data.profileImage[0];

    setIsUploading(true);
    try {
      const result = await uploadProfileImageApi(file);

      if (result.success) {
        toast.success("Profile picture updated successfully!");
        if (result.imageUrl) {
          // Update the current profile picture to immediately reflect the change
          setCurrentProfilePicture(result.imageUrl);
          console.log("New profile image URL:", result.imageUrl);
        }
        reset();
        setPreviewUrl(null);
      } else {
        toast.error("Upload failed. Please try again.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage = getApiErrorMessage(
        error,
        "Upload failed. Please try again."
      );
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelUpload = () => {
    reset();
    setPreviewUrl(null);
    toast.info("Image selection cancelled");
  };

  const onSubmitPassword = async (data: PasswordChangeFormValues) => {
    setIsChangingPassword(true);
    try {
      const res = await updatePasswordApi({
        password: data.currentPassword,
        newPassword: data.newPassword,
      });
      if (res.success) {
        toast.success(res.message ?? "Password updated successfully");
        resetPassword();
      } else {
        toast.error(res.message ?? "Failed to update password");
      }
    } catch (error) {
      console.error("Update password error:", error);
      const errorMessage = getApiErrorMessage(
        error,
        "Failed to update password. Please try again."
      );
      toast.error(errorMessage);
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className='container mx-auto px-4 py-10'>
      <div className='max-w-4xl mx-auto space-y-10'>
        {/* Header */}
        <div className='text-center'>
          <h1 className='text-3xl font-bold text-foreground mb-2'>
            My Account
          </h1>
          <p className='text-muted-foreground'>
            Manage your account settings and profile information
          </p>
        </div>

        {/* Profile Overview */}
        <Card>
          <CardHeader>
            <div className='flex items-center space-x-4'>
              <Avatar className='h-16 w-16'>
                {getUserAvatarUrl() && (
                  <AvatarImage
                    src={getUserAvatarUrl()!}
                    alt={`${user?.name || user?.username}'s profile picture`}
                    className='object-cover'
                  />
                )}
                <AvatarFallback className='bg-muted text-foreground text-lg font-medium'>
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className='flex-1'>
                <div className='flex items-center gap-3 mb-2'>
                  <CardTitle className='text-2xl'>
                    {user.name || user.businessName || user.username}
                  </CardTitle>
                  <Badge
                    className={`rounded-full border bg-background ${getRoleColor(user.role)} px-2 py-0.5 text-xs`}
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
                <h3 className='font-semibold text-foreground'>
                  Account Information
                </h3>
                <div className='space-y-3 text-sm'>
                  <div className='flex justify-between border-b pb-2'>
                    <span className='text-muted-foreground'>Username:</span>
                    <span className='font-medium'>{user.username}</span>
                  </div>
                  <div className='flex justify-between border-b pb-2'>
                    <span className='text-muted-foreground'>Role:</span>
                    <span className='font-medium capitalize'>{user.role}</span>
                  </div>
                  {user.name && (
                    <div className='flex justify-between border-b pb-2'>
                      <span className='text-muted-foreground'>Name:</span>
                      <span className='font-medium'>{user.name}</span>
                    </div>
                  )}
                  {user.businessName && (
                    <div className='flex justify-between border-b pb-2'>
                      <span className='text-muted-foreground'>Business:</span>
                      <span className='font-medium'>{user.businessName}</span>
                    </div>
                  )}
                  {user.distributionHub && (
                    <div className='flex justify-between border-b pb-2'>
                      <span className='text-muted-foreground'>Hub:</span>
                      <span className='font-medium'>
                        {user.distributionHub}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className='space-y-4'>
                <h3 className='font-semibold text-foreground'>Quick Actions</h3>
                <div className='space-y-2'>
                  {getRoleLinks().map((link, index) => (
                    <button
                      key={index}
                      onClick={() => navigate(link.href)}
                      className='group w-full inline-flex items-center justify-between rounded-lg border px-3 py-2 text-left hover:bg-accent'
                    >
                      <span className='inline-flex items-center gap-2'>
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
            <div className='space-y-6'>
              {/* Current Profile Picture */}
              <div className='flex items-center gap-4'>
                <span className='text-sm font-medium text-muted-foreground'>
                  Current:
                </span>
                <Avatar className='h-12 w-12'>
                  {getUserAvatarUrl() && (
                    <AvatarImage
                      src={getUserAvatarUrl()!}
                      alt='Current profile picture'
                      className='object-cover'
                    />
                  )}
                  <AvatarFallback className='bg-muted text-foreground text-sm'>
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <span className='text-sm text-muted-foreground'>
                  {getUserAvatarUrl()
                    ? "Custom profile picture"
                    : "Default avatar (initials)"}
                </span>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                <Field
                  id='profileImage'
                  label='Select Image File'
                  error={formState.errors.profileImage?.message as string}
                >
                  <div className='space-y-4'>
                    <div className='flex items-center gap-4'>
                      <Input
                        type='file'
                        accept='image/*'
                        {...register("profileImage")}
                        className='flex-1 border-dashed'
                      />
                      <div className='flex gap-2'>
                        <Button
                          type='submit'
                          disabled={!watchedFile?.[0] || isUploading}
                          className='min-w-[110px]'
                        >
                          {isUploading ? "Uploading..." : "Upload"}
                        </Button>
                        {watchedFile?.[0] && (
                          <Button
                            type='button'
                            onClick={handleCancelUpload}
                            variant='outline'
                            disabled={isUploading}
                            className='min-w-[90px]'
                          >
                            <XCircle className='h-4 w-4 mr-2' />
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>

                    <p className='text-xs text-muted-foreground'>
                      PNG or JPG up to 10MB.
                    </p>

                    {watchedFile?.[0] && (
                      <div className='space-y-2'>
                        <p className='text-sm text-muted-foreground'>
                          Selected: {watchedFile[0].name} (
                          {(watchedFile[0].size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                        {previewUrl && (
                          <div className='flex items-center gap-3'>
                            <span className='text-sm text-muted-foreground'>
                              Preview:
                            </span>
                            <img
                              src={previewUrl}
                              alt='Preview'
                              className='w-16 h-16 object-cover rounded-md border'
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Field>
              </form>
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Settings className='h-5 w-5' />
              Change Password
            </CardTitle>
            <CardDescription>
              Update your account password. Make sure to use a strong password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmitPassword(onSubmitPassword)}
              className='space-y-4'
            >
              <Field
                id='currentPassword'
                label='Current Password'
                error={
                  (passwordFormState.errors.currentPassword
                    ?.message as string) || undefined
                }
              >
                <div className='relative'>
                  <Input
                    id='currentPassword'
                    type={showCurrentPassword ? "text" : "password"}
                    autoComplete='current-password'
                    {...registerPassword("currentPassword")}
                  />
                  <button
                    type='button'
                    aria-label='Toggle current password visibility'
                    aria-pressed={showCurrentPassword}
                    className='absolute inset-y-0 right-0 z-10 grid place-items-center px-3 text-muted-foreground hover:text-foreground'
                    onClick={() => setShowCurrentPassword((v) => !v)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className='h-4 w-4' />
                    ) : (
                      <Eye className='h-4 w-4' />
                    )}
                  </button>
                </div>
              </Field>

              <Field
                id='newPassword'
                label='New Password'
                error={
                  (passwordFormState.errors.newPassword?.message as string) ||
                  undefined
                }
              >
                <div className='relative'>
                  <Input
                    id='newPassword'
                    type={showNewPassword ? "text" : "password"}
                    autoComplete='new-password'
                    {...registerPassword("newPassword")}
                  />
                  <button
                    type='button'
                    aria-label='Toggle new password visibility'
                    aria-pressed={showNewPassword}
                    className='absolute inset-y-0 right-0 z-10 grid place-items-center px-3 text-muted-foreground hover:text-foreground'
                    onClick={() => setShowNewPassword((v) => !v)}
                  >
                    {showNewPassword ? (
                      <EyeOff className='h-4 w-4' />
                    ) : (
                      <Eye className='h-4 w-4' />
                    )}
                  </button>
                </div>
              </Field>

              <Field
                id='confirmNewPassword'
                label='Confirm New Password'
                error={
                  (passwordFormState.errors.confirmNewPassword
                    ?.message as string) || undefined
                }
              >
                <div className='relative'>
                  <Input
                    id='confirmNewPassword'
                    type={showConfirmNewPassword ? "text" : "password"}
                    autoComplete='new-password'
                    {...registerPassword("confirmNewPassword")}
                  />
                  <button
                    type='button'
                    aria-label='Toggle confirm new password visibility'
                    aria-pressed={showConfirmNewPassword}
                    className='absolute inset-y-0 right-0 z-10 grid place-items-center px-3 text-muted-foreground hover:text-foreground'
                    onClick={() => setShowConfirmNewPassword((v) => !v)}
                  >
                    {showConfirmNewPassword ? (
                      <EyeOff className='h-4 w-4' />
                    ) : (
                      <Eye className='h-4 w-4' />
                    )}
                  </button>
                </div>
              </Field>

              <div className='flex gap-2'>
                <Button type='submit' disabled={isChangingPassword}>
                  {isChangingPassword ? "Updating..." : "Update Password"}
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  disabled={isChangingPassword}
                  onClick={() => resetPassword()}
                >
                  Clear
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Educational Notice */}
        <div className='bg-muted border border-border rounded-xl p-6'>
          <h3 className='font-semibold text-foreground mb-2'>
            Educational Project
          </h3>
          <p className='text-muted-foreground text-sm'>
            This is a demonstration account for learning purposes. All data
            shown is mock data and no real transactions or personal information
            is processed.
          </p>
        </div>
      </div>
    </div>
  );
}
