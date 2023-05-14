import {Fragment, FunctionComponent, useCallback, useMemo, useRef} from "react";
import {observer} from "mobx-react-lite";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import cn from "classnames";

import {faMessage} from "@fortawesome/free-solid-svg-icons";

import IChatsStore from "@interfaces/IChatsStore.ts";
import IChat from "@interfaces/IChat.ts";
import INotifyQueue from "@interfaces/INotifyQueue.ts";
import {NotifyTypes} from "@interfaces/INotify.ts";

import formatContactName from "@utils/formatContactName.ts";
import formatDate from "@utils/formatDate.ts";

import "./chat.scss";
import IMessage from "@interfaces/IMessage.ts";

type ChatProps = {
	chats: IChatsStore,
	chat: IChat,
	notify: INotifyQueue,
};

const Chat: FunctionComponent<ChatProps> = observer(({chats, chat, notify}) => {
	const messageInput = useRef<HTMLInputElement>(null);

	const contact = useMemo(() => chats.getContact(chat.id), [chat, chats]);

	const name = useMemo(() => formatContactName(contact?.name ?? 'Name not found'), [contact]);

	const sendMessage = useCallback(() => {
		if (messageInput.current && messageInput.current.value) {
			chats.sendMessage(chat.id, messageInput.current.value)
				.then((response) => {
					if (response.status === 200 && messageInput.current) {
						const message: IMessage = {
							chatId: chat.id,
							idMessage: response.data.idMessage,
							timestamp: new Date().getTime(),
							type: "outgoing",
							sendByApi: true,
							statusMessage: "OK",
							textMessage: messageInput.current.value,
							typeMessage: "textMessage",
						};

						chats.chatHistory.push(message);
						chats.lastMessagesHistory.unshift(message);

						messageInput.current.value = '';

						notify.addNotify({
							type: NotifyTypes.success,
							message: "Сообщение отправлено!",
							duration: 4000,
						});
					} else {
						notify.addNotify({
							type: NotifyTypes.error,
							message: "Не удалось отправить сообщение",
							duration: 4000,
						});
					}
				})
				.catch((error) => notify.addNotify({
					type: NotifyTypes.error,
					message: error,
					duration: 4000,
				}));
		}
	}, [chat, chats]);

	return <section className="chat">
		<header className="chat-header">
			<div className="chat-header__img">
				<img src={contact?.avatar} alt="Contact picture"/>
			</div>
			<p className="chat-header__name">{name}</p>
		</header>
		<div className="chat__container">
			<div className="chat-history">
				{chats.chatHistory.length === 0 && <div className="chat-history__info">
									<span>Похоже, в этом чате пусто...</span>
								</div>}
				{chats.chatHistory.map((message, key) => {
					const prevMessage = chats.chatHistory[key - 1] ?? null;

					const currentDate = new Date(message.timestamp);
					const prevDate = prevMessage ? new Date(prevMessage.timestamp) : null;

					const formattedCurrentDate = formatDate(currentDate, true);
					const formattedPrevDate = prevDate ? formatDate(prevDate, true) : null;

					const isNewDate = formattedCurrentDate !== formattedPrevDate;

					return <Fragment key={key}>
						{isNewDate && <div className="chat-history__date">
													<span>{formattedCurrentDate}</span>
												</div>}
						<div
							className={cn("chat-history__message", `chat-history__message_${message.type}`)}
						>
							<span className="chat-history__text">{message.textMessage}</span>
							<span className="chat-history__time">
							{`${currentDate.getHours() + 1}:${currentDate.getMinutes() + 1}`}
						</span>
						</div>
					</Fragment>
				})}
			</div>
		</div>
		<form className="chat-form" onSubmit={(event) => {
			event.preventDefault();

			sendMessage();
		}}>
			<input
				ref={messageInput}
				className="chat-form__input"
				type="text"
				placeholder="Введите сообщение"
				onClick={() => sendMessage()}
			/>
			<FontAwesomeIcon className="chat-form__submit" icon={faMessage}/>
		</form>
	</section>
});

export default Chat;