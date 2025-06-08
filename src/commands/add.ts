import { SlashCommandBuilder, CommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../types';

const command: Command = {
    data: new SlashCommandBuilder()
        .setName('add')
        .setDescription('Adds two numbers together')
        .addNumberOption(option =>
            option.setName('first')
                .setDescription('The first number')
                .setRequired(true))
        .addNumberOption(option =>
            option.setName('second')
                .setDescription('The second number')
                .setRequired(true)),

    async execute(interaction: CommandInteraction): Promise<void> {
        const firstNumber = interaction.options.get('first')?.value as number;
        const secondNumber = interaction.options.get('second')?.value as number;

        const result = firstNumber + secondNumber;

        const embed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('🧮 Addition Calculator')
            .setDescription(`**${firstNumber}** + **${secondNumber}** = **${result}**`)
            .addFields(
                { name: 'First Number', value: firstNumber.toString(), inline: true },
                { name: 'Second Number', value: secondNumber.toString(), inline: true },
                { name: 'Result', value: `**${result}**`, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: `Calculated by ${interaction.user.tag}` });

        await interaction.reply({ embeds: [embed] });
    }
};

export default command;