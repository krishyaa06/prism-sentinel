const { Events } = require('discord.js');
const { leveling } = require('../config');
const { addXp, getUser } = require('../lib/levels');
const { getSettings } = require('../lib/db');
const embeds = require('../lib/embeds');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot || !message.inGuild()) return;

        // ── XP (one reward per cooldown window, ignores very short spam) ──
        if (message.content.trim().length < 3) return;
        const user = getUser(message.guild.id, message.author.id);
        user.messages += 1;
        if (Date.now() - user.lastXpAt < leveling.cooldownMs) return;
        user.lastXpAt = Date.now();

        const amount = Math.floor(Math.random() * (leveling.maxXp - leveling.minXp + 1)) + leveling.minXp;
        const { leveledUp, user: updated } = addXp(message.guild.id, message.author.id, amount);
        if (!leveledUp) return;

        const { levelUpChannelId } = getSettings(message.guild.id);
        const channel = (levelUpChannelId && message.guild.channels.cache.get(levelUpChannelId)) || message.channel;
        const embed = embeds.base()
            .setDescription(`⚡ ${message.author} leveled up to **Level ${updated.level}**! Keep building.`)
            .setThumbnail(message.author.displayAvatarURL());
        await channel.send({ embeds: [embed] }).catch(() => {});
    }
};
