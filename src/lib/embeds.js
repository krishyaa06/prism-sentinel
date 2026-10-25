const { EmbedBuilder } = require('discord.js');
const { colors } = require('../config');

const FOOTER = { text: 'Prism Sentinel • Build. Create. Compete.' };

const base = (color = colors.brand) => new EmbedBuilder().setColor(color).setFooter(FOOTER).setTimestamp();

module.exports = {
    base,
    success: description => base(colors.success).setDescription(`✅ ${description}`),
    error: description => base(colors.danger).setDescription(`❌ ${description}`),
    warning: description => base(colors.warning).setDescription(`⚠️ ${description}`),
    info: description => base(colors.info).setDescription(description),

    /** Unicode progress bar, e.g. ▰▰▰▰▱▱▱▱▱▱ */
    progressBar(current, total, size = 12) {
        const ratio = total > 0 ? Math.min(current / total, 1) : 0;
        const filled = Math.round(ratio * size);
        return '▰'.repeat(filled) + '▱'.repeat(size - filled);
    }
};
