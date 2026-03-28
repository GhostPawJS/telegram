import { defineTelegramSkill } from './skill_types.ts';

export const handleGroupAdministration = defineTelegramSkill({
	name: 'handle-group-administration',
	description: 'Inspect and update chat membership, admin rights, and chat metadata.',
	content: `
## Handling Group Administration

### Reading member state
- \`tg_manage\` → \`get_member\` — fetch a single member's status, permissions, and custom title
- \`tg_manage\` → \`list_members\` — list all members or filter by status (\`administrator\`, \`restricted\`, etc.)
- \`tg_read\` → \`get_chat\` — fetch chat metadata including \`isForum\`, \`memberCount\`, \`availableReactions\`

### Promoting and restricting
- \`promote_user\` — sets or removes admin rights; pass \`isAdmin: true\` to grant, \`false\` to revoke
- \`restrict_user\` — limits what a member can send; pass \`canSendMessages: false\` to mute
- Both return an action descriptor — the bot harness executes the API call

### Banning and unbanning
- \`ban_user\` — removes from chat and blocks re-entry; optionally set \`untilDate\` for temporary bans
- \`unban_user\` — lifts the ban; safe to call even if user is not currently banned
- \`kick_user\` — removes from chat without banning (user can rejoin via invite)

### Good patterns
- Before banning: \`get_member\` to confirm current status and avoid redundant actions
- After a role change: update your context with another \`get_member\` call
- Check \`list_members\` with \`status: 'restricted'\` to audit muted users

### Do not
- Do not ban users without a clear reason from the operator
- Do not promote users to administrator without explicit authorisation
`.trim(),
});
