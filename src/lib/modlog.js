const { getSettings } = require('./db');
const embeds = require('./embeds');
const { colors } = require('../config');

/** Sends a moderation log entry to the configured log channel (if any). */
async function modLog(guild, { action, target, moderator, reason, extra }) {
    const { logChannelId } = getSettings(guild.id);
    if (!logChannelId) return;
    const channel = guild.channels.cache.get(logChannelId);
    if (!channel?.isTextBased()) return;

    const embed = embeds.base(colors.warning)
        .setAuthor({ name: `🛡️ ${action}` })
        .addFields(
            { name: 'User', value: target ? `${target} (\`${target.id}\`)` : '—', inline: true },
            { name: 'Moderator', value: `${moderator}`, inline: true },
            { name: 'Reason', value: reason || 'No reason provided' }
        );
    if (extra) embed.addFields({ name: 'Details', value: extra });
    await channel.send({ embeds: [embed] }).catch(() => {});
}

module.exports = { modLog };
