// api/user/create
import limitControl from "../../_utils/limit";
import prisma from "../../_utils/prisma";
import response from "../../_utils/response";
import { Resend } from "resend";
import shuffler from "../../_utils/shuffler";
import argon2 from "argon2";
import generateVerificationEmail from "../../_utils/email-verify";
import langs from "@/lib/lang";

const resend = new Resend(process.env.RESEND_API_KEY as string);

async function encrypt(password: string): Promise<string> {
  const options = {
    timeCost: 3,
    memoryCost: 65536,
    parallelism: 8,
    hashLength: 32,
  };
  const hashedPassword = await argon2.hash(shuffler(password), options);
  return hashedPassword;
}

function generateCode(): string {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  return code;
}

export async function POST(request: Request) {
  const body = await request.json();
  const { username, password, email, turnstileToken, lang } = body;

  if (!username || !password || !email) {
    return response(400, {
      error: "missing_fields",
      message: langs(
        {
          "zh-CN": "用户名、密码和邮箱不能为空",
          "zh-TW": "使用者名稱、密碼和電子郵件不能為空",
          "en-US": "Username, password, and email cannot be empty",
          "es-ES":
            "El nombre de usuario, la contraseña y el correo electrónico no pueden estar vacíos",
          "fr-FR":
            "Le nom d'utilisateur, le mot de passe et l'email ne peuvent pas être vides",
          "ru-RU":
            "Имя пользователя, пароль и электронная почта не могут быть пустыми",
          "ja-JP": "ユーザー名、パスワード、メールアドレスは空にできません",
          "de-DE": "Benutzername, Passwort und E-Mail dürfen nicht leer sein",
          "pt-BR": "Nome de usuário, senha e e-mail não podem estar vazios",
          "ko-KR": "사용자 이름, 비밀번호 및 이메일은 비워둘 수 없습니다",
        },
        lang
      ),
    });
  }

  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    typeof email !== "string"
  ) {
    return response(400, {
      error: "invalid_format",
      message: langs(
        {
          "zh-CN": "用户名、密码和邮箱格式错误",
          "zh-TW": "使用者名稱、密碼和電子郵件格式錯誤",
          "en-US": "Invalid format for username, password, or email",
          "es-ES":
            "Formato inválido para nombre de usuario, contraseña o correo",
          "fr-FR":
            "Format invalide pour nom d'utilisateur, mot de passe ou email",
          "ru-RU":
            "Неверный формат имени пользователя, пароля или электронной почты",
          "ja-JP":
            "ユーザー名、パスワード、またはメールアドレスの形式が無効です",
          "de-DE": "Ungültiges Format für Benutzername, Passwort oder E-Mail",
          "pt-BR": "Formato inválido para nome de usuário, senha ou e-mail",
          "ko-KR": "사용자 이름, 비밀번호 또는 이메일 형식이 잘못되었습니다",
        },
        lang
      ),
    });
  }

  // 检查用户名长度
  if (username.length < 3 || username.length > 20) {
    return response(400, {
      error: "username_length",
      message: langs(
        {
          "zh-CN": "用户名长度必须在3到20个字符之间",
          "zh-TW": "使用者名稱長度必須在3到20個字符之間",
          "en-US": "Username must be between 3 and 20 characters",
          "es-ES": "El nombre de usuario debe tener entre 3 y 20 caracteres",
          "fr-FR":
            "Le nom d'utilisateur doit contenir entre 3 et 20 caractères",
          "ru-RU": "Имя пользователя должно содержать от 3 до 20 символов",
          "ja-JP": "ユーザー名は3文字以上20文字以下である必要があります",
          "de-DE": "Benutzername muss zwischen 3 und 20 Zeichen lang sein",
          "pt-BR": "Nome de usuário deve ter entre 3 e 20 caracteres",
          "ko-KR": "사용자 이름은 3자에서 20자 사이여야 합니다",
        },
        lang
      ),
    });
  }

  // 检查密码长度
  if (password.length < 6 || password.length > 50) {
    return response(400, {
      error: "password_length",
      message: langs(
        {
          "zh-CN": "密码长度必须在6到50个字符之间",
          "zh-TW": "密碼長度必須在6到50個字符之間",
          "en-US": "Password must be between 6 and 50 characters",
          "es-ES": "La contraseña debe tener entre 6 y 50 caracteres",
          "fr-FR": "Le mot de passe doit contenir entre 6 et 50 caractères",
          "ru-RU": "Пароль должен содержать от 6 до 50 символов",
          "ja-JP": "パスワードは6文字以上50文字以下である必要があります",
          "de-DE": "Passwort muss zwischen 6 und 50 Zeichen lang sein",
          "pt-BR": "Senha deve ter entre 6 e 50 caracteres",
          "ko-KR": "비밀번호는 6자에서 50자 사이여야 합니다",
        },
        lang
      ),
    });
  }

  // 检查邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return response(400, {
      error: "invalid_email_format",
      message: langs(
        {
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
        },
        lang
      ),
    });
  }

  // 检查CF Turnstile验证
  if (!turnstileToken) {
    return response(400, {
      error: "turnstile_required",
      message: langs(
        {
          "zh-CN": "请完成验证",
          "zh-TW": "請完成驗證",
          "en-US": "Please complete verification",
          "es-ES": "Por favor complete la verificación",
          "fr-FR": "Veuillez compléter la vérification",
          "ru-RU": "Пожалуйста, завершите проверку",
          "ja-JP": "認証を完了してください",
          "de-DE": "Bitte schließen Sie die Verifizierung ab",
          "pt-BR": "Por favor, complete a verificação",
          "ko-KR": "인증을 완료해 주세요",
        },
        lang
      ),
    });
  }

  try {
    const turnstileResponse = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          secret: process.env.TURNSTILE_SECRET_KEY as string,
          response: turnstileToken,
        }),
      }
    );

    const turnstileResult = await turnstileResponse.json();

    if (!turnstileResult.success) {
      return response(400, {
        error: "turnstile_failed",
        message: langs(
          {
            "zh-CN": "验证失败，请重试",
            "zh-TW": "驗證失敗，請重試",
            "en-US": "Verification failed, please try again",
            "es-ES": "Verificación fallida, inténtalo de nuevo",
            "fr-FR": "Échec de la vérification, veuillez réessayer",
            "ru-RU": "Проверка не удалась, попробуйте еще раз",
            "ja-JP": "認証に失敗しました。再度お試しください",
            "de-DE": "Verifizierung fehlgeschlagen, bitte erneut versuchen",
            "pt-BR": "Verificação falhou, tente novamente",
            "ko-KR": "인증에 실패했습니다. 다시 시도해 주세요",
          },
          lang
        ),
      });
    }
  } catch (error) {
    console.error("Turnstile verification error:", error);
    return response(500, {
      error: "verification_service_error",
      message: langs(
        {
          "zh-CN": "验证服务异常",
          "zh-TW": "驗證服務異常",
          "en-US": "Verification service error",
          "es-ES": "Error del servicio de verificación",
          "fr-FR": "Erreur du service de vérification",
          "ru-RU": "Ошибка службы проверки",
          "ja-JP": "認証サービスエラー",
          "de-DE": "Verifizierungsdienst-Fehler",
          "pt-BR": "Erro do serviço de verificação",
          "ko-KR": "인증 서비스 오류",
        },
        lang
      ),
    });
  }

  // 速率限制
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
          lang
        ),
      });
    }

    const result = await main();

    await limitControl.update(request);

    return result;
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
        lang
      ),
    });
  }

  async function main() {
    try {
      const code = generateCode();
      await prisma.user.create({
        data: {
          username,
          password: await encrypt(password),
          email,
          emailVerifyCode: code,
          nickname: username,
        },
      });

      const htmlEmail = generateVerificationEmail(lang || "en-US", code);
      const resendConfig = {
        ...htmlEmail,
        from: process.env.VERIFY_EMAIL_FROM as string,
        to: email,
      };

      await resend.emails.send(resendConfig);

      return response(200, {
        message: langs(
          {
            "zh-CN": "用户创建成功",
            "zh-TW": "使用者創建成功",
            "en-US": "User created successfully",
            "es-ES": "Usuario creado exitosamente",
            "fr-FR": "Utilisateur créé avec succès",
            "ru-RU": "Пользователь успешно создан",
            "ja-JP": "ユーザーが正常に作成されました",
            "de-DE": "Benutzer erfolgreich erstellt",
            "pt-BR": "Usuário criado com sucesso",
            "ko-KR": "사용자가 성공적으로 생성되었습니다",
          },
          lang
        ),
        ok: true,
      });
    } catch (error) {
      console.error("数据库操作错误:", error);

      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "P2002" &&
        "meta" in error &&
        typeof error.meta === "object" &&
        error.meta !== null &&
        "target" in error.meta &&
        Array.isArray(error.meta.target)
      ) {
        const duplicateField = error.meta.target.includes("username")
          ? langs(
              {
                "zh-CN": "用户名",
                "zh-TW": "使用者名稱",
                "en-US": "username",
                "es-ES": "nombre de usuario",
                "fr-FR": "nom d'utilisateur",
                "ru-RU": "имя пользователя",
                "ja-JP": "ユーザー名",
                "de-DE": "Benutzername",
                "pt-BR": "nome de usuário",
                "ko-KR": "사용자 이름",
              },
              lang
            )
          : error.meta.target.includes("email")
            ? langs(
                {
                  "zh-CN": "邮箱",
                  "zh-TW": "電子郵件",
                  "en-US": "email",
                  "es-ES": "correo electrónico",
                  "fr-FR": "email",
                  "ru-RU": "электронная почта",
                  "ja-JP": "メールアドレス",
                  "de-DE": "E-Mail",
                  "pt-BR": "e-mail",
                  "ko-KR": "이메일",
                },
                lang
              )
            : langs(
                {
                  "zh-CN": "字段",
                  "zh-TW": "欄位",
                  "en-US": "field",
                  "es-ES": "campo",
                  "fr-FR": "champ",
                  "ru-RU": "поле",
                  "ja-JP": "フィールド",
                  "de-DE": "Feld",
                  "pt-BR": "campo",
                  "ko-KR": "필드",
                },
                lang
              );

        return response(400, {
          message: langs(
            {
              "zh-CN": `该${duplicateField}已被使用，请更换后重试`,
              "zh-TW": `該${duplicateField}已被使用，請更換後重試`,
              "en-US": `This ${duplicateField} is already in use, please try another`,
              "es-ES": `Este ${duplicateField} ya está en uso, prueba con otro`,
              "fr-FR": `Ce ${duplicateField} est déjà utilisé, veuillez en essayer un autre`,
              "ru-RU": `Это ${duplicateField} уже используется, попробуйте другое`,
              "ja-JP": `この${duplicateField}は既に使用されています。別のものをお試しください`,
              "de-DE": `Dieses ${duplicateField} wird bereits verwendet, bitte versuchen Sie ein anderes`,
              "pt-BR": `Este ${duplicateField} já está em uso, tente outro`,
              "ko-KR": `이 ${duplicateField}는 이미 사용 중입니다. 다른 것을 시도해 주세요`,
            },
            lang
          ),
        });
      }

      return response(500, {
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
          lang
        ),
      });
    }
  }
}
