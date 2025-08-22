import { Image as ImageIcon, Mail, Pencil, Save, User } from "lucide-react";
import { useState } from "react";
import { redirect, type LoaderFunctionArgs } from "react-router";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { userContext } from "~/context";
import { authClient } from "~/lib/auth-client";
import type { Route } from "./+types/_layout.profile";

export async function loader({ context }: LoaderFunctionArgs) {
  const user = context.get(userContext);
  if (!user) return redirect("/login");
  return user;
}

interface ProfileFormData {
  name: string;
  image?: string;
}

export default function ProfilePage({ loaderData }: Route.ComponentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    name: loaderData.name || "",
    image: loaderData.image || "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(
    loaderData.image || ""
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("头像必须小于 5m");
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      // Handle avatar upload first if there's a new file
      let avatarUrl = formData.image;
      if (avatarFile) {
        // In a real app, you'd upload to a service like Cloudinary, S3, etc.
        // For now, we'll use base64 as a placeholder
        avatarUrl = avatarPreview;
      }
      const response = await authClient.updateUser({
        name: formData.name,
        image: avatarUrl,
      });
      if (response?.data?.status) {
        toast.success("Profile updated successfully");
        setIsEditing(false);
      } else {
        throw new Error("Update user profile failed");
      }
    } catch (error) {
      toast.error("Failed to update profile");
      console.error("Error updating profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="shadow-lg">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <User className="h-6 w-6" />
                User Profile
              </CardTitle>
              <CardDescription>
                Manage your personal information and preferences
              </CardDescription>
            </div>
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Pencil className="h-4 w-4" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: loaderData.name || "",
                      image: loaderData.image || "",
                    });
                    setAvatarPreview(loaderData.image || "");
                    setAvatarFile(null);
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveProfile}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-32 w-32 border-4 border-primary/10">
                <AvatarImage
                  src={avatarPreview || loaderData.image || ""}
                  alt={formData.name}
                />
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {getInitials(formData.name || loaderData.email || "User")}
                </AvatarFallback>
              </Avatar>

              {isEditing && (
                <div className="text-center">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <Label
                    htmlFor="avatar-upload"
                    className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 text-sm border rounded-md hover:bg-accent"
                  >
                    <ImageIcon className="h-4 w-4" />
                    Change Avatar
                  </Label>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Enter your full name"
                  className={isEditing ? "border-primary" : ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  disabled
                  defaultValue={loaderData.email}
                />
              </div>

              <div className="space-y-2">
                <Label>User ID</Label>
                <Input value={loaderData.id} disabled className="bg-muted" />
              </div>

              <div className="space-y-2">
                <Label>Account Created</Label>
                <Input
                  value={
                    loaderData.createdAt
                      ? new Date(loaderData.createdAt).toLocaleDateString()
                      : "N/A"
                  }
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
