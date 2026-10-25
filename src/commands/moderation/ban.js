const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../../lib/embeds');
const { canModerate } = require('../../lib/guards');
const { modLog } = require('../../lib/modlog');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban or unban a user')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addSubcommand(s => s.setName('add').setDescription('Ban a user')
            .addUserOption(o => o.setName('user').setDescription('User').setRequired(true))
            .addStringOption(o => o.setName('reason').setDescription('Why?').setMaxLength(500))
            .addIntegerOption(o => o.setName('delete_days').setDescription('Delete their messages from the last N days (0–7)').setMinValue(0).setMaxValue(7)))
        .addSubcommand(s => s.setName('remove').setDescription('Unban a user')
            .addStringOption(o => o.setName('user_id').setDescription('User ID').setRequired(true))
            .addStringOption(o => o.setName('reason').setDescription('Why?').setMaxLength(500))),
    async execute(interaction) {
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (interaction.options.getSubcommand() === 'remove') {
            const id = interaction.options.getString('user_id').replace(/\D/g, '');
            const ban = await interaction.guild.bans.fetch(id).catch(() => null);
            if (!ban) return interaction.reply({ embeds: [embeds.error('That user is not banned.')], ephemeral: true });
            await interaction.guild.members.unban(id, reason);
            await interaction.reply({ embeds: [embeds.success(`🔓 **${ban.user.tag}** was unbanned.`)] });
            return modLog(interaction.guild, { action: 'User unbanned', target: ban.user, moderator: interaction.user, reason });
        }

        const user = interaction.options.getUser('user');
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);
        if (member) {
            const blocked = canModerate(interaction, member);
            if (blocked) return interaction.reply({ embeds: [embeds.error(blocked)], ephemeral: true });
            if (!member.bannable) return interaction.reply({ embeds: [embeds.error('I am missing permission to ban that member.')], ephemeral: true });
            await user.send({ embeds: [embeds.warning(`You were banned from **${interaction.guild.name}**.\n**Reason:** ${reason}`)] }).catch(() => {});
        }

        const days = interaction.options.getInteger('delete_days') ?? 0;
        await interaction.guild.members.ban(user.id, { reason, deleteMessageSeconds: days * 86_400 });
        await interaction.reply({ embeds: [embeds.success(`🔨 **${user.tag}** was banned.`)] });
        await modLog(interaction.guild, { action: 'User banned', target: user, moderator: interaction.user, reason });
    }
};
