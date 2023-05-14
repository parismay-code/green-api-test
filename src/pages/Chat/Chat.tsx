import {Fragment, FunctionComponent, useCallback, useMemo} from "react";
import {observer} from "mobx-react-lite";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import cn from "classnames";

import {faMessage} from "@fortawesome/free-solid-svg-icons";

import IChatsStore from "@interfaces/IChatsStore.ts";
import IChat from "@interfaces/IChat.ts";

import formatContactName from "@utils/formatContactName.ts";

import "./chat.scss";

type ChatProps = {
	chats: IChatsStore,
	chat: IChat,
};

const Chat: FunctionComponent<ChatProps> = observer(({chats, chat}) => {
	const contact = useMemo(() => chats.getContact(chat.id), [chat, chats]);

	const name = useMemo(() => formatContactName(contact?.name ?? 'Name not found'), [contact]);

	const formattedDate = useCallback((date: Date) => {
		let _date = date.getDate().toString();
		let month = (date.getMonth() + 1).toString();
		const year = date.getFullYear();

		if (_date.length === 1) {
			_date = `0${_date}`;
		}

		if (month.length === 1) {
			month = `0${month}`;
		}

		return `${_date}.${month}.${year}`;
	}, []);

	return <section className="chat">
		<header className="chat-header">
			<div className="chat-header__img">
				<img src={contact?.avatar} alt="Contact picture"/>
			</div>
			<p className="chat-header__name">{name}</p>
		</header>
		<div className="chat-history">
			{chats.chatHistory.length === 0 && <div className="chat-history__info">
							<span>Похоже, в этом чате пусто...</span>
						</div>}
			{chats.chatHistory.map((message, key) => {
				const nextMessage = chats.chatHistory[key + 1] ?? null;

				const currentDate = new Date(message.timestamp);
				const nextDate = nextMessage ? new Date(nextMessage.timestamp) : null;

				const formattedCurrentDate = formattedDate(currentDate);
				const formattedNextDate = nextDate ? formattedDate(nextDate) : null;

				const isNewDate = formattedCurrentDate !== formattedNextDate;

				return <Fragment key={key}>
					<div
						className={cn("chat-history__message", `chat-history__message_${message.type}`)}
					>
						<span className="chat-history__text">{message.textMessage}</span>
						<span className="chat-history__time">
							{`${currentDate.getHours() + 1}:${currentDate.getMinutes() + 1}`}
						</span>
					</div>
					{isNewDate && <div className="chat-history__date">
											<span>{formattedCurrentDate}</span>
										</div>}
				</Fragment>
			})}
		</div>
		<form className="chat-form" onSubmit={(event) => {
			event.preventDefault();
		}}>
			<input
				className="chat-form__input"
				type="text"
				placeholder="Введите сообщение"
			/>
			<FontAwesomeIcon className="chat-form__submit" icon={faMessage}/>
		</form>
	</section>
});

export default Chat;