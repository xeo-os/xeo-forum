// check if username exist

import prisma from "../../_utils/prisma";
import response from "../../_utils/response";

export async function GET(request: Request) {
  const { username } = Object.fromEntries(
    request.url
      .split("?")[1]
      .split("&")
      .map((param) => param.split("="))
  );

  const result = await prisma.user.findUnique({
    where: {
      username: username,
    },
  });
  prisma.$disconnect();

  return response(200, {
    ok: !result,
  });
}
