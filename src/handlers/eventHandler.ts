import { join } from 'path';
import { ClientEvents } from 'discord.js';
import { Event, BotClient } from '../types';
import { Logger } from '../utils/logger';
import { FileLoader } from '../utils/fileLoader';

type EventExecutor = (client: BotClient, ...args: any[]) => Promise<void> | void;

interface LoadedEvent {
    name: keyof ClientEvents;
    once?: boolean;
    execute: EventExecutor;
}

export class EventHandler {
    private client: BotClient;
    private events: Map<string, LoadedEvent>;
    private eventsPath: string;

    constructor(client: BotClient) {
        this.client = client;
        this.events = new Map();
        this.eventsPath = join(__dirname, '../events');
    }

    async loadEvents(): Promise<void> {
        try {
            const loadedEvents = await FileLoader.loadFiles<Event>({
                directory: this.eventsPath,
                recursive: true // Allow events in subdirectories
            });

            // Validate and register events
            for (const [fileName, event] of loadedEvents) {
                if (this.isValidEvent(event)) {
                    this.registerEvent(event, fileName);
                } else {
                    Logger.warn(`Invalid event structure in file: ${fileName}`);
                }
            }

            Logger.success(`Successfully loaded ${this.events.size} events`);
        } catch (error) {
            Logger.error('Error loading events:', error);
        }
    }

    async reloadEvents(): Promise<void> {
        Logger.info('Reloading all events...');

        // Remove all existing listeners
        this.client.removeAllListeners();
        this.events.clear();

        // Reload events
        await this.loadEvents();
    }

    private isValidEvent(event: any): event is Event {
        return (
            event &&
            typeof event === 'object' &&
            'name' in event &&
            'execute' in event &&
            typeof event.name === 'string' &&
            typeof event.execute === 'function'
        );
    }

    private registerEvent(event: Event, fileName: string): void {
        try {
            const loadedEvent: LoadedEvent = {
                name: event.name,
                once: event.once,
                execute: event.execute
            };

            // Register the event listener with proper type handling
            if (event.once) {
                this.client.once(event.name, (...args: any[]) => {
                    this.handleEvent(loadedEvent, fileName, ...args);
                });
            } else {
                this.client.on(event.name, (...args: any[]) => {
                    this.handleEvent(loadedEvent, fileName, ...args);
                });
            }

            this.events.set(fileName, loadedEvent);
            Logger.info(`Registered event: ${event.name} (${event.once ? 'once' : 'on'}) from ${fileName}`);
        } catch (error) {
            Logger.error(`Error registering event ${event.name}:`, error);
        }
    }

    private async handleEvent(event: LoadedEvent, fileName: string, ...args: any[]): Promise<void> {
        try {
            await event.execute(this.client, ...args);
        } catch (error) {
            Logger.error(`Error executing event ${event.name} from ${fileName}:`, error);
        }
    }

    getEvents(): Map<string, LoadedEvent> {
        return this.events;
    }

    getEvent(fileName: string): LoadedEvent | undefined {
        return this.events.get(fileName);
    }

    hasEvent(fileName: string): boolean {
        return this.events.has(fileName);
    }

    getEventNames(): string[] {
        return Array.from(this.events.values()).map(event => event.name);
    }
}