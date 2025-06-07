import jwt, { SignOptions, VerifyOptions } from 'jsonwebtoken';
import { createPrivateKey, createPublicKey, KeyObject } from 'crypto';

interface TokenSignOptions {
    inner: Record<string, unknown>;
    expired?: number | string;
}

interface Token {
    sign: (options: TokenSignOptions) => string;
    verify: (tokenText: string) => object | string;
}

// 安全加载私钥
const privateKey: KeyObject = createPrivateKey({
    key: process.env.JWT_KEY!,
    format: 'pem',
});

const publicKey: KeyObject = createPublicKey({
    key: process.env.JWT_PUB_KEY!,
    format: 'pem',
});

const token: Token = {
    sign: ({ inner, expired = '7d' }: TokenSignOptions): string => {
        const signOptions: SignOptions = {
            algorithm: 'RS512',
            expiresIn: expired as SignOptions['expiresIn'],
        };
        return jwt.sign(inner, privateKey, signOptions);
    },

    verify: (tokenText: string): object | string => {
        const verifyOptions: VerifyOptions = {
            algorithms: ['RS512'],
        };
        return jwt.verify(tokenText, publicKey, verifyOptions);
    },
};

export default token;
