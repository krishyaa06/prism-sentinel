const {
    ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits
} = require('discord.js');
const db = require('./db');
const embeds = require('./embeds');
const { modLog } = require('./modlog');
const { colors } = require('../config');

const openRow = () => new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('ticket:open').setLabel('Open a ticket').setEmoji('🎫').setStyle(ButtonStyle.Primary)
);

const closeRow = () => new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('ticket:close').setLabel('Close ticket').setEmoji('🔒').setStyle(ButtonStyle.Danger)
);

function guildTickets(guildId) {
    return db.tickets.guild(guildId, () => ({ supportRoleId: null, categoryId: null, counter: 0, open: {} }));
}

async function openTicket(interaction) {
    const { guild, user } = interaction;
    const data = guildTickets(guild.id);

    // One open ticket per user
    const existingId = Object.keys(data.open).find(id => data.open[id] === user.id);
    if (existingId && guild.channels.cache.has(existingId)) {
        return interaction.reply({ embeds: [embeds.warning(`You already have an open ticket: <#${existingId}>`)], ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });
    data.counter += 1;

    const overwrites = [
        { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
        { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles, PermissionFlagsBits.ReadMessageHistory] },
        { id: interaction.client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels] }
    ];
    if (data.supportRoleId) {
        overwrites.push({ id: data.supportRoleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] });
    }

    const channel = await guild.channels.create({
        name: `ticket-${String(data.counter).padStart(4, '0')}`,
        type: ChannelType.GuildText,
        parent: data.categoryId || null,
        topic: `Ticket for ${user.tag} (${user.id})`,
        permissionOverwrites: overwrites
    });

    data.open[channel.id] = user.id;
    db.tickets.save();

    const embed = embeds.base(colors.info)
        .setTitle(`🎫 Ticket #${String(data.counter).padStart(4, '0')}`)
        .setDescription(`Hey ${user}, thanks for reaching out!\nDescribe your issue and the team will be with you shortly.`);

    await channel.send({
        content: `${user}${data.supportRoleId ? ` <@&${data.supportRoleId}>` : ''}`,
        embeds: [embed],
        components: [closeRow()]
    });
    await interaction.editReply({ embeds: [embeds.success(`Your ticket is ready: ${channel}`)] });
}

async function closeTicket(interaction) {
    const data = guildTickets(interaction.guild.id);
    const ownerId = data.open[interaction.channel.id];
    if (!ownerId) {
        return interaction.reply({ embeds: [embeds.error('This channel is not an open ticket.')], ephemeral: true });
    }

    const isStaff = interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels) ||
        (data.supportRoleId && interaction.member.roles.cache.has(data.supportRoleId));
    if (interaction.user.id !== ownerId && !isStaff) {
        return interaction.reply({ embeds: [embeds.error('Only the ticket owner or staff can close this ticket.')], ephemeral: true });
    }

    delete data.open[interaction.channel.id];
    db.tickets.save();

    await interaction.reply({ embeds: [embeds.warning('Ticket closed. This channel will be deleted in **5 seconds**.')] });
    await modLog(interaction.guild, {
        action: 'Ticket closed',
        target: await interaction.client.users.fetch(ownerId).catch(() => null),
        moderator: interaction.user,
        reason: `#${interaction.channel.name}`
    });
    setTimeout(() => interaction.channel.delete('Ticket closed').catch(() => {}), 5000);
}

async function handleButton(interaction) {
    if (interaction.customId === 'ticket:open') return openTicket(interaction);
    if (interaction.customId === 'ticket:close') return closeTicket(interaction);
}

module.exports = { openRow, guildTickets, handleButton };
