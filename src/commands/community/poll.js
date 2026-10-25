const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../lib/embeds');
const polls = require('../../lib/polls');

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Create a live button poll')
        .addStringOption(o => o.setName('question').setDescription('What do you want to ask?').setRequired(true).setMaxLength(200))
        .addStringOption(o => o.setName('options').setDescription('2–5 options separated by | (e.g. React | Vue | Svelte)').setRequired(true))
        .addIntegerOption(o => o.setName('minutes').setDescription('Duration in minutes (default 60)').setMinValue(1).setMaxValue(10080)),
    async execute(interaction) {
        const question = interaction.options.getString('question');
        const options = [...new Set(interaction.options.getString('options').split('|').map(s => s.trim()).filter(Boolean))];
        const minutes = interaction.options.getInteger('minutes') ?? 60;

        if (options.length < 2 || options.length > 5) {
            return interaction.reply({ embeds: [embeds.error('Please give **2 to 5** unique options separated by `|`.')], ephemeral: true });
        }
        await polls.start(interaction, question, options, minutes);
    }
};
