import {Fragment, FunctionComponent, useCallback, useMemo, useRef} from "react";
import {observer} from "mobx-react-lite";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import cn from "classnames";

import {faMessage} from "@fortawesome/free-solid-svg-icons";

import IChatsStore from "@interfaces/IChatsStore.ts";
import IChat from "@interfaces/IChat.ts";
import INotifyQueue from "@interfaces/INotifyQueue.ts";
import {NotifyTypes} from "@interfaces/INotify.ts";
import IMessage from "@interfaces/IMessage.ts";

import avatarTemplate from "@assets/avatarTemplate.jpg";

import formatContactName from "@utils/formatContactName.ts";
import formatDate from "@utils/formatDate.ts";

import "./chat.scss";
import formatTime from "@utils/formatTime.ts";

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
                            timestamp: new Date().getTime() / 1000,
                            type: "outgoing",
                            sendByApi: true,
                            statusMessage: "OK",
                            textMessage: messageInput.current.value,
                            typeMessage: "textMessage",
                        };

                        chats.chatHistory.unshift(message);
                        chats.lastMessagesHistory.unshift(message);

                        messageInput.current.value = '';
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
    }, [chat, chats, notify]);

    return <section className="chat">
        <header className="chat-header">
            <div className="chat-header__img">
                <img src={contact?.avatar || avatarTemplate} alt="Contact picture"/>
            </div>
            <p className="chat-header__name">{name}</p>
        </header>
        <div className="chat__container">
            <div className="chat-history">
                {chats.chatHistory.length === 0 && <div className="chat-history__info">
                    <span>Похоже, в этом чате пусто...</span>
                </div>}
                {chats.chatHistory.slice().reverse().map((message, key) => {
                    const prevMessage = chats.chatHistory[chats.chatHistory.length - key];

                    const date = new Date(message.timestamp * 1000);

                    const isNewDate = prevMessage ?
                        date.getDate() - new Date(prevMessage.timestamp * 1000).getDate() > 0 : true;

                    return <Fragment key={key}>
                        {isNewDate && <div className="chat-history__date">
                            <span>{formatDate(date, true)}</span>
                        </div>}
                        <div
                            className={cn("chat-history__message", `chat-history__message_${message.type}`)}
                        >
							<span className="chat-history__text">
								{message.textMessage}
                                <span className="chat-history__time">
                                    {formatTime(date, false)}
                                </span>
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