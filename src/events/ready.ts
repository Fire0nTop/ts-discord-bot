import { Event, BotClient } from '../types';
import { Logger } from '../utils/logger';
import {ActivityType} from "discord.js"

const event: Event<'ready'> = {
    name: 'ready',
    once: true,
    async execute(client: BotClient): Promise<void> {
        Logger.success(`Bot is ready! Logged in as ${client.user?.tag}`);
        Logger.info(`Serving ${client.guilds.cache.size} servers with ${client.users.cache.size} users`);

        // Set bot activity
        client.user?.setActivity('your Questions', {type: ActivityType.Listening});
    }
};

export default event;