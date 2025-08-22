import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { authClient } from "~/lib/auth-client";

const formSchema = z.object({
  email: z.email("请输入有效的邮箱地址"),
});

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleForgotPassword = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      await authClient.forgetPassword({
        email: values.email,
        redirectTo: "/reset-password",
      });
      setIsSent(true);
      toast.success("重置密码邮件已发送，请检查您的邮箱");
    } catch (error: any) {
      toast.error(error.message || "发送失败，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">重置密码</CardTitle>
          <CardDescription>
            {isSent
              ? "请检查您的邮箱，我们已发送密码重置链接"
              : "输入您的邮箱地址，我们将发送密码重置链接给您"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSent ? (
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                如果您没有收到邮件，请检查垃圾邮件文件夹，或等待几分钟后重试。
              </p>
              <Button
                variant="outline"
                onClick={() => setIsSent(false)}
                className="w-full"
              >
                重新发送
              </Button>
              <Button asChild variant="link" className="w-full">
                <Link to="/sign-in">返回登录</Link>
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleForgotPassword)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>邮箱地址</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="请输入您的注册邮箱"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "发送中..." : "发送重置链接"}
                </Button>

                <Button asChild variant="link" className="w-full">
                  <Link to="/sign-in">返回登录</Link>
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
