import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { Resend } from "resend";
import { db } from "~/db"; // your drizzle instance
import { account, session, user, verification } from "~/db/schemas/auth-schema";
import { admin } from "better-auth/plugins"

const resend = new Resend(process.env.RESEND_API_KEY);
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // or "mysql", "sqlite"
    schema: {
      user,
      session,
      account,
      verification,
    },
  }),
  plugins: [
    admin()
  ], 
  emailVerification: {
    sendOnSignUp: true, // 注册时自动发送验证邮件
    autoSignInAfterVerification: true, // 验证后自动登录
    sendVerificationEmail: async ({ user, url }) => {
      console.log(`发送验证邮件给 ${user.email}: ${url}`);

      try {
        var response = await resend.emails.send({
          from: "onboarding@aaaa.com", // 替换为你的域名
          to: user.email,
          subject: "请验证您的邮箱",
          html: `
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                  <h2 style="color: #333;">欢迎注册！</h2>
                  <p>感谢您的注册，请点击下面的按钮验证您的邮箱地址：</p>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${url}" 
                       style="background-color: #007bff; color: white; padding: 12px 24px; 
                              text-decoration: none; border-radius: 5px; display: inline-block;">
                      验证邮箱
                    </a>
                  </div>
                  <p style="color: #666; font-size: 14px;">
                    如果按钮无法点击，请复制以下链接到浏览器地址栏：<br>
                    <a href="${url}">${url}</a>
                  </p>
                  <p style="color: #666; font-size: 12px;">
                    此链接将在24小时后过期。如果您没有注册账户，请忽略此邮件。
                  </p>
                </div>
              `,
        });
        console.log("发送验证邮件成功:", response);
      } catch (error) {
        console.error("发送验证邮件失败:", error);
        throw error;
      }
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true, // 要求邮箱验证
  },

  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});
