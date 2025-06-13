import * as Ably from 'ably';
import response from '../../_utils/response';
import token from '../../_utils/token';
import { type PackedUserInfo } from '../../_utils/pack';

export async function POST(request: Request) {
    console.log('Ably auth API called at:', new Date().toISOString());

    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('Missing or invalid authorization header');
            return response(401, { message: 'Authorization header required' });
        }

        const jwtToken = authHeader.substring(7);
        console.log('JWT token received, length:', jwtToken.length);

        // 验证 JWT token
        let userInfo: PackedUserInfo | null = null;
        try {
            const verifiedToken = token.verify(jwtToken);
            if (
                typeof verifiedToken === 'object' &&
                verifiedToken !== null &&
                'uid' in verifiedToken
            ) {
                userInfo = verifiedToken as PackedUserInfo;
                console.log('JWT token verified for user:', userInfo.uid);
            }
        } catch (error) {
            console.log('JWT token verification failed:', error);
            return response(401, { message: 'Invalid or expired token' });
        }

        if (!userInfo || !userInfo.uid) {
            console.log('Invalid user information in token');
            return response(401, { message: 'Invalid user information' });
        }

        console.log('Generating Ably token for user:', userInfo.uid);
        // 生成新的 Ably token
        const tokenDetails = await generateAblyToken(userInfo.uid.toString());

        if (!tokenDetails) {
            console.log('Failed to generate Ably token');
            return response(500, { message: 'Failed to generate Ably token' });
        }

        console.log(
            'Ably token generated successfully, expires at:',
            new Date(tokenDetails.expires * 1000).toISOString(),
        );

        // 返回 Ably TokenDetails 格式
        return new Response(JSON.stringify(tokenDetails), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Error in message auth:', error);
        return response(500, { message: 'Internal server error' });
    }
}

async function generateAblyToken(clientId: string) {
    try {
        console.log('Requesting Ably token for client:', clientId);
        const ably = new Ably.Rest({ key: process.env.ABLY_API_KEY || '' });
        const channel = 'user-' + clientId;

        // 设置正确的TTL (毫秒)
        const ttlMs = 2 * 60 * 60 * 1000; // 2小时的毫秒数

        const tokenDetails = await ably.auth.requestToken({
            clientId: clientId,
            ttl: ttlMs, // 使用毫秒
            capability: {
                broadcast: ['subscribe'],
                [channel]: ['subscribe'],
            },
        });

        console.log('Ably token request successful');
        console.log('Token details:', {
            expires: tokenDetails.expires,
            expiresDate: new Date(tokenDetails.expires).toISOString(),
            issued: tokenDetails.issued,
            issuedDate: new Date(tokenDetails.issued).toISOString(),
        });

        return tokenDetails;
    } catch (error) {
        console.error('Error generating Ably token:', error);
        return null;
    }
}
