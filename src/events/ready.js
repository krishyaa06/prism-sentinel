const { Events, ActivityType } = require('discord.js');
const log = require('../lib/logger');

const STATUSES = [
    { name: 'over Prism Protocol 🔷', type: ActivityType.Watching },
    { name: '/help • Build. Create. Compete.', type: ActivityType.Playing },
    { name: '{servers} servers', type: ActivityType.Watching }
];

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        log.ok(`Logged in as ${client.user.tag} • ${client.guilds.cache.size} servers`);
        let i = 0;
        const rotate = () => {
            const s = STATUSES[i++ % STATUSES.length];
            client.user.setActivity(s.name.replace('{servers}', client.guilds.cache.size), { type: s.type });
        };
        rotate();
        setInterval(rotate, 30_000);
    }
};
