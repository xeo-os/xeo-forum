import token from "./token";

function auth(request: Request): object | undefined {
  if (!request.headers.get("authorization")) {
    return;
  }
  const authorizationHeader = request.headers.get("authorization");
  const tokenString = authorizationHeader
    ? authorizationHeader.split(" ")[1]
    : undefined;
  let tokenInfo;
  try {
    tokenInfo = tokenString ? token.verify(tokenString) : undefined;
    return typeof tokenInfo === "object" ? tokenInfo : undefined;
  } catch (err) {
    console.error("Token verification failed:", err);
    return;
  }
}

export default auth;
