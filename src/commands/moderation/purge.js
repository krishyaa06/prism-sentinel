const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../../lib/embeds');
const { modLog } = require('../../lib/modlog');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Bulk delete recent messages')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addIntegerOption(o => o.setName('amount').setDescription('1–100').setRequired(true).setMinValue(1).setMaxValue(100))
        .addUserOption(o => o.setName('user').setDescription('Only delete messages from this user')),
    async execute(interaction) {
        const amount = interaction.options.getInteger('amount');
        const user = interaction.options.getUser('user');
        await interaction.deferReply({ ephemeral: true });

        let messages = await interaction.channel.messages.fetch({ limit: 100 });
        if (user) messages = messages.filter(m => m.author.id === user.id);
        const toDelete = [...messages.values()].slice(0, amount);

        // `true` skips messages older than 14 days (Discord can't bulk-delete those)
        const deleted = await interaction.channel.bulkDelete(toDelete, true);
        const skipped = toDelete.length - deleted.size;

        await interaction.editReply({
            embeds: [embeds.success(`🧹 Deleted **${deleted.size}** message(s)${skipped ? ` · skipped ${skipped} older than 14 days` : ''}.`)]
        });
        await modLog(interaction.guild, {
            action: 'Messages purged', target: user, moderator: interaction.user,
            reason: `${deleted.size} message(s) in ${interaction.channel}`
        });
    }
};
