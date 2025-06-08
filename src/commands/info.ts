import { SlashCommandBuilder, CommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../types';
import {TimeFormatter} from "../utils/timeFormatter";

const command: Command = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Shows information about the bot'),

    async execute(interaction: CommandInteraction): Promise<void> {
        const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('Bot Information')
            .setDescription('A robust Discord bot built with TypeScript and discord.js')
            .addFields(
                { name: 'Servers', value: `${interaction.client.guilds.cache.size}`, inline: true },
                { name: 'Users', value: `${interaction.client.users.cache.size}`, inline: true },
                { name: 'Uptime', value: `${TimeFormatter.formatTimeToString(process.uptime())}`, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: `Requested by ${interaction.user.tag}` });

        await interaction.reply({ embeds: [embed] });
    }
};

export default command;