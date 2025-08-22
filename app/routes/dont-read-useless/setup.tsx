import { zodResolver } from "@hookform/resolvers/zod";
import { eq } from "drizzle-orm";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "react-router";
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
import { db } from "~/db";
import { user } from "~/db/schemas/auth-schema";
import { auth } from "~/lib/auth";

const formSchema = z
  .object({
    name: z
      .string()
      .min(2, "姓名至少需要2个字符")
      .max(50, "姓名不能超过50个字符"),
    email: z.string().email("请输入有效的邮箱地址").min(1, "邮箱不能为空"),
    password: z.string().min(8, "密码至少需要8位").max(50, "密码不能超过50位"),
    confirmPassword: z
      .string()
      .min(8, "确认密码至少需要8位")
      .max(50, "确认密码不能超过50位"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "密码不匹配",
    path: ["confirmPassword"],
  });

// Loader function to check if superAdmin exists
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    // Query the database for superAdmin users
    const superAdminUsers = await db
      .select()
      .from(user)
      .where(eq(user.role, "superAdmin"));

    // If superAdmin exists, redirect to sign-in page
    if (superAdminUsers.length > 0) {
      return redirect("/sign-in");
    }

    // Otherwise, allow setup page to load
    return null;
  } catch (error) {
    console.error("Error checking for superAdmin users:", error);
    // If there's an error, still allow setup page to load
    return null;
  }
}

// Action function to handle form submission
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  // Validate form data
  const validationResult = formSchema.safeParse({
    name: data.name,
    email: data.email,
    password: data.password,
    confirmPassword: data.confirmPassword,
  });

  if (!validationResult.success) {
    return Response.json(
      {
        error: "表单验证失败",
        details: validationResult.error.flatten(),
      },
      { status: 400 }
    );
  }

  const { name, email, password } = validationResult.data;

  try {
    // Check if any user exists (additional safety check)
    // const existingUsers = await db.select().from(user);
    // if (existingUsers.length > 0) {
    //   return Response.json({ error: "系统已经初始化过了" }, { status: 400 });
    // }

    // Create the superAdmin user using better-auth
    const signUpResult = await auth.api.createUser({
      body: {
        name,
        email,
        password,
        role: "superAdmin", // Set role to superAdmin
      },
    });

    if (!signUpResult.user) {
      return Response.json({ error: "创建管理员账户失败" }, { status: 400 });
    }

    // Return success
    return redirect('/sign-in')
  } catch (error) {
    console.error("Error creating superAdmin user:", error);
    return Response.json(
      { error: "创建管理员账户时发生错误，请稍后重试" },
      { status: 500 }
    );
  }
}

function SetupForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("error");

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setMessage("");

    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const response = await fetch("/setup", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setMessage("管理员账户创建成功！正在跳转到登录页面...");
        setMessageType("success");

        // Redirect to sign-in after 2 seconds
        setTimeout(() => {
          window.location.href = "/sign-in";
        }, 2000);
      } else {
        setMessage(result.error || "创建管理员账户失败");
        setMessageType("error");
      }
    } catch (error) {
      setMessage("创建管理员账户时发生错误，请稍后重试");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">系统初始化</h1>
          <p className="text-sm text-muted-foreground">
            创建管理员账户以开始使用系统
          </p>
        </div>

        <div className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {message && (
                <div
                  className={`p-3 text-sm rounded-md ${
                    messageType === "success"
                      ? "text-green-700 bg-green-50 border border-green-200 dark:text-green-400 dark:bg-green-950 dark:border-green-800"
                      : "text-destructive bg-destructive/10 border border-destructive/20"
                  }`}
                >
                  {message}
                </div>
              )}

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>管理员姓名</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="输入管理员姓名"
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>管理员邮箱</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="输入管理员邮箱地址"
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
                    <FormLabel>管理员密码</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="输入密码（至少8位）"
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
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>确认密码</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="再次输入密码"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "创建中..." : "完成初始化"}
              </Button>
            </form>
          </Form>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>初始化完成后，您可以使用此账户登录系统</p>
        </div>
      </div>
    </div>
  );
}

export default function Setup() {
  return <SetupForm />;
}
