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
    lastUseAt?: string | null;
    gender?: Gender | null;
    timearea?: string | null;
    exp: number;
}

type Gender = "MALE" | "FEMALE" | "UNSET";

interface PackedUserInfo {
    uid: number;
    uuid: string;
    username: string;
    nickname: string;
    email: string;
    emailVerified: boolean;
    bio?: string | null;
    birth?: string | null;
    country?: string | null;
    timearea?: string | null;
    role: string;
    updatedAt: Date;
    createdAt: Date;
    lastUseAt: string;
    gender?: Gender | null;
    userExp: number; // 改名避免与JWT的exp冲突
}

function pack(userinfo: UserInfo, timestamp: number): PackedUserInfo {
    return {
        uid: userinfo.uid,
        uuid: userinfo.uuid,
        username: userinfo.username,
        nickname: userinfo.nickname,
        email: userinfo.email,
        emailVerified: userinfo.emailVerified,
        bio: userinfo.bio,
        birth: userinfo.birth,
        country: userinfo.country,
        timearea: userinfo.timearea,
        role: userinfo.role,
        updatedAt: userinfo.updatedAt,
        createdAt: userinfo.createdAt,
        lastUseAt: timestamp.toString(),
        gender: userinfo.gender,
        userExp: userinfo.exp, // 改名避免与JWT的exp冲突
    };
}

export default pack;
export type { UserInfo, PackedUserInfo, Gender };