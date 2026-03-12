type TriggerTranslateWorkerResult = {
    ok: boolean;
    status: number;
    body: string;
};

function looksLikeCloudflareChallenge(status: number, body: string): boolean {
    if (status !== 403) return false;
    const normalizedBody = body.toLowerCase();
    return (
        normalizedBody.includes('<title>just a moment') ||
        normalizedBody.includes('cf-browser-verification') ||
        normalizedBody.includes('cf-chl') ||
        normalizedBody.includes('cloudflare')
    );
}

function formatError(error: unknown): string {
    if (error instanceof Error) return `${error.name}: ${error.message}`;
    return String(error);
}

export async function triggerTranslateWorkerTask(
    taskId: string,
    source:
        | 'post.create'
        | 'post.update.publish'
        | 'reply.create'
        | 'task.retry'
        | `custom:${string}`,
): Promise<TriggerTranslateWorkerResult> {
    const workerUrl = process.env.TRANSLATE_WORKER;
    const workerFallbackUrl = process.env.TRANSLATE_WORKER_FALLBACK;
    const workerPassword = process.env.TRANSLATE_WORKER_PASSWORD;

    if (!workerUrl || !workerPassword) {
        console.error('[translate-trigger] Missing environment variables', {
            source,
            taskId,
            hasTranslateWorkerUrl: Boolean(workerUrl),
            hasTranslateWorkerFallbackUrl: Boolean(workerFallbackUrl),
            hasTranslateWorkerPassword: Boolean(workerPassword),
        });
        return {
            ok: false,
            status: 0,
            body: 'Missing TRANSLATE_WORKER or TRANSLATE_WORKER_PASSWORD',
        };
    }

    const startedAt = Date.now();
    const payload = {
        password: workerPassword,
        task: taskId,
    };

    async function dispatch(url: string, dispatchType: 'primary' | 'fallback') {
        const requestStartedAt = Date.now();
        console.info('[translate-trigger] Dispatching translation task', {
            source,
            dispatchType,
            taskId,
            workerUrl: url,
        });

        const workerResponse = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        const responseText = await workerResponse.text();
        const requestDurationMs = Date.now() - requestStartedAt;

        console.info('[translate-trigger] Worker response received', {
            source,
            dispatchType,
            taskId,
            status: workerResponse.status,
            ok: workerResponse.ok,
            durationMs: requestDurationMs,
            responsePreview: responseText.slice(0, 500),
        });

        return {
            ok: workerResponse.ok,
            status: workerResponse.status,
            body: responseText,
        };
    }

    console.info('[translate-trigger] Starting dispatch flow', {
        source,
        taskId,
        workerUrl,
        workerFallbackUrl: workerFallbackUrl || null,
    });

    try {
        const primaryResult = await dispatch(workerUrl, 'primary');

        if (
            workerFallbackUrl &&
            workerFallbackUrl !== workerUrl &&
            looksLikeCloudflareChallenge(primaryResult.status, primaryResult.body)
        ) {
            console.warn('[translate-trigger] Cloudflare challenge detected, trying fallback URL', {
                source,
                taskId,
                primaryUrl: workerUrl,
                fallbackUrl: workerFallbackUrl,
                primaryStatus: primaryResult.status,
            });
            return await dispatch(workerFallbackUrl, 'fallback');
        }

        return primaryResult;
    } catch (error) {
        const durationMs = Date.now() - startedAt;
        const formattedError = formatError(error);
        console.error('[translate-trigger] Worker request failed', {
            source,
            taskId,
            workerUrl,
            durationMs,
            error: formattedError,
        });
        return {
            ok: false,
            status: 0,
            body: formattedError,
        };
    }
}
