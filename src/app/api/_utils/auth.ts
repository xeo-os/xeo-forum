import token from "./token";

interface UserAuthData {
  uid: number;
  uuid: string;
  avatar: {
    id: string;
    userUid: number;
    emoji: string;
    background: string;
  };
  username: string;
  nickname: string;
  email: string;
  emailVerified: boolean;
  bio: string | null;
  birth: string | null;
  country: string | null;
  timearea: string | null;
  role: string;
  updatedAt: string;
  createdAt: string;
  lastUseAt: string;
  gender: string;
  userExp: number;
  iat: number;
  exp: number;
}

function auth(request: Request): UserAuthData | undefined {
  const authorizationHeader = request.headers.get("authorization");
  if (!authorizationHeader) {
    return undefined;
  }

  const tokenString = authorizationHeader.split(" ")[1];
  if (!tokenString) {
    return undefined;
  }

  try {
    const tokenInfo = token.verify(tokenString);
    return typeof tokenInfo === "object" ? tokenInfo as UserAuthData : undefined;
  } catch (err) {
    console.error("Token verification failed:", err);
    return undefined;
  }
}

export default auth;
