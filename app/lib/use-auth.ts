import { useEffect, useState } from "react";
import { authClient } from "~/lib/auth-client";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      try {
        const session = await authClient.getSession();
        if (session?.data?.user) {
          setUser(session.data.user as User);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("获取用户会话失败:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    getSession();
  }, []);

  return { user, isLoading };
}
