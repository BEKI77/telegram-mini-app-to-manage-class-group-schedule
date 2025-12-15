import 'dotenv/config';
import { Bot, Context } from 'grammy';
import { db } from '@/db'; // Assumes tsconfig paths work with tsx
import { users, groups, topics, userRoles } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
    console.error("TELEGRAM_BOT_TOKEN is not set");
    process.exit(1);
}

const bot = new Bot(token, {
    client: {
        // Use test environment if configured
        environment: process.env.TELEGRAM_ENV === 'test' ? 'test' : 'prod',
    },
});

bot.command('start', async (ctx) => {
    if (!ctx.from) return;
    const userId = ctx.from.id;

    // Check if user exists, if not create
    try {
        await db.insert(users).values({
            telegramId: userId.toString(),
            firstName: ctx.from.first_name,
            username: ctx.from.username,
        }).onConflictDoUpdate({ 
            target: users.telegramId, 
            set: { firstName: ctx.from.first_name, username: ctx.from.username } 
        });
    } catch(e) {
        console.error("User sync error", e);
    }

    if (ctx.chat.type === 'private') {
        ctx.reply("Welcome! To create a classroom, add me to a Telegram Group and run /create <name> inside the topic you want to use.");
    } else {
        ctx.reply("Hi! Use /create <Classroom Name> to turn this topic into a classroom.");
    }
});

bot.command('create', async (ctx) => {
    if (!ctx.from) return; 

    if (ctx.chat.type === 'private') {
        return ctx.reply("Please use this command inside a Telegram Group Topic.");
    }

    const userId = ctx.from.id;
    const args = ctx.match; // command arguments
    if (!args || typeof args !== 'string' || args.trim().length === 0) {
        return ctx.reply("Please provide a name: /create <Classroom Name>");
    }

    const className = args.trim();
    const chatId = ctx.chat.id.toString();
    const topicId = ctx.message?.message_thread_id?.toString() || '0'; // 0 for General

    try {
        // 1. Ensure User
         await db.insert(users).values({
            telegramId: userId.toString(),
            firstName: ctx.from.first_name,
            username: ctx.from.username,
        }).onConflictDoNothing();

        // 2. Ensure Group
        await db.insert(groups).values({
            telegramId: chatId,
            title: ctx.chat.title || 'Unknown Group',
        }).onConflictDoUpdate({ target: groups.telegramId, set: { title: ctx.chat.title } });

        // 3. Create Topic (Classroom)
        const uniqueTopicId = `${chatId}_${topicId}`;

        await db.insert(topics).values({
            id: uniqueTopicId,
            telegramId: topicId,
            groupId: chatId,
            name: className,
        }).onConflictDoUpdate({ target: topics.id, set: { name: className } });

        // 4. Assign Representative Role
        await db.insert(userRoles).values({
            userId: userId.toString(),
            topicId: uniqueTopicId,
            role: 'representative',
        }).onConflictDoNothing();

        // 5. Generate Link
        const botInfo = await bot.api.getMe();
        const appName = process.env.TELEGRAM_APP_NAME || 'app'; // Default to 'app' if not set
        const link = `https://t.me/${botInfo.username}/${appName}?startapp=${uniqueTopicId}`;

        ctx.reply(`✅ Classroom "${className}" created!\n\nYou are the Representative.\n\nStudents can access the schedule here:\n${link}`, {
            reply_parameters: { message_id: ctx.message?.message_id || 0 }
        });

    } catch (e) {
        console.error("Create Classroom Error", e);
        ctx.reply("❌ Failed to create classroom. Please try again.");
    }
});

// Start the bot
bot.start();
console.log("Bot started...");
