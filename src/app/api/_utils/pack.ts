interface UserInfo {
    uid: number;
    uuid: string;
    username: string;
    nickname: string;
    email: string;
    emailVerified: boolean;
    emailVerifyCode?: string | null;
    bio?: string | null;
    birth?: string | null;
    country?: string | null;
    role: string;
    updatedAt: Date;
    createdAt: Date;
    lastUseAt?: Date | null;
    gender?: Gender | null;
    timearea?: string | null;
    emailNoticeLang: string;
    exp: number;
    profileEmoji: string;
    avatar?: { id: string; emoji: string; background: string }[] | null;
}

type Gender = 'MALE' | 'FEMALE' | 'UNSET';

interface PackedUserInfo {
    uid: number;
    uuid: string;
    avatar?: object | null;
    username: string;
    nickname: string;
    email: string;
    emailVerified: boolean;
    bio?: string | null;
    birth?: string | null;
    country?: string | null;
    timearea?: string | null;
    role: string;
    emailNoticeLang: string;
    updatedAt: Date;
    createdAt: Date;
    lastUseAt: Date;
    profileEmoji: string;
    gender?: Gender | null;
    userExp: number;
}

function pack(userinfo: UserInfo, timestamp: number): PackedUserInfo {
    return {
        uid: userinfo.uid,
        uuid: userinfo.uuid,
        avatar: userinfo.avatar?.[0] || null,
        username: userinfo.username,
        nickname: userinfo.nickname,
        email: userinfo.email,
        emailVerified: userinfo.emailVerified,
        bio: userinfo.bio,
        birth: userinfo.birth,
        country: userinfo.country,
        emailNoticeLang: userinfo.emailNoticeLang,
        timearea: userinfo.timearea,
        role: userinfo.role,
        updatedAt: userinfo.updatedAt,
        createdAt: userinfo.createdAt,
        profileEmoji: userinfo.profileEmoji,
        lastUseAt: new Date(timestamp),
        gender: userinfo.gender,
        userExp: userinfo.exp, // 改名避免与JWT的exp冲突
    };
}

export default pack;
export type { UserInfo, PackedUserInfo, Gender };
