/**
 * Prism Sentinel hooks for the panel API (live stats + settings in the web panel).
 */
const db = require('./db');
const pkg = require('../../package.json');

const SCHEMA = [
    { key: 'welcomeChannelId', type: 'channel', label: 'Welcome channel', help: 'Where welcome cards are posted. Empty = off.' },
    { key: 'welcomeMessage', type: 'text', label: 'Welcome message', max: 1000, help: 'Placeholders: {user} {username} {server} {count}' },
    { key: 'autoRoleId', type: 'role', label: 'Auto-role', help: 'Given to every new member. Must be below the bot’s highest role.' },
    { key: 'logChannelId', type: 'channel', label: 'Moderation log channel', help: 'Warns, timeouts, kicks and bans are logged here.' },
    { key: 'levelUpChannelId', type: 'channel', label: 'Level-up channel', help: 'Empty = announce in the channel where the member levelled up.' }
];

const ID = /^\d{17,20}$/;

module.exports = client => ({
    botId: 'sentinel',
    version: pkg.version,
    schema: SCHEMA,
    commands: () => [...client.commands.values()].map(c => ({ name: c.data.name, description: c.data.description, category: c.category })),
    getSettings: id => db.getSettings(id),
    updateSettings(id, patch) {
        const clean = {};
        for (const [key, value] of Object.entries(patch || {})) {
            const field = SCHEMA.find(f => f.key === key);
            if (!field) throw new Error(`Unknown setting "${key}"`);
            if (field.type === 'text') {
                if (typeof value !== 'string' || !value.trim() || value.length > field.max) throw new Error(`${field.label} must be 1-${field.max} characters.`);
            } else if (value !== null && !ID.test(String(value))) {
                throw new Error(`${field.label} is invalid.`);
            }
            if (field.type === 'channel' && value) {
                const ch = client.guilds.cache.get(id)?.channels.cache.get(value);
                if (!ch?.isTextBased()) throw new Error(`${field.label} must be a text channel.`);
            }
            if (field.type === 'role' && value) {
                const g = client.guilds.cache.get(id);
                const role = g?.roles.cache.get(value);
                if (!role || role.managed) throw new Error('That role cannot be assigned.');
                if (role.position >= g.members.me.roles.highest.position) throw new Error('That role is above my highest role.');
            }
            clean[key] = value;
        }
        db.updateSettings(id, clean);
        return db.getSettings(id);
    },
    guildExtra: id => {
        const levels = db.levels.data[id] || {};
        const top = Object.entries(levels)
            .map(([userId, v]) => ({ userId, xp: v.xp ?? 0, level: v.level ?? 0 }))
            .sort((a, b) => (b.level - a.level) || (b.xp - a.xp)).slice(0, 10)
            .map(r => ({ ...r, name: client.users.cache.get(r.userId)?.username || r.userId }));
        const warnings = db.warnings.data[id] || {};
        return {
            leaderboard: top,
            warnings: Object.values(warnings).reduce((a, list) => a + (Array.isArray(list) ? list.length : 0), 0),
            openTickets: Object.values(db.tickets.data[id]?.open || {}).length
        };
    }
});
