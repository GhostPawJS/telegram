// Entity reference builder stubs — wired in step 7 when tool handlers are implemented.

export type EntityRef = {
	type: string;
	id: number | string;
	label?: string | undefined;
};

export function chatRef(chatId: number, label?: string): EntityRef {
	return { type: 'chat', id: chatId, label };
}

export function userRef(userId: number, label?: string): EntityRef {
	return { type: 'user', id: userId, label };
}

export function messageRef(chatId: number, messageId: number): EntityRef {
	return { type: 'message', id: messageId, label: `msg ${messageId} in chat ${chatId}` };
}
