const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../lib/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Show information about a member')
        .addUserOption(o => o.setName('user').setDescription('Member to inspect (defaults to you)')),
    async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);
        const roles = member
            ? member.roles.cache.filter(r => r.id !== interaction.guild.id).sort((a, b) => b.position - a.position).map(r => `${r}`).slice(0, 10)
            : [];

        const embed = embeds.base(member?.displayColor || undefined)
            .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
            .setThumbnail(user.displayAvatarURL({ size: 256 }))
            .addFields(
                { name: '🆔 ID', value: `\`${user.id}\``, inline: true },
                { name: '🤖 Bot', value: user.bot ? 'Yes' : 'No', inline: true },
                { name: '📅 Account created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true }
            );
        if (member) {
            embed.addFields(
                { name: '📥 Joined server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
                { name: `🎭 Roles (${roles.length})`, value: roles.join(' ') || 'None' }
            );
        }
        await interaction.reply({ embeds: [embed] });
    }
};
