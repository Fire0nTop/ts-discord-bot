import {CommandInteraction, SlashCommandBuilder} from 'discord.js';
import {Command} from '../types';
import {Logger} from "../utils/logger";

const command: Command = {
    data: new SlashCommandBuilder()
        .setName('whisper')
        .setDescription('Sends you a DM'),

    async execute(interaction: CommandInteraction): Promise<void> {
        try {
            const user = interaction.user
            const dmChannel = await user.createDM()
            await dmChannel.send("👋 Hey! This is a DM sent via bot.")
            await interaction.reply("📬 I sent you a DM!")
        } catch (error) {
            Logger.error("Failed to send DM:", error)
            await interaction.reply("❌ I couldn't send you a DM. Maybe your DMs are disabled?")
        }
    }
};

export default command;