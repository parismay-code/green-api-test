import {Dispatch, FunctionComponent, SetStateAction, useMemo, useState} from "react";
import {observer} from "mobx-react-lite";
import cn from "classnames";

import ChatElement from "./components/ChatElement";

import avatarTemplate from "@assets/avatarTemplate.jpg";

import IChat from "@interfaces/IChat.ts";
import IChatsStore from "@interfaces/IChatsStore.ts";

import "./chatsList.scss";

type ChatsListProps = {
	chats: IChatsStore,
	setCurrentChat: Dispatch<SetStateAction<IChat | null>>,
	currentChat: IChat | null,
};

const ChatsList: FunctionComponent<ChatsListProps> = observer((
	{
		chats,
		setCurrentChat,
		currentChat,
	}
) => {
	const [searchQuery, setSearchQuery] = useState<string | null>(null);
	const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

	const chatsList = useMemo(() => {
		if (!searchQuery) {
			return chats.chatsList;
		}

		return chats.chatsList
			.filter((el) => {
				const contact = chats.getContact(el.id);

				return contact?.name.includes(searchQuery);
			})
	}, [chats, chats.chatsList, searchQuery]);

	return <section className={cn("chats left-side", !chats.authorized && "left-side_hidden")}>
		<header className="chats-header">
			<div className="chats-header__img">
				<img src={avatarTemplate} alt="Profile picture"/>
			</div>
		</header>
		<form className="chats-form" onSubmit={(event) => {
			event.preventDefault();
		}}>
			<input
				className="chats-form__input"
				type="search"
				placeholder="Поиск"
				onChange={(event) => {
					setSearchQuery(event.target.value);
				}}
			/>
		</form>
		<ul className="chats-list">
			{chatsList
				.slice()
				.sort((a, b) => {
					const messages = chats.lastMessagesHistory;

					const currentChatLastMessageId = chats.findChatLastMessageId(messages, a);
					const nextChatLastMessageId = chats.findChatLastMessageId(messages, b);

					if (nextChatLastMessageId && currentChatLastMessageId) {
						return nextChatLastMessageId - currentChatLastMessageId;
					}

					return NaN;
				})
				.map((chat, key) => {
					return <li
						className={cn(currentChat?.id === chat?.id && "active")}
						key={key}
						onClick={() => {
							if (timeoutId) {
								clearTimeout(timeoutId);
							}

							const timeout = setTimeout(() => setCurrentChat(chat), 1000);

							setTimeoutId(timeout);
						}}>
						<ChatElement chat={chat} chats={chats}/>
					</li>
				})}
		</ul>
	</section>
});

export default ChatsList;