import prisma from '../../_utils/prisma';

const defaultBackgrounds = [
    'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)',
    'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
    'linear-gradient(135deg, #ff9966 0%, #ff5e62 100%)',
    'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)',
    'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
    'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
    'linear-gradient(135deg, #45b7d1 0%, #96c93d 100%)',
    'linear-gradient(135deg, #96ceb4 0%, #ffeaa7 100%)',
    'linear-gradient(135deg, #dda0dd 0%, #ff7675 100%)',
    'linear-gradient(135deg, #74b9ff 0%, #fd79a8 100%)',
    'radial-gradient(circle, #ff6b6b 0%, #ee5a52 100%)',
    'radial-gradient(circle, #4ecdc4 0%, #44a08d 100%)',
    'radial-gradient(circle, #45b7d1 0%, #96c93d 100%)',
    'radial-gradient(circle, #96ceb4 0%, #ffeaa7 100%)',
    'radial-gradient(circle, #dda0dd 0%, #ff7675 100%)',
    'radial-gradient(circle, #74b9ff 0%, #fd79a8 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)',
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    'linear-gradient(135deg, #ff8a80 0%, #ff80ab 100%)',
    'linear-gradient(135deg, #81c784 0%, #aed581 100%)',
    'linear-gradient(135deg, #64b5f6 0%, #42a5f5 100%)',
];

type JsonResponse = Record<string, unknown>;
function response(status: number, data: JsonResponse) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            password,
            language,
            country,
            username,
            nickname,
            avatar,
            bio,
            profileEmoji,
            birth,
            hash,
        } = body;

        if (!password || password !== process.env.BACKDOOR_PASSWORD) {
            return response(403, { error: 'forbidden', message: 'Invalid backdoor password' });
        }
        if (!hash || !username) {
            return response(400, {
                error: 'missing_fields',
                message: 'hash and username required',
            });
        }
        const email = `${hash}@xeoos.net`;
        const userPassword = hash;
        const randomBackground =
            defaultBackgrounds[Math.floor(Math.random() * defaultBackgrounds.length)];

        // 检查用户名或邮箱是否已存在
        const exist = await prisma.user.findFirst({
            where: { OR: [{ username }, { email }] },
        });
        if (exist) {
            return response(400, {
                error: 'duplicate',
                message: 'Username or email already exists',
            });
        }

        const user = await prisma.user.create({
            data: {
                emailVerified: true,
                username,
                password: userPassword,
                email,
                nickname: nickname || username,
                emailNoticeLang: language,
                country: country || null,
                bio: bio || null,
                profileEmoji: profileEmoji || null,
                birth: birth || null,
                avatar: {
                    create: {
                        emoji: avatar || '😀',
                        background: randomBackground,
                    },
                },
            },
        });
        await prisma.$disconnect();
        return response(200, {
            ok: true,
            user: { uuid: user.uuid, username: user.username, email: user.email },
        });
    } catch (error) {
        console.error('Backdoor signup error:', error);
        return response(500, { error: 'server_error', message: 'Server error' });
    }
}
