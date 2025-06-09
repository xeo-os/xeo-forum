import limitControl from "../../_utils/limit";
import response from "../../_utils/response";
import prisma from "../../_utils/prisma";
import langs from "@/lib/lang";

export async function POST(request: Request) {
  const body = await request.json();
  const { email, code, lang } = body;

  if (!email || !code) {
    return response(400, {
      message: langs({
        "zh-CN": "邮箱和验证码不能为空",
        "en-US": "Email and verification code cannot be empty",
        "zh-TW": "電子郵件和驗證碼不能為空",
        "ja-JP": "メールアドレスと認証コードは空にできません",
        "ko-KR": "이메일과 인증 코드는 비워둘 수 없습니다",
        "es-ES":
          "El correo electrónico y el código de verificación no pueden estar vacíos",
        "fr-FR": "L'email et le code de vérification ne peuvent pas être vides",
        "ru-RU": "Электронная почта и код подтверждения не могут быть пустыми",
        "de-DE": "E-Mail und Bestätigungscode dürfen nicht leer sein",
        "pt-BR": "O e-mail e o código de verificação não podem estar vazios",
      }, lang),
    });
  }

  if (typeof email !== "string" || typeof code !== "string") {
    return response(400, {
      message: langs({
        "zh-CN": "邮箱和验证码格式错误",
        "zh-TW": "電子郵件和驗證碼格式錯誤",
        "en-US": "Invalid format for email or verification code",
        "es-ES": "Formato inválido para correo electrónico o código de verificación",
        "fr-FR": "Format invalide pour l'email ou le code de vérification",
        "ru-RU": "Неверный формат электронной почты или кода подтверждения",
        "ja-JP": "メールアドレスまたは認証コードの形式が無効です",
        "de-DE": "Ungültiges Format für E-Mail oder Bestätigungscode",
        "pt-BR": "Formato inválido para e-mail ou código de verificação",
        "ko-KR": "이메일 또는 인증 코드 형식이 잘못되었습니다",
      }, lang),
    });
  }

  // 检查邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return response(400, {
      message: langs({
        "zh-CN": "邮箱格式不正确",
        "zh-TW": "電子郵件格式不正確",
        "en-US": "Invalid email format",
        "es-ES": "Formato de correo electrónico inválido",
        "fr-FR": "Format d'email invalide",
        "ru-RU": "Неверный формат электронной почты",
        "ja-JP": "メールアドレスの形式が正しくありません",
        "de-DE": "Ungültiges E-Mail-Format",
        "pt-BR": "Formato de e-mail inválido",
        "ko-KR": "잘못된 이메일 형식입니다",
      }, lang),
    });
  }

  try {
    const isAllowed = await limitControl.check(request);

    if (!isAllowed) {
      return response(429, {
        message: langs({
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
        }, lang),
      });
    }

    const result = await main();

    await limitControl.update(request);

    return result;
  } catch (error) {
    console.error("Rate limit check error:", error);
    return response(500, {
      message: langs({
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
      }, lang),
    });
  }

  async function main() {
    const result = await prisma.user.findUnique({
      where: {
        email,
      },
      // 只返回emailVerifyCode字段
      select: {
        emailVerifyCode: true,
      },
    });

    if (!result) {
      return response(404, {
        message: langs({
          "zh-CN": "用户不存在",
          "zh-TW": "使用者不存在",
          "en-US": "User does not exist",
          "es-ES": "El usuario no existe",
          "fr-FR": "L'utilisateur n'existe pas",
          "ru-RU": "Пользователь не существует",
          "ja-JP": "ユーザーが存在しません",
          "de-DE": "Benutzer existiert nicht",
          "pt-BR": "Usuário não existe",
          "ko-KR": "사용자가 존재하지 않습니다",
        }, lang),
      });
    }

    if (result.emailVerifyCode !== code) {
      return response(400, {
        message: langs({
          "zh-CN": "验证码错误",
          "zh-TW": "驗證碼錯誤",
          "en-US": "Invalid verification code",
          "es-ES": "Código de verificación incorrecto",
          "fr-FR": "Code de vérification incorrect",
          "ru-RU": "Неверный код подтверждения",
          "ja-JP": "認証コードが正しくありません",
          "de-DE": "Ungültiger Bestätigungscode",
          "pt-BR": "Código de verificação inválido",
          "ko-KR": "잘못된 인증 코드입니다",
        }, lang),
      });
    }

    // 验证成功，更新用户的emailVerified为true
    return prisma.user
      .update({
        where: {
          email,
        },
        data: {
          emailVerified: true,
          emailVerifyCode: null, // 清除验证码
        },
      })
      .then(() => {
        return response(200, {
          message: langs({
            "zh-CN": "邮箱验证成功",
            "zh-TW": "電子郵件驗證成功",
            "en-US": "Email verification successful",
            "es-ES": "Verificación de correo exitosa",
            "fr-FR": "Vérification de l'email réussie",
            "ru-RU": "Подтверждение электронной почты успешно",
            "ja-JP": "メール認証が成功しました",
            "de-DE": "E-Mail-Verifizierung erfolgreich",
            "pt-BR": "Verificação de e-mail bem-sucedida",
            "ko-KR": "이메일 인증이 성공했습니다",
          }, lang),
        });
      })
      .catch((error) => {
        console.error("Database error:", error);
        return response(500, {
          message: langs({
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
          }, lang),
        });
      });
  }
}
