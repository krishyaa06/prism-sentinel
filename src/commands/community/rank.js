const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../lib/embeds');
const { getUser, xpForLevel, rankOf } = require('../../lib/levels');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Show your level, XP and server rank')
        .addUserOption(o => o.setName('user').setDescription('Member to check (defaults to you)')),
    async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;
        if (user.bot) return interaction.reply({ embeds: [embeds.warning('Bots do not earn XP.')], ephemeral: true });

        const data = getUser(interaction.guild.id, user.id);
        const needed = xpForLevel(data.level);
        const rank = rankOf(interaction.guild.id, user.id);
        const pct = Math.floor((data.xp / needed) * 100);

        const embed = embeds.base()
            .setAuthor({ name: `${user.username}'s rank card`, iconURL: user.displayAvatarURL() })
            .setThumbnail(user.displayAvatarURL({ size: 256 }))
            .setDescription(`\`${embeds.progressBar(data.xp, needed, 18)}\` **${pct}%**`)
            .addFields(
                { name: '🏆 Rank', value: rank ? `#${rank}` : 'Unranked', inline: true },
                { name: '⚡ Level', value: `${data.level}`, inline: true },
                { name: '✨ XP', value: `${data.xp.toLocaleString('en-US')} / ${needed.toLocaleString('en-US')}`, inline: true },
                { name: '💬 Messages', value: data.messages.toLocaleString('en-US'), inline: true }
            );
        await interaction.reply({ embeds: [embed] });
    }
};
