import { defineTelegramSkill } from './skill_types.ts';

export const moderateChatEffectively = defineTelegramSkill({
	name: 'moderate-chat-effectively',
	description: 'Detect and respond to rule violations, spam, and unwanted content in group chats.',
	content: `
## Moderating Chat Effectively

### Workflow
1. Receive a message via \`onMessage\` handler
2. Inspect \`message.text\`, \`message.type\`, \`message.fromUserId\`, \`message.hasMedia\`
3. Check member standing: \`tg_manage\` → \`get_member\` to see current restrictions
4. Take action via \`tg_manage\`: \`restrict_user\`, \`ban_user\`, or \`kick_user\`
5. Optionally delete the offending message: \`tg_send\` → \`delete_message\`
6. Notify the chat: \`tg_send\` → \`send_message\` with a brief explanation

### Escalation ladder
- First offence → \`restrict_user\` (mute for a period using \`untilDate\`)
- Repeat offence → \`kick_user\` (removable)
- Severe or persistent violation → \`ban_user\`

### Spam signals
- Identical text sent multiple times: use \`search_messages\` to detect
- Messages with external links from new members
- Forwarded content (\`message.forwardOrigin\` is non-null)

### Good patterns
- Always log the reason by sending a message to the chat before taking action
- Use \`untilDate\` for temporary restrictions rather than permanent bans for borderline cases
- Check \`message.isAnonymousAdmin\` before restricting — anonymous admins cannot be restricted

### Do not
- Do not ban users based on a single borderline message
- Do not restrict administrators (\`member.status === 'administrator'\` or \`'creator'\`)
- Do not delete messages without recording the reason in your reasoning
`.trim(),
});
