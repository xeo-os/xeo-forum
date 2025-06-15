import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../_utils/prisma';
import response from '../../_utils/response';
import limitControl from '../../_utils/limit';
import auth from '../../_utils/auth';
import langs from '@/lib/lang';

export async function POST(request: NextRequest) {
    try {
        // 检查速率限制
        const isAllowed = await limitControl.check(request);
        if (!isAllowed) {
            return response(429, {
                error: 'rate_limit_exceeded',
                message: langs(
                    {
                        'zh-CN': '请求过于频繁，请稍后再试',
                        'zh-TW': '請求過於頻繁，請稍後再試',
                        'en-US': 'Too many requests, please try again later',
                        'es-ES': 'Demasiadas solicitudes, inténtalo más tarde',
                        'fr-FR': 'Trop de demandes, veuillez réessayer plus tard',
                        'ru-RU': 'Слишком много запросов, попробуйте позже',
                        'ja-JP': 'リクエストが多すぎます。後でもう一度お試しください',
                        'de-DE': 'Zu viele Anfragen, bitte später versuchen',
                        'pt-BR': 'Muitas solicitações, tente novamente mais tarde',
                        'ko-KR': '요청이 너무 많습니다. 나중에 다시 시도해 주세요',
                    },
                    'en-US',
                ),
            });
        }

        const authHeader = request.headers.get('authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { ok: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const token = authHeader.split(' ')[1];

        // 验证用户身份
        const user = await auth(request);
        if (!user) {
            return response(401, {
                message: langs(
                    {
                        'zh-CN': '未授权访问',
                        'zh-TW': '未授權訪問',
                        'en-US': 'Unauthorized access',
                        'es-ES': 'Acceso no autorizado',
                        'fr-FR': 'Accès non autorisé',
                        'ru-RU': 'Неавторизованный доступ',
                        'ja-JP': '認証されていないアクセスです',
                        'de-DE': 'Unbefugter Zugriff',
                        'pt-BR': 'Acesso não autorizado',
                        'ko-KR': '인증되지 않은 접근입니다',
                    },
                    'en-US',
                ),
            });
        }

        const body = await request.json();
        const { 
            nickname,
            bio,
            birth,
            country,
            timearea,
            gender,
            profileEmoji,
            avatar,
            lang = 'en-US'
        } = body;

        // 验证必要字段
        if (!nickname || typeof nickname !== 'string') {
            return response(400, {
                message: langs(
                    {
                        'zh-CN': '昵称不能为空',
                        'zh-TW': '暱稱不能為空',
                        'en-US': 'Nickname cannot be empty',
                        'es-ES': 'El apodo no puede estar vacío',
                        'fr-FR': 'Le pseudo ne peut pas être vide',
                        'ru-RU': 'Никнейм не может быть пустым',
                        'ja-JP': 'ニックネームは空にできません',
                        'de-DE': 'Spitzname darf nicht leer sein',
                        'pt-BR': 'O apelido não pode estar vazio',
                        'ko-KR': '닉네임은 비워둘 수 없습니다',
                    },
                    lang,
                ),
            });
        }

        // 验证昵称长度
        if (nickname.length > 50) {
            return response(400, {
                message: langs(
                    {
                        'zh-CN': '昵称长度不能超过50个字符',
                        'zh-TW': '暱稱長度不能超過50個字符',
                        'en-US': 'Nickname cannot exceed 50 characters',
                        'es-ES': 'El apodo no puede exceder los 50 caracteres',
                        'fr-FR': 'Le pseudo ne peut pas dépasser 50 caractères',
                        'ru-RU': 'Никнейм не может превышать 50 символов',
                        'ja-JP': 'ニックネームは50文字を超えることはできません',
                        'de-DE': 'Spitzname darf 50 Zeichen nicht überschreiten',
                        'pt-BR': 'O apelido não pode exceder 50 caracteres',
                        'ko-KR': '닉네임은 50자를 초과할 수 없습니다',
                    },
                    lang,
                ),
            });
        }

        // 验证其他字段长度
        if (bio && bio.length > 255) {
            return response(400, {
                message: langs(
                    {
                        'zh-CN': '个人简介长度不能超过255个字符',
                        'zh-TW': '個人簡介長度不能超過255個字符',
                        'en-US': 'Bio cannot exceed 255 characters',
                        'es-ES': 'La biografía no puede exceder los 255 caracteres',
                        'fr-FR': 'La bio ne peut pas dépasser 255 caractères',
                        'ru-RU': 'Биография не может превышать 255 символов',
                        'ja-JP': '自己紹介は255文字を超えることはできません',
                        'de-DE': 'Bio darf 255 Zeichen nicht überschreiten',
                        'pt-BR': 'A bio não pode exceder 255 caracteres',
                        'ko-KR': '자기소개는 255자를 초과할 수 없습니다',
                    },
                    lang,
                ),
            });
        }

        if (country && country.length > 20) {
            return response(400, {
                message: langs(
                    {
                        'zh-CN': '国家/地区名称过长',
                        'zh-TW': '國家/地區名稱過長',
                        'en-US': 'Country name is too long',
                        'es-ES': 'El nombre del país es demasiado largo',
                        'fr-FR': 'Le nom du pays est trop long',
                        'ru-RU': 'Название страны слишком длинное',
                        'ja-JP': '国名が長すぎます',
                        'de-DE': 'Ländername ist zu lang',
                        'pt-BR': 'Nome do país é muito longo',
                        'ko-KR': '국가 이름이 너무 깁니다',
                    },
                    lang,
                ),
            });
        }

        if (profileEmoji && profileEmoji.length > 30) {
            return response(400, {
                message: langs(
                    {
                        'zh-CN': '个人表情符号过长',
                        'zh-TW': '個人表情符號過長',
                        'en-US': 'Profile emoji is too long',
                        'es-ES': 'El emoji del perfil es demasiado largo',
                        'fr-FR': 'L\'emoji du profil est trop long',
                        'ru-RU': 'Эмодзи профиля слишком длинное',
                        'ja-JP': 'プロフィール絵文字が長すぎます',
                        'de-DE': 'Profil-Emoji ist zu lang',
                        'pt-BR': 'Emoji do perfil é muito longo',
                        'ko-KR': '프로필 이모지가 너무 깁니다',
                    },
                    lang,
                ),
            });
        }

        // 验证性别枚举
        const validGenders = ['MALE', 'FEMALE', 'UNSET'];
        if (gender && !validGenders.includes(gender)) {
            return response(400, {
                message: langs(
                    {
                        'zh-CN': '无效的性别值',
                        'zh-TW': '無效的性別值',
                        'en-US': 'Invalid gender value',
                        'es-ES': 'Valor de género inválido',
                        'fr-FR': 'Valeur de genre invalide',
                        'ru-RU': 'Недопустимое значение пола',
                        'ja-JP': '無効な性別値',
                        'de-DE': 'Ungültiger Geschlechtswert',
                        'pt-BR': 'Valor de gênero inválido',
                        'ko-KR': '유효하지 않은 성별 값',
                    },
                    lang,
                ),
            });
        }

        await limitControl.update(request);

        // 准备更新数据
        const updateData: any = {
            nickname,
            bio: bio || null,
            birth: birth || null,
            country: country || null,
            timearea: timearea || null,
            gender: gender || 'UNSET',
            profileEmoji: profileEmoji || null,
            updatedAt: new Date(),
        };

        // 开始事务更新
        const result = await prisma.$transaction(async (tx) => {
            // 更新用户基本信息
            const updatedUser = await tx.user.update({
                where: { uid: user.uid },
                data: updateData,
                include: {
                    avatar: true,
                },
            });

            // 如果提供了头像信息，更新头像
            if (avatar && avatar.emoji && avatar.background) {
                // 删除现有头像
                await tx.avatar.deleteMany({
                    where: { userUid: user.uid },
                });

                // 创建新头像
                await tx.avatar.create({
                    data: {
                        userUid: user.uid,
                        emoji: avatar.emoji,
                        background: avatar.background,
                    },
                });
            }

            return updatedUser;
        });

        return response(200, {
            ok: true,
            message: langs(
                {
                    'zh-CN': '信息更新成功',
                    'zh-TW': '資訊更新成功',
                    'en-US': 'Information updated successfully',
                    'es-ES': 'Información actualizada exitosamente',
                    'fr-FR': 'Informations mises à jour avec succès',
                    'ru-RU': 'Информация успешно обновлена',
                    'ja-JP': '情報が正常に更新されました',
                    'de-DE': 'Informationen erfolgreich aktualisiert',
                    'pt-BR': 'Informações atualizadas com sucesso',
                    'ko-KR': '정보가 성공적으로 업데이트되었습니다',
                },
                lang,
            ),
            user: result,
        });

    } catch (error) {
        console.error('User update error:', error);
        return response(500, {
            message: langs(
                {
                    'zh-CN': '服务器内部错误',
                    'zh-TW': '伺服器內部錯誤',
                    'en-US': 'Internal server error',
                    'es-ES': 'Error interno del servidor',
                    'fr-FR': 'Erreur interne du serveur',
                    'ru-RU': 'Внутренняя ошибка сервера',
                    'ja-JP': 'サーバー内部エラー',
                    'de-DE': 'Interner Serverfehler',
                    'pt-BR': 'Erro interno do servidor',
                    'ko-KR': '내부 서버 오류',
                },
                'en-US',
            ),
        });
    }
}
