import { Collection } from 'discord.js';
import { join } from 'path';
import { Command, BotClient } from '../types';
import { Logger } from '../utils/logger';
import { FileLoader } from '../utils/fileLoader';

export class CommandHandler {
    private client: BotClient;
    private commands: Collection<string, Command>;
    private commandsPath: string;

    constructor(client: BotClient) {
        this.client = client;
        this.commands = new Collection();
        this.client.commands = new Map();
        this.commandsPath = join(__dirname, '../commands');
    }

    async loadCommands(): Promise<void> {
        try {
            const loadedCommands = await FileLoader.loadFiles<Command>({
                directory: this.commandsPath,
                recursive: true // Allow commands in subdirectories
            });

            // Validate and register commands
            for (const [fileName, command] of loadedCommands) {
                if (this.isValidCommand(command)) {
                    this.registerCommand(command);
                } else {
                    Logger.warn(`Invalid command structure in file: ${fileName}`);
                }
            }

            Logger.success(`Successfully loaded ${this.commands.size} commands`);
        } catch (error) {
            Logger.error('Error loading commands:', error);
        }
    }

    async reloadCommand(commandName: string): Promise<boolean> {
        try {
            // Find the command file
            const commandFile = await this.findCommandFile(commandName);
            if (!commandFile) {
                Logger.error(`Command file for ${commandName} not found`);
                return false;
            }

            // Reload the command
            const command = await FileLoader.reloadFile<Command>(commandFile);
            if (!command || !this.isValidCommand(command)) {
                Logger.error(`Failed to reload command: ${commandName}`);
                return false;
            }

            // Re-register the command
            this.registerCommand(command);
            Logger.success(`Successfully reloaded command: ${commandName}`);
            return true;
        } catch (error) {
            Logger.error(`Error reloading command ${commandName}:`, error);
            return false;
        }
    }

    async reloadAllCommands(): Promise<void> {
        Logger.info('Reloading all commands...');
        this.commands.clear();
        this.client.commands?.clear();
        await this.loadCommands();
    }

    private isValidCommand(command: any): command is Command {
        return (
            command &&
            typeof command === 'object' &&
            'data' in command &&
            'execute' in command &&
            typeof command.execute === 'function' &&
            command.data &&
            typeof command.data.name === 'string'
        );
    }

    private registerCommand(command: Command): void {
        const commandName = command.data.name;
        this.commands.set(commandName, command);
        this.client.commands?.set(commandName, command);
        Logger.info(`Registered command: ${commandName}`);
    }

    private async findCommandFile(commandName: string): Promise<string | null> {
        try {
            const allFiles = await FileLoader.loadFiles<any>({
                directory: this.commandsPath,
                recursive: true
            });

            for (const [fileName, module] of allFiles) {
                if (this.isValidCommand(module) && module.data.name === commandName) {
                    // Return the full path - we need to reconstruct it
                    // This is a simplified approach; you might need to store file paths during initial load
                    return join(this.commandsPath, `${fileName}.js`); // or .ts depending on your setup
                }
            }

            return null;
        } catch (error) {
            Logger.error(`Error finding command file for ${commandName}:`, error);
            return null;
        }
    }

    getCommands(): Collection<string, Command> {
        return this.commands;
    }

    getCommand(commandName: string): Command | undefined {
        return this.commands.get(commandName);
    }

    hasCommand(commandName: string): boolean {
        return this.commands.has(commandName);
    }

    getCommandNames(): string[] {
        return Array.from(this.commands.keys());
    }
}