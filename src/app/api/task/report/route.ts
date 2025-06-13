import broadcast from '../../_utils/broadcast';
import response from '../../_utils/response';

export async function POST(request: Request) {
    const { password, taskUuid, status } = await request.json();

    if (password !== process.env.TRANSLATE_WORKER_PASSWORD) {
        return response(401, {
            message: 'Unauthorized',
        });
    }

    if (!taskUuid || !status) {
        return response(400, {
            message: 'Missing taskUuid or status',
        });
    }

    try {
        await broadcast({
            type: "task",
            content: {
                uuid: taskUuid,
                status: status,
            },
            title: "",
            link: "",
        });
        return response(200, {
            message: 'Task report broadcasted successfully',
        });
    } catch (e) {
        console.error('Error broadcasting task report:', e);
        return response(500, {
            message: 'Failed to broadcast task report',
        });
    }
}
