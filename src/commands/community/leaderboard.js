const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../lib/embeds');
const { leaderboard } = require('../../lib/levels');

const MEDALS = ['🥇', '🥈', '🥉'];

module.exports = {
    data: new SlashCommandBuilder().setName('leaderboard').setDescription('Top 10 most active members'),
    async execute(interaction) {
        const top = leaderboard(interaction.guild.id, 10);
        if (!top.length) {
            return interaction.reply({ embeds: [embeds.info('No one has earned XP yet. Start chatting! 💬')] });
        }
        const lines = top.map((u, i) =>
            `${MEDALS[i] ?? `\`#${i + 1}\``} <@${u.id}> · **Lv ${u.level}** · ${u.total.toLocaleString('en-US')} XP`
        );
        await interaction.reply({
            embeds: [embeds.base().setTitle(`🏆 ${interaction.guild.name} • Leaderboard`).setDescription(lines.join('\n')).setThumbnail(interaction.guild.iconURL())]
        });
    }
};
