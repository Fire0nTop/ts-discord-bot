import {BotClient} from "../types";
import {CommandHandler} from "../handlers/commandHandler";
import {EventHandler} from "../handlers/eventHandler";
import {Client, GatewayIntentBits, REST, Routes} from "discord.js";
import {Logger} from "../utils/logger";
import {env} from "../utils/env";

export class Bot {
    private client: BotClient;
    private commandHandler: CommandHandler;
    private eventHandler: EventHandler;

    constructor() {
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                // Remove MessageContent and GuildMembers intents as they require verification
                // GatewayIntentBits.MessageContent,
                // GatewayIntentBits.GuildMembers
            ]
        }) as BotClient;

        this.commandHandler = new CommandHandler(this.client);
        this.eventHandler = new EventHandler(this.client);
    }

    async start(): Promise<void> {
        try {
            // Load handlers (now synchronous)
            this.commandHandler.loadCommands();
            this.eventHandler.loadEvents();

            // Deploy commands to Discord
            await this.deployCommands();

            // Login to Discord
            await this.client.login(process.env.TOKEN);

        } catch (error) {
            Logger.error('Failed to start bot:', error);
            process.exit(1);
        }
    }

    private async deployCommands(): Promise<void> {
        const token = env.getToken()
        const clientId = env.getClientId();

        if (!token) {
            Logger.error('TOKEN is required in .env file');
            process.exit(1);
        }

        if (!clientId) {
            Logger.warn('CLIENT_ID not found in .env - commands will be deployed globally (may take up to 1 hour)');
        }

        try {
            const commands = Array.from(this.commandHandler.getCommands().values())
                .map(command => command.data.toJSON());

            const rest = new REST().setToken(token);

            Logger.info('Started refreshing application (/) commands.');

            if (clientId) {
                // Deploy to specific guild (instant)
                const guildId = env.getGuildId();
                if (guildId) {
                    await rest.put(
                        Routes.applicationGuildCommands(clientId, guildId),
                        { body: commands }
                    );
                    Logger.success('Successfully reloaded guild application (/) commands.');
                } else {
                    // Deploy globally
                    await rest.put(
                        Routes.applicationCommands(clientId),
                        { body: commands }
                    );
                    Logger.success('Successfully reloaded global application (/) commands.');
                }
            }
        } catch (error) {
            Logger.error('Error deploying commands:', error);
        }
    }

    async shutdown(): Promise<void> {
        Logger.info('Shutting down bot...');
        this.client.destroy();
        process.exit(0);
    }
}