"use client";

import Cookies from "js-cookie";
import { Base64 } from "js-base64";
import { useBroadcast } from "@/store/useBroadcast";

// Base64模块
const base = {
  encryption: (str: string): string => {
    return Base64.encode(str);
  },
  decrypt: (str: string): string => {
    return Base64.decode(str);
  },
};

let refreshInterval: NodeJS.Timeout | null = null;
let lastRefreshTime = 0;

const token = {
  read: <T>(property: string): T | undefined => {
    const userToken = Cookies.get("usertoken");
    if (!userToken) {
      return undefined;
    } else {
      const decodedToken = base
        .decrypt(userToken.split(".")[1])
        .replace("\x00", "");
      return JSON.parse(decodedToken)[property] as T;
    }
  },
  get: (): string | undefined => {
    return Cookies.get("usertoken") || undefined;
  },
  getObject: ():
    | {
        nickname: string;
        email: string;
        username: string;
        userExp: number;
        uid: number;
        avatar: {
            emoji: string;
            background: string;
        }
      }
    | undefined => {
    const userToken = Cookies.get("usertoken");
    if (!userToken) {
      return undefined;
    } else {
      const decodedToken = base
        .decrypt(userToken.split(".")[1])
        .replace("\x00", "");
      return JSON.parse(decodedToken) as {
        nickname: string;
        email: string;
        username: string;
        userExp: number;
        uid: number;
        avatar: {
          emoji: string;
          background: string;
        };
      };
    }
  },
  refresh: (): Promise<string> => {
    return new Promise((resolve, reject) => {
      fetch("/api/user/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: token.get(),
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.ok && data.jwt) {
            // 从新 JWT 中解析过期时间
            const newTokenParts = data.jwt.split(".");
            const payload = JSON.parse(base.decrypt(newTokenParts[1]));
            const expirationTime = payload.exp * 1000; // 转换为毫秒
            const expirationDate = new Date(expirationTime);

            Cookies.set("usertoken", data.jwt, {
              expires: expirationDate,
              secure: window.location.protocol === "https:",
              sameSite: "strict",
            });
            resolve(data.jwt);
          } else {
            const broadcast = useBroadcast.getState().broadcast;
            broadcast({
              action: "tokenError",
            });
            reject(new Error(data.message || "Token refresh failed"));
          }
        })
        .catch((e) => {
          reject(e);
        });
    });
  },
  clear: (): void => {
    Cookies.remove("usertoken");
  },
  write: (string: string, time: number): void => {
    const expirationDate = new Date(Date.now() + time * 1000);
    Cookies.set("usertoken", string, {
      expires: expirationDate,
      secure: true,
      sameSite: "strict",
    });
  },
  startRefresh: (): void => {
    // 如果已经有定时器在运行，先清除它
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }

    // 初始化上次刷新时间为当前时间
    lastRefreshTime = Date.now();

    // 立即检查并刷新一次（如果需要）
    const checkAndRefresh = () => {
      const currentTime = Date.now();
      const timeSinceLastRefresh = currentTime - lastRefreshTime;

      // 如果距离上次刷新超过5分钟（300000毫秒），则进行刷新
      if (timeSinceLastRefresh >= 300000) {
        const currentToken = token.get();
        if (currentToken) {
          token
            .refresh()
            .then(() => {
              lastRefreshTime = Date.now();
              console.log("Token refreshed successfully");
            })
            .catch((error) => {
              console.error("Token refresh failed:", error);
            });
        }
      } else {
        console.log("Skipping token refresh - refreshed recently");
      }
    };

    // 设置每5分钟执行一次的定时器
    refreshInterval = setInterval(checkAndRefresh, 300000); // 300000ms = 5分钟

    // 立即执行一次检查
    checkAndRefresh();
  },

  stopRefresh: (): void => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
    }
  },
};

export default token;
