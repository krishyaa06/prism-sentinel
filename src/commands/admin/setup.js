const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { getSettings, updateSettings } = require('../../lib/db');
const embeds = require('../../lib/embeds');

const textChannel = (o, desc) => o.setName('channel').setDescription(desc)
    .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Configure Prism Sentinel for this server')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand(s => s.setName('welcome').setDescription('Set the welcome channel and message')
            .addChannelOption(o => textChannel(o, 'Welcome channel (leave empty to disable)'))
            .addStringOption(o => o.setName('message').setDescription('Placeholders: {user} {username} {server} {count}').setMaxLength(1000)))
        .addSubcommand(s => s.setName('logs').setDescription('Set the moderation log channel')
            .addChannelOption(o => textChannel(o, 'Log channel (leave empty to disable)')))
        .addSubcommand(s => s.setName('autorole').setDescription('Give new members a role automatically')
            .addRoleOption(o => o.setName('role').setDescription('Role (leave empty to disable)')))
        .addSubcommand(s => s.setName('levelup').setDescription('Where level-up messages are sent')
            .addChannelOption(o => textChannel(o, 'Channel (leave empty = same channel as the message)')))
        .addSubcommand(s => s.setName('view').setDescription('Show the current configuration')),
    async execute(interaction) {
        const gid = interaction.guild.id;
        const sub = interaction.options.getSubcommand();
        const channel = interaction.options.getChannel('channel');

        if (sub === 'welcome') {
            const message = interaction.options.getString('message');
            if (!channel && message) {
                // Only the text changed: keep the current channel
                updateSettings(gid, { welcomeMessage: message });
                return interaction.reply({ embeds: [embeds.success('Welcome message updated.')] });
            }
            updateSettings(gid, { welcomeChannelId: channel?.id ?? null, ...(message ? { welcomeMessage: message } : {}) });
            return interaction.reply({ embeds: [embeds.success(channel ? `Welcome messages will be sent in ${channel}.` : 'Welcome messages disabled.')] });
        }
        if (sub === 'logs') {
            updateSettings(gid, { logChannelId: channel?.id ?? null });
            return interaction.reply({ embeds: [embeds.success(channel ? `Moderation logs will be sent in ${channel}.` : 'Moderation logs disabled.')] });
        }
        if (sub === 'autorole') {
            const role = interaction.options.getRole('role');
            if (role && role.position >= interaction.guild.members.me.roles.highest.position) {
                return interaction.reply({ embeds: [embeds.error('That role is above my highest role, so I cannot assign it.')], ephemeral: true });
            }
            if (role?.managed) return interaction.reply({ embeds: [embeds.error('That role is managed by an integration.')], ephemeral: true });
            updateSettings(gid, { autoRoleId: role?.id ?? null });
            return interaction.reply({ embeds: [embeds.success(role ? `New members will receive ${role}.` : 'Auto-role disabled.')] });
        }
        if (sub === 'levelup') {
            updateSettings(gid, { levelUpChannelId: channel?.id ?? null });
            return interaction.reply({ embeds: [embeds.success(channel ? `Level-ups will be announced in ${channel}.` : 'Level-ups will be announced in the same channel.')] });
        }

        const s = getSettings(gid);
        const show = (id, type) => (id ? (type === 'role' ? `<@&${id}>` : `<#${id}>`) : '`off`');
        await interaction.reply({
            embeds: [embeds.base().setTitle('⚙️ Server configuration').addFields(
                { name: '👋 Welcome', value: show(s.welcomeChannelId), inline: true },
                { name: '📜 Logs', value: show(s.logChannelId), inline: true },
                { name: '🎭 Auto-role', value: show(s.autoRoleId, 'role'), inline: true },
                { name: '⚡ Level-ups', value: s.levelUpChannelId ? show(s.levelUpChannelId) : 'same channel', inline: true },
                { name: '💬 Welcome message', value: s.welcomeMessage }
            )],
            ephemeral: true
        });
    }
};
