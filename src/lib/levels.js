const db = require('./db');

/** XP needed to go from `level` to `level + 1` (same curve as popular leveling bots). */
const xpForLevel = level => 5 * level ** 2 + 50 * level + 100;

function getUser(guildId, userId) {
    const guild = db.levels.guild(guildId);
    if (!guild[userId]) guild[userId] = { xp: 0, level: 0, messages: 0, lastXpAt: 0 };
    return guild[userId];
}

/**
 * Adds XP and returns { leveledUp, user }.
 */
function addXp(guildId, userId, amount) {
    const user = getUser(guildId, userId);
    user.xp += amount;
    let leveledUp = false;
    while (user.xp >= xpForLevel(user.level)) {
        user.xp -= xpForLevel(user.level);
        user.level += 1;
        leveledUp = true;
    }
    db.levels.save();
    return { leveledUp, user };
}

/** Total XP ever earned (used for ranking). */
const totalXp = u => {
    let sum = u.xp;
    for (let l = 0; l < u.level; l++) sum += xpForLevel(l);
    return sum;
};

function leaderboard(guildId, limit = 10) {
    const guild = db.levels.guild(guildId);
    return Object.entries(guild)
        .map(([id, u]) => ({ id, ...u, total: totalXp(u) }))
        .sort((a, b) => b.total - a.total)
        .slice(0, limit);
}

function rankOf(guildId, userId) {
    const all = leaderboard(guildId, Infinity);
    const idx = all.findIndex(u => u.id === userId);
    return idx === -1 ? null : idx + 1;
}

module.exports = { xpForLevel, getUser, addXp, leaderboard, rankOf };
