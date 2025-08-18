import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { z } from "zod";
import { Button } from "~/components/ui/button";
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
  email: z.email("请输入有效的邮箱地址").min(1, "邮箱不能为空"),
  password: z.string().min(1, "密码不能为空"),
});

const AdminLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signIn = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setError("");

    try {
      await authClient.signIn.email(
        {
          email: values.email,
          password: values.password,
        },
        {
          onRequest: () => {
            setIsLoading(true);
          },
          onSuccess: () => {
            navigate("/admin/index");
          },
          onError: (ctx: any) => {
            setError(ctx.error?.message || "登录失败，请检查您的邮箱和密码");
            setIsLoading(false);
          },
        }
      );
    } catch (err) {
      setError("登录失败，请稍后重试");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-screen min-h-screen flex items-center justify-center bg-background">
      <div className="w-1/2 space-x-3 flex items-center justify-center">
        <div className="w-2/3 ">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">欢迎回来</h1>
            <p className="text-sm text-muted-foreground">登录您的账户以继续</p>
          </div>

          <div className="space-y-4 max-w-m">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(signIn)} className="space-y-4">
                {error && (
                  <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                    {error}
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>邮箱</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="输入您的邮箱"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>密码</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="输入您的密码"
                          {...field}
                          disabled={isLoading}
                          autoComplete="true"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "登录中..." : "登录"}
                </Button>
              </form>
            </Form>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">还没有账户？</span>{" "}
              <Link
                to="/sign-up"
                className="text-primary hover:underline font-medium"
              >
                立即注册
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gray-500 w-1/2 h-screen">
      
      </div>
    </div>
  );
};
export default AdminLogin;
