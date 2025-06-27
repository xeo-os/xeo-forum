import { PrismaClient } from '../src/generated/prisma';
const prisma = new PrismaClient();
import shufflerModule from '../src/app/api/_utils/shuffler';
const shuffler = shufflerModule.default || shufflerModule;
import argon2 from 'argon2';

async function encrypt(password) {
    const options = {
        timeCost: 3,
        memoryCost: 65536,
        parallelism: 8,
        hashLength: 32,
    };
    return await argon2.hash(shuffler(password), options);
}

async function main() {
    const users = await prisma.user.findMany();
    let updated = 0;
    for (const user of users) {
        if (!user.password.startsWith('$argon2id$')) {
            const newPassword = await encrypt(user.password);
            await prisma.user.update({
                where: { username: user.username },
                data: { password: newPassword },
            });
            console.log(`Updated password for user: ${user.username}`);
            updated++;
        }
    }
    await prisma.$disconnect();
    console.log(`Done. Updated ${updated} user(s).`);
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});