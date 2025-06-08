import { Event, BotClient } from '../types';
import { Logger } from '../utils/logger';

const event: Event<'guildCreate'> = {
    name: 'guildCreate',
    async execute(client: BotClient, guild): Promise<void> {
        Logger.info(`Joined new guild: ${guild.name} (${guild.id}) with ${guild.memberCount} members`);
    }
};

export default event;