const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../../lib/embeds');
const { canModerate } = require('../../lib/guards');
const { modLog } = require('../../lib/modlog');

const UNITS = { m: 60_000, h: 3_600_000, d: 86_400_000 };
const MAX = 28 * UNITS.d; // Discord limit

/** "10m", "2h", "1d" -> ms */
function parseDuration(input) {
    const match = /^(\d+)\s*([mhd])$/i.exec(input.trim());
    return match ? Number(match[1]) * UNITS[match[2].toLowerCase()] : null;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Temporarily mute a member')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(o => o.setName('user').setDescription('Member').setRequired(true))
        .addStringOption(o => o.setName('duration').setDescription('e.g. 10m, 2h, 1d (max 28d). Use 0m to remove.').setRequired(true))
        .addStringOption(o => o.setName('reason').setDescription('Why?').setMaxLength(500)),
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const ms = parseDuration(interaction.options.getString('duration'));
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        if (ms === null || ms > MAX) {
            return interaction.reply({ embeds: [embeds.error('Invalid duration. Use a number + `m`, `h` or `d` (max `28d`).')], ephemeral: true });
        }
        const blocked = canModerate(interaction, member);
        if (blocked) return interaction.reply({ embeds: [embeds.error(blocked)], ephemeral: true });

        await member.timeout(ms || null, reason);
        const text = ms ? `${user} has been timed out until <t:${Math.floor((Date.now() + ms) / 1000)}:f>.` : `Timeout removed for ${user}.`;
        await interaction.reply({ embeds: [embeds.success(text)] });
        await modLog(interaction.guild, { action: ms ? 'Member timed out' : 'Timeout removed', target: user, moderator: interaction.user, reason });
    },
    parseDuration
};
