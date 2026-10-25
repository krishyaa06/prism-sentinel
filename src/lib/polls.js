const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const embeds = require('./embeds');

const NUMBERS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];
const active = new Map(); // messageId -> { question, options, votes: Map<userId, index>, endsAt, authorTag }

function render(poll, ended = false) {
    const total = poll.votes.size;
    const counts = poll.options.map((_, i) => [...poll.votes.values()].filter(v => v === i).length);
    const max = Math.max(...counts);

    const lines = poll.options.map((opt, i) => {
        const pct = total ? Math.round((counts[i] / total) * 100) : 0;
        const crown = ended && counts[i] === max && max > 0 ? ' 👑' : '';
        return `${NUMBERS[i]} **${opt}**${crown}\n\`${embeds.progressBar(counts[i], total, 16)}\` ${pct}% · ${counts[i]} vote${counts[i] === 1 ? '' : 's'}`;
    });

    return embeds.base()
        .setTitle(`📊 ${poll.question}`)
        .setDescription(lines.join('\n\n'))
        .addFields({
            name: ended ? 'Poll ended' : 'Ends',
            value: ended ? `${total} total vote${total === 1 ? '' : 's'}` : `<t:${Math.floor(poll.endsAt / 1000)}:R> · ${total} vote${total === 1 ? '' : 's'}`
        })
        .setFooter({ text: `Poll by ${poll.authorTag} • Prism Sentinel` });
}

function buttons(poll, disabled = false) {
    return [new ActionRowBuilder().addComponents(
        poll.options.map((opt, i) =>
            new ButtonBuilder()
                .setCustomId(`poll:${i}`)
                .setLabel(opt.slice(0, 70))
                .setEmoji(NUMBERS[i])
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(disabled)
        )
    )];
}

async function start(interaction, question, options, minutes) {
    const poll = { question, options, votes: new Map(), endsAt: Date.now() + minutes * 60_000, authorTag: interaction.user.username };
    const message = await interaction.reply({ embeds: [render(poll)], components: buttons(poll), fetchReply: true });
    active.set(message.id, poll);

    setTimeout(async () => {
        active.delete(message.id);
        await message.edit({ embeds: [render(poll, true)], components: buttons(poll, true) }).catch(() => {});
    }, minutes * 60_000);
}

async function handleVote(interaction) {
    const poll = active.get(interaction.message.id);
    if (!poll) {
        return interaction.reply({ embeds: [embeds.warning('This poll has ended.')], ephemeral: true });
    }
    const choice = Number(interaction.customId.split(':')[1]);
    const previous = poll.votes.get(interaction.user.id);

    if (previous === choice) poll.votes.delete(interaction.user.id); // click again to remove vote
    else poll.votes.set(interaction.user.id, choice);

    await interaction.update({ embeds: [render(poll)], components: buttons(poll) });
}

module.exports = { start, handleVote };
