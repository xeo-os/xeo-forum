// check if username exist

import prisma from "../../_utils/prisma";
import response from "../../_utils/response";
import limitControl from "../../_utils/limit";
import langs from "@/lib/lang";

export async function GET(request: Request) {
  // Rate limiting
  try {
    const isAllowed = await limitControl.check(request);

    if (!isAllowed) {
      return response(429, {
        error: "rate_limit_exceeded",
        message: langs(
          {
            "zh-CN": "请求过于频繁，请稍后再试",
            "zh-TW": "請求過於頻繁，請稍後再試",
            "en-US": "Too many requests, please try again later",
            "es-ES": "Demasiadas solicitudes, inténtalo más tarde",
            "fr-FR": "Trop de demandes, veuillez réessayer plus tard",
            "ru-RU": "Слишком много запросов, попробуйте позже",
            "ja-JP": "リクエストが多すぎます。後でもう一度お試しください",
            "de-DE": "Zu viele Anfragen, bitte später versuchen",
            "pt-BR": "Muitas solicitações, tente novamente mais tarde",
            "ko-KR": "요청이 너무 많습니다. 나중에 다시 시도해 주세요",
          },
          "en-US" // Default language
        ),
      });
    }

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

    await limitControl.update(request);

    return response(200, {
      ok: !result,
    });
  } catch (error) {
    console.error("Rate limit check error:", error);
    return response(500, {
      error: "server_error",
      message: langs(
        {
          "zh-CN": "服务器错误，请稍后再试",
          "zh-TW": "伺服器錯誤，請稍後再試",
          "en-US": "Server error, please try again later",
          "es-ES": "Error del servidor, inténtalo más tarde",
          "fr-FR": "Erreur du serveur, veuillez réessayer plus tard",
          "ru-RU": "Ошибка сервера, попробуйте позже",
          "ja-JP": "サーバーエラー。後でもう一度お試しください",
          "de-DE": "Server-Fehler, bitte später versuchen",
          "pt-BR": "Erro do servidor, tente novamente mais tarde",
          "ko-KR": "서버 오류입니다. 나중에 다시 시도해 주세요",
        },
        "en-US" // Default language
      ),
    });
  }
}
