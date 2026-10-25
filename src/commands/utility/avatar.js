const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const embeds = require('../../lib/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription("Show a user's avatar in full size")
        .addUserOption(o => o.setName('user').setDescription('User (defaults to you)')),
    async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;
        const url = user.displayAvatarURL({ size: 1024, extension: 'png', forceStatic: false });
        await interaction.reply({
            embeds: [embeds.base().setTitle(`🖼️ ${user.username}'s avatar`).setImage(url)],
            components: [new ActionRowBuilder().addComponents(
                new ButtonBuilder().setLabel('Open original').setStyle(ButtonStyle.Link).setURL(url)
            )]
        });
    }
};
