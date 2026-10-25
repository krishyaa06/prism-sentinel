/**
 * Role-hierarchy checks shared by moderation commands.
 * Returns an error string, or null when the action is allowed.
 */
function canModerate(interaction, targetMember) {
    if (!targetMember) return 'That user is not in this server.';
    if (targetMember.id === interaction.user.id) return "You can't moderate yourself.";
    if (targetMember.id === interaction.client.user.id) return "I can't moderate myself.";
    if (targetMember.id === interaction.guild.ownerId) return "You can't moderate the server owner.";

    const me = interaction.guild.members.me;
    if (targetMember.roles.highest.position >= me.roles.highest.position) {
        return "That member's highest role is above or equal to mine. Move my role higher.";
    }
    if (interaction.user.id !== interaction.guild.ownerId &&
        targetMember.roles.highest.position >= interaction.member.roles.highest.position) {
        return "That member's highest role is above or equal to yours.";
    }
    return null;
}

module.exports = { canModerate };
