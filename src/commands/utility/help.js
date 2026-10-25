const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../lib/embeds');

const ICONS = { utility: '🧰 Utility', community: '🌐 Community', moderation: '🛡️ Moderation', admin: '⚙️ Admin' };

module.exports = {
    data: new SlashCommandBuilder().setName('help').setDescription('List every Prism Sentinel command'),
    async execute(interaction, client) {
        const groups = {};
        for (const cmd of client.commands.values()) {
            (groups[cmd.category] ??= []).push(`\`/${cmd.data.name}\` · ${cmd.data.description}`);
        }
        const embed = embeds.base()
            .setTitle('🔷 Prism Sentinel • Command Center')
            .setDescription('All-in-one community, moderation and leveling bot.\n[Join Prism Protocol](https://dc.gg/prismprotocol)')
            .setThumbnail(client.user.displayAvatarURL());
        for (const key of Object.keys(ICONS)) {
            if (groups[key]) embed.addFields({ name: ICONS[key], value: groups[key].join('\n') });
        }
        await interaction.reply({ embeds: [embed] });
    }
};
