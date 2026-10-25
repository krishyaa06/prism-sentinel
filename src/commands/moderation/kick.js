const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../../lib/embeds');
const { canModerate } = require('../../lib/guards');
const { modLog } = require('../../lib/modlog');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a member from the server')
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .addUserOption(o => o.setName('user').setDescription('Member').setRequired(true))
        .addStringOption(o => o.setName('reason').setDescription('Why?').setMaxLength(500)),
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        const blocked = canModerate(interaction, member);
        if (blocked) return interaction.reply({ embeds: [embeds.error(blocked)], ephemeral: true });
        if (!member.kickable) return interaction.reply({ embeds: [embeds.error('I am missing permission to kick that member.')], ephemeral: true });

        await user.send({ embeds: [embeds.warning(`You were kicked from **${interaction.guild.name}**.\n**Reason:** ${reason}`)] }).catch(() => {});
        await member.kick(reason);
        await interaction.reply({ embeds: [embeds.success(`👢 **${user.tag}** was kicked.`)] });
        await modLog(interaction.guild, { action: 'Member kicked', target: user, moderator: interaction.user, reason });
    }
};
