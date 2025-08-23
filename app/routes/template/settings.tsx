import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { useAuth } from "~/lib/use-auth";
import { authClient } from "~/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

const profileFormSchema = z.object({
  name: z.string().min(2, "姓名至少需要2个字符").max(50, "姓名不能超过50个字符"),
  email: z.email("请输入有效的邮箱地址"),
});

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, "当前密码不能为空"),
  newPassword: z.string().min(8, "新密码至少需要8位").max(50, "新密码不能超过50位"),
  confirmPassword: z.string().min(1, "确认密码不能为空"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "新密码与确认密码不匹配",
  path: ["confirmPassword"],
});

export default function SettingsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
    values: {
      name: user?.name || "",
      email: user?.email || "",
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const updateProfile = async (values: z.infer<typeof profileFormSchema>) => {
    setIsUpdatingProfile(true);
    try {
      await authClient.updateUser({
        name: values.name,
        // Note: email update might require verification
      });
      toast.success("个人资料更新成功");
    } catch (error: any) {
      toast.error(error.message || "更新失败，请稍后重试");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const updatePassword = async (values: z.infer<typeof passwordFormSchema>) => {
    setIsUpdatingPassword(true);
    try {
      await authClient.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      toast.success("密码更新成功");
      passwordForm.reset();
    } catch (error: any) {
      toast.error(error.message || "密码更新失败");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    navigate("/sign-in");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">账户设置</h1>
          <p className="text-muted-foreground">管理您的账户信息和偏好设置</p>
        </div>

        <div className="space-y-8">
          {/* 个人资料 */}
          <Card>
            <CardHeader>
              <CardTitle>个人资料</CardTitle>
              <CardDescription>
                更新您的个人信息和邮箱地址
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(updateProfile)} className="space-y-4">
                  <FormField
                    control={profileForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>姓名</FormLabel>
                        <FormControl>
                          <Input placeholder="您的姓名" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>邮箱</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="您的邮箱地址" 
                            {...field} 
                            disabled={true}
                            className="bg-muted"
                          />
                        </FormControl>
                        <FormDescription>
                          邮箱地址无法直接修改。如需修改，请联系管理员。
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" disabled={isUpdatingProfile}>
                    {isUpdatingProfile ? "保存中..." : "保存更改"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Separator />

          {/* 密码设置 */}
          <Card>
            <CardHeader>
              <CardTitle>密码</CardTitle>
              <CardDescription>
                定期更新您的密码以确保账户安全
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(updatePassword)} className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>当前密码</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="请输入当前密码" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>新密码</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="请输入新密码" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>确认新密码</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="请再次输入新密码" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" disabled={isUpdatingPassword}>
                    {isUpdatingPassword ? "更新中..." : "更新密码"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Separator />

          {/* 账户操作 */}
          <Card>
            <CardHeader>
              <CardTitle>账户操作</CardTitle>
              <CardDescription>
                管理您的账户状态和访问权限
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto"
                  onClick={() => navigate("/forgot-password")}
                >
                  忘记密码
                </Button>
                
                <Button 
                  variant="destructive" 
                  className="w-full sm:w-auto"
                  onClick={async () => {
                    if (confirm("确定要退出账户？")) {
                      try {
                        await authClient.signOut();
                        toast.success("已成功退出");
                        navigate("/sign-in");
                      } catch (error) {
                        toast.error("退出失败，请稍后重试");
                      }
                    }
                  }}
                >
                  注销账户
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}