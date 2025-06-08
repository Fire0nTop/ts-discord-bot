import { readdirSync } from 'fs';
import { join } from 'path';
import { pathToFileURL } from 'url';
import { Event, BotClient } from '../types';
import { Logger } from '../utils/logger';

export class EventHandler {
    private client: BotClient;

    constructor(client: BotClient) {
        this.client = client;
    }

    async loadEvents(): Promise<void> {
        const eventsPath = join(__dirname, '../events');

        try {
            const eventFiles = readdirSync(eventsPath).filter(file =>
                file.endsWith('.ts') || file.endsWith('.js')
            );

            for (const file of eventFiles) {
                const filePath = join(eventsPath, file);
                // Convert Windows path to file:// URL for ESM compatibility
                const fileUrl = pathToFileURL(filePath).href;
                const eventModule = await import(fileUrl);
                const event: Event = eventModule.default || eventModule;

                if ('name' in event && 'execute' in event) {
                    if (event.once) {
                        this.client.once(event.name, (...args) => event.execute(this.client, ...args));
                    } else {
                        this.client.on(event.name, (...args) => event.execute(this.client, ...args));
                    }
                    Logger.info(`Loaded event: ${event.name}`);
                } else {
                    Logger.warn(`Event at ${filePath} is missing required "name" or "execute" property`);
                }
            }

            Logger.success(`Successfully loaded events`);
        } catch (error) {
            Logger.error('Error loading events:', error);
        }
    }
}