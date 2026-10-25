const { Events } = require('discord.js');
const embeds = require('../lib/embeds');
const log = require('../lib/logger');
const tickets = require('../lib/tickets');
const polls = require('../lib/polls');

const cooldowns = new Map(); // `${command}:${user}` -> timestamp

async function reply(interaction, payload) {
    if (interaction.deferred || interaction.replied) return interaction.followUp(payload).catch(() => {});
    return interaction.reply(payload).catch(() => {});
}

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        try {
            // ── Buttons ──────────────────────────────
            if (interaction.isButton()) {
                if (interaction.customId.startsWith('ticket:')) return await tickets.handleButton(interaction);
                if (interaction.customId.startsWith('poll:')) return await polls.handleVote(interaction);
                return;
            }

            if (!interaction.isChatInputCommand()) return;
            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            if (!interaction.inGuild()) {
                return reply(interaction, { embeds: [embeds.error('Commands only work inside a server.')], ephemeral: true });
            }

            // ── Per-user cooldown ────────────────────
            const seconds = command.cooldown ?? 3;
            const key = `${command.data.name}:${interaction.user.id}`;
            const until = cooldowns.get(key) || 0;
            if (Date.now() < until) {
                const left = ((until - Date.now()) / 1000).toFixed(1);
                return reply(interaction, { embeds: [embeds.warning(`Slow down! Try again in **${left}s**.`)], ephemeral: true });
            }
            cooldowns.set(key, Date.now() + seconds * 1000);

            await command.execute(interaction, client);
        } catch (err) {
            log.error(`Interaction failed (${interaction.commandName || interaction.customId}):`, err);
            await reply(interaction, { embeds: [embeds.error('Something went wrong while running that. Please try again.')], ephemeral: true });
        }
    }
};
