import {FunctionComponent, useMemo} from "react";
import {observer} from "mobx-react-lite";

import avatarTemplate from "@assets/avatarTemplate.jpg";

import IChat from "@interfaces/IChat.ts";
import IChatsStore from "@interfaces/IChatsStore.ts";

import formatContactName from "@utils/formatContactName.ts";
import formatDate from "@utils/formatDate.ts";

import "./chatElement.scss";
import formatTime from "@utils/formatTime.ts";

type ChatElementProps = {
	chat: IChat,
	chats: IChatsStore,
}

const ChatElement: FunctionComponent<ChatElementProps> = observer(({chats, chat}) => {
	const contact = useMemo(() => chats.getContact(chat.id), [chat, chats]);

	const name = useMemo(() => formatContactName(contact?.name ?? '...'), [contact]);

	const lastMessage = useMemo(() => {
		const lastMessageId = chats.findChatLastMessageId(chats.lastMessagesHistory, chat);

		if (lastMessageId === undefined) {
			return null;
		}

		return chats.lastMessagesHistory[lastMessageId];
	}, [chat, chats, chats.lastMessagesHistory.length]);

	const lastMessageText = useMemo(() => {
		if (lastMessage && lastMessage.textMessage.length > 45) {
			return `${lastMessage.textMessage.slice(0, 45)}...`
		}

		return lastMessage?.textMessage;
	}, [lastMessage]);

	const lastMessageDate = useMemo(() => {
		if (!lastMessage) {
			return null;
		}

		const now = new Date();

		const date = new Date(lastMessage.timestamp * 1000);

		const sameYear = now.getFullYear() === date.getFullYear();

		if (formatDate(date, true) === formatDate(now, true)) {
			return formatTime(date, false);
		}

		return formatDate(date, !sameYear);
	}, [lastMessage]);

	return <div className="chat-element">
		<div className="chat-element__img">
			<img src={contact?.avatar || avatarTemplate} alt="Chat picture"/>
		</div>
		<div className="chat-element__data">
			<p className="chat-element__name">{name}</p>
			{lastMessageText && <p className="chat-element__message">{lastMessageText}</p>}
		</div>
		{lastMessageDate && <span className="chat-element__time">{lastMessageDate}</span>}
	</div>
});

export default ChatElement;