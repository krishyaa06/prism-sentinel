const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const db = require('../../lib/db');
const embeds = require('../../lib/embeds');
const tickets = require('../../lib/tickets');
const { colors } = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-panel')
        .setDescription('Post a support ticket panel in this channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addRoleOption(o => o.setName('support_role').setDescription('Role that can see and answer tickets'))
        .addChannelOption(o => o.setName('category').setDescription('Category where ticket channels are created').addChannelTypes(ChannelType.GuildCategory))
        .addStringOption(o => o.setName('title').setDescription('Panel title').setMaxLength(100))
        .addStringOption(o => o.setName('description').setDescription('Panel text').setMaxLength(1000)),
    async execute(interaction) {
        const data = tickets.guildTickets(interaction.guild.id);
        data.supportRoleId = interaction.options.getRole('support_role')?.id ?? data.supportRoleId;
        data.categoryId = interaction.options.getChannel('category')?.id ?? data.categoryId;
        db.tickets.save();

        const panel = embeds.base(colors.info)
            .setTitle(interaction.options.getString('title') || '🎫 Need help?')
            .setDescription(interaction.options.getString('description') ||
                'Click the button below to open a **private ticket** with the team.\nPlease explain your issue clearly. We usually reply within a few hours.');

        await interaction.channel.send({ embeds: [panel], components: [tickets.openRow()] });
        await interaction.reply({ embeds: [embeds.success('Ticket panel posted.')], ephemeral: true });
    }
};
