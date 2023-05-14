import {FunctionComponent, useMemo} from "react";
import {observer} from "mobx-react-lite";

import IChat from "@interfaces/IChat.ts";
import IChatsStore from "@interfaces/IChatsStore.ts";

import formatContactName from "@utils/formatContactName.ts";

import "./chatElement.scss";

type ChatElementProps = {
	chat: IChat,
	chats: IChatsStore,
}

const ChatElement: FunctionComponent<ChatElementProps> = observer(({chats, chat}) => {
	const contact = useMemo(() => chats.getContact(chat.id), [chat, chats]);

	const name = useMemo(() => formatContactName(contact?.name ?? 'Name not found'), [contact]);

	return <div className="chat-element">
		<div className="chat-element__img">
			<img src={contact?.avatar} alt="Chat picture"/>
		</div>
		<div className="chat-element__data">
			<p className="chat-element__name">{name}</p>
		</div>
	</div>
});

export default ChatElement;