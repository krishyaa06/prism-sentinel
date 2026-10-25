const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../lib/embeds');

module.exports = {
    data: new SlashCommandBuilder().setName('ping').setDescription('Check the bot latency'),
    async execute(interaction) {
        const sent = await interaction.reply({ embeds: [embeds.info('📡 Pinging...')], fetchReply: true });
        const roundTrip = sent.createdTimestamp - interaction.createdTimestamp;
        const ws = interaction.client.ws.ping;
        const quality = roundTrip < 150 ? '🟢 Excellent' : roundTrip < 300 ? '🟡 Good' : '🔴 Slow';
        await interaction.editReply({
            embeds: [embeds.base().setTitle('🏓 Pong!').addFields(
                { name: 'Round-trip', value: `\`${roundTrip}ms\``, inline: true },
                { name: 'WebSocket', value: `\`${ws < 0 ? '—' : ws + 'ms'}\``, inline: true },
                { name: 'Status', value: quality, inline: true }
            )]
        });
    }
};
