const { Client, GatewayIntentBits, Partials } = require('discord.js');
const config = require('./config');
const log = require('./lib/logger');
const { loadCommands, loadEvents } = require('./lib/loader');
const pkg = require('../package.json');

if (!config.token) {
    log.error('DISCORD_TOKEN is missing. Copy .env.example to .env and fill it in.');
    process.exit(1);
}

log.banner('Prism Sentinel', pkg.version);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,     // welcome + auto-role (privileged)
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent    // XP spam filter reads message text (privileged)
    ],
    partials: [Partials.GuildMember]
});

client.commands = loadCommands();
log.info(`Loaded ${client.commands.size} commands`);
loadEvents(client);

process.on('unhandledRejection', err => log.error('Unhandled rejection:', err));

// Optional web panel API (https://krishyaa06.github.io/prism-bots-panel)
const panelPort = Number(process.env.PANEL_API_PORT) || 0;
if (panelPort) {
    require('./lib/panelApi').start(client, { port: panelPort, origin: process.env.PANEL_ORIGIN || 'https://krishyaa06.github.io' }, require('./lib/panelAdapter')(client));
}

client.login(config.token);
