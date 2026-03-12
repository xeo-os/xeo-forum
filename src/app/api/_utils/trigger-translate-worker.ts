type TriggerTranslateWorkerResult = {
    ok: boolean;
    status: number;
    body: string;
};

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
    const workerPassword = process.env.TRANSLATE_WORKER_PASSWORD;

    if (!workerUrl || !workerPassword) {
        console.error('[translate-trigger] Missing environment variables', {
            source,
            taskId,
            hasTranslateWorkerUrl: Boolean(workerUrl),
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

    console.info('[translate-trigger] Dispatching translation task', {
        source,
        taskId,
        workerUrl,
    });

    try {
        const workerResponse = await fetch(workerUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        const responseText = await workerResponse.text();
        const durationMs = Date.now() - startedAt;

        console.info('[translate-trigger] Worker response received', {
            source,
            taskId,
            status: workerResponse.status,
            ok: workerResponse.ok,
            durationMs,
            responsePreview: responseText.slice(0, 500),
        });

        return {
            ok: workerResponse.ok,
            status: workerResponse.status,
            body: responseText,
        };
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
