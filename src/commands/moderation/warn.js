const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../lib/db');
const embeds = require('../../lib/embeds');
const { canModerate } = require('../../lib/guards');
const { modLog } = require('../../lib/modlog');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warn a member (stored in their record)')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(o => o.setName('user').setDescription('Member to warn').setRequired(true))
        .addStringOption(o => o.setName('reason').setDescription('Why?').setRequired(true).setMaxLength(500)),
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        const blocked = canModerate(interaction, member);
        if (blocked) return interaction.reply({ embeds: [embeds.error(blocked)], ephemeral: true });

        const guild = db.warnings.guild(interaction.guild.id);
        (guild[user.id] ??= []).push({ reason, moderatorId: interaction.user.id, at: Date.now() });
        db.warnings.save();
        const count = guild[user.id].length;

        await user.send({ embeds: [embeds.warning(`You were warned in **${interaction.guild.name}**.\n**Reason:** ${reason}`)] }).catch(() => {});
        await interaction.reply({ embeds: [embeds.success(`${user} has been warned. They now have **${count}** warning${count === 1 ? '' : 's'}.`)] });
        await modLog(interaction.guild, { action: 'Member warned', target: user, moderator: interaction.user, reason, extra: `Total warnings: ${count}` });
    }
};
