require('dotenv').config();

const color = parseInt((process.env.EMBED_COLOR || '6C63FF').replace('#', ''), 16);

module.exports = {
    token: process.env.DISCORD_TOKEN,
    clientId: process.env.CLIENT_ID,
    guildId: process.env.GUILD_ID || null,
    colors: {
        brand: Number.isNaN(color) ? 0x6c63ff : color,
        success: 0x00ffaa,
        warning: 0xffb020,
        danger: 0xff3366,
        info: 0x00d2ff
    },
    leveling: {
        minXp: 15,
        maxXp: 25,
        cooldownMs: 60_000 // one XP reward per user per minute
    }
};
