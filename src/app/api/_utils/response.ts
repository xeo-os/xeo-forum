import { NextResponse } from 'next/server';

export default function response(code: number, message: object): Response {
    return NextResponse.json(message, {
        status: code,
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',
        },
    });
}
