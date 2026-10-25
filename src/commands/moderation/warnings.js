const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../lib/db');
const embeds = require('../../lib/embeds');
const { modLog } = require('../../lib/modlog');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warnings')
        .setDescription('View or clear a member’s warnings')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addSubcommand(s => s.setName('view').setDescription('Show warnings')
            .addUserOption(o => o.setName('user').setDescription('Member').setRequired(true)))
        .addSubcommand(s => s.setName('clear').setDescription('Remove all warnings')
            .addUserOption(o => o.setName('user').setDescription('Member').setRequired(true))),
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const guild = db.warnings.guild(interaction.guild.id);
        const list = guild[user.id] || [];

        if (interaction.options.getSubcommand() === 'clear') {
            delete guild[user.id];
            db.warnings.save();
            await modLog(interaction.guild, { action: 'Warnings cleared', target: user, moderator: interaction.user, reason: `${list.length} removed` });
            return interaction.reply({ embeds: [embeds.success(`Cleared **${list.length}** warning(s) for ${user}.`)] });
        }

        if (!list.length) return interaction.reply({ embeds: [embeds.info(`✨ ${user} has a clean record.`)] });

        const lines = list.slice(-10).reverse().map((w, i) =>
            `**${list.length - i}.** ${w.reason}\n<t:${Math.floor(w.at / 1000)}:R> by <@${w.moderatorId}>`
        );
        await interaction.reply({
            embeds: [embeds.base().setAuthor({ name: `${user.username} • ${list.length} warning(s)`, iconURL: user.displayAvatarURL() }).setDescription(lines.join('\n\n'))]
        });
    }
};
