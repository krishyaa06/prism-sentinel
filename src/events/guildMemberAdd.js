const { Events } = require('discord.js');
const { getSettings } = require('../lib/db');
const embeds = require('../lib/embeds');
const log = require('../lib/logger');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        const settings = getSettings(member.guild.id);

        // Auto-role
        if (settings.autoRoleId) {
            await member.roles.add(settings.autoRoleId, 'Prism Sentinel auto-role')
                .catch(err => log.warn(`Auto-role failed in ${member.guild.name}: ${err.message}`));
        }

        // Welcome card
        const channel = settings.welcomeChannelId && member.guild.channels.cache.get(settings.welcomeChannelId);
        if (!channel?.isTextBased()) return;

        const text = settings.welcomeMessage
            .replaceAll('{user}', `${member}`)
            .replaceAll('{username}', member.user.username)
            .replaceAll('{server}', member.guild.name)
            .replaceAll('{count}', member.guild.memberCount.toLocaleString('en-US'));

        const embed = embeds.base()
            .setAuthor({ name: `${member.user.username} just landed 🚀`, iconURL: member.user.displayAvatarURL() })
            .setDescription(text)
            .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
            .addFields(
                { name: 'Account created', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true },
                { name: 'Member', value: `#${member.guild.memberCount}`, inline: true }
            );

        await channel.send({ content: `${member}`, embeds: [embed] }).catch(() => {});
    }
};
