const { SlashCommandBuilder, ChannelType } = require('discord.js');
const embeds = require('../../lib/embeds');

module.exports = {
    data: new SlashCommandBuilder().setName('serverinfo').setDescription('Show stats about this server'),
    async execute(interaction) {
        const g = interaction.guild;
        const owner = await g.fetchOwner().catch(() => null);
        const text = g.channels.cache.filter(c => c.type === ChannelType.GuildText).size;
        const voice = g.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size;

        const embed = embeds.base()
            .setTitle(`🏰 ${g.name}`)
            .setThumbnail(g.iconURL({ size: 256 }))
            .addFields(
                { name: '👑 Owner', value: owner ? `${owner.user}` : '—', inline: true },
                { name: '👥 Members', value: g.memberCount.toLocaleString('en-US'), inline: true },
                { name: '🚀 Boosts', value: `${g.premiumSubscriptionCount ?? 0} (Tier ${g.premiumTier})`, inline: true },
                { name: '💬 Channels', value: `${text} text · ${voice} voice`, inline: true },
                { name: '🎭 Roles', value: `${g.roles.cache.size}`, inline: true },
                { name: '📅 Created', value: `<t:${Math.floor(g.createdTimestamp / 1000)}:D>`, inline: true }
            );
        if (g.bannerURL()) embed.setImage(g.bannerURL({ size: 1024 }));
        await interaction.reply({ embeds: [embed] });
    }
};
