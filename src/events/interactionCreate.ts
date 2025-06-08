import { CommandInteraction } from 'discord.js';
import { Event, BotClient } from '../types';
import { Logger } from '../utils/logger';

const event: Event<'interactionCreate'> = {
    name: 'interactionCreate',
    async execute(client: BotClient, interaction): Promise<void> {
        if (!interaction.isChatInputCommand()) return;

        const command = client.commands?.get(interaction.commandName);

        if (!command) {
            Logger.warn(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        try {
            await command.execute(interaction as CommandInteraction);
            Logger.info(`${interaction.user.tag} executed /${interaction.commandName}`);
        } catch (error) {
            Logger.error(`Error executing command ${interaction.commandName}:`, error);

            const errorMessage = 'There was an error while executing this command!';

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: errorMessage, ephemeral: true });
            } else {
                await interaction.reply({ content: errorMessage, ephemeral: true });
            }
        }
    }
};

export default event;