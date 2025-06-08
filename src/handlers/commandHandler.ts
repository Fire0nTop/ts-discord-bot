import { Collection } from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';
import { Command, BotClient } from '../types';
import { Logger } from '../utils/logger';

export class CommandHandler {
    private client: BotClient;
    private commands: Collection<string, Command>;

    constructor(client: BotClient) {
        this.client = client;
        this.commands = new Collection();
        this.client.commands = new Map();
    }

    async loadCommands(): Promise<void> {
        const commandsPath = join(__dirname, '../commands');

        try {
            // Check if we're running compiled JS or TypeScript
            const allFiles = readdirSync(commandsPath);
            const hasJsFiles = allFiles.some(file => file.endsWith('.js') && !file.endsWith('.d.ts'));
            const hasTsFiles = allFiles.some(file => file.endsWith('.ts') && !file.endsWith('.d.ts'));

            let commandFiles: string[];
            if (hasJsFiles) {
                // Running compiled code - use .js files
                commandFiles = allFiles.filter(file => file.endsWith('.js') && !file.endsWith('.d.ts'));
            } else if (hasTsFiles) {
                // Running with ts-node/tsx - use .ts files
                commandFiles = allFiles.filter(file => file.endsWith('.ts') && !file.endsWith('.d.ts'));
            } else {
                Logger.warn('No command files found');
                return;
            }

            for (const file of commandFiles) {
                const filePath = join(commandsPath, file);

                // Clear require cache for hot reloading
                delete require.cache[require.resolve(filePath)];

                const commandModule = require(filePath);
                const command: Command = commandModule.default || commandModule;

                if ('data' in command && 'execute' in command) {
                    this.commands.set(command.data.name, command);
                    this.client.commands!.set(command.data.name, command);
                    Logger.info(`Loaded command: ${command.data.name}`);
                } else {
                    Logger.warn(`Command at ${filePath} is missing required "data" or "execute" property`);
                }
            }

            Logger.success(`Successfully loaded ${this.commands.size} commands`);
        } catch (error) {
            Logger.error('Error loading commands:', error);
        }
    }

    reloadCommand(commandName: string): boolean {
        try {
            const commandsPath = join(__dirname, '../commands');
            const allFiles = readdirSync(commandsPath);

            // Check if we're running compiled JS or TypeScript
            const hasJsFiles = allFiles.some(file => file.endsWith('.js') && !file.endsWith('.d.ts'));
            const hasTsFiles = allFiles.some(file => file.endsWith('.ts') && !file.endsWith('.d.ts'));

            let commandFile: string | undefined;
            if (hasJsFiles) {
                commandFile = allFiles.find(file =>
                    file.startsWith(commandName) && file.endsWith('.js') && !file.endsWith('.d.ts')
                );
            } else if (hasTsFiles) {
                commandFile = allFiles.find(file =>
                    file.startsWith(commandName) && file.endsWith('.ts') && !file.endsWith('.d.ts')
                );
            }

            if (!commandFile) {
                Logger.error(`Command file for ${commandName} not found`);
                return false;
            }

            const filePath = join(commandsPath, commandFile);

            // Clear require cache for hot reloading
            delete require.cache[require.resolve(filePath)];

            const commandModule = require(filePath);
            const command: Command = commandModule.default || commandModule;

            if ('data' in command && 'execute' in command) {
                this.commands.set(command.data.name, command);
                this.client.commands!.set(command.data.name, command);
                Logger.success(`Reloaded command: ${command.data.name}`);
                return true;
            }

            return false;
        } catch (error) {
            Logger.error(`Error reloading command ${commandName}:`, error);
            return false;
        }
    }

    getCommands(): Collection<string, Command> {
        return this.commands;
    }
}