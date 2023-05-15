import {FunctionComponent, useMemo, useState} from "react";
import {observer} from "mobx-react-lite";
import cn from "classnames";

import ChatElement from "./components/ChatElement";

import avatarTemplate from "@assets/avatarTemplate.jpg";

import IChat from "@interfaces/IChat.ts";
import IChatsStore from "@interfaces/IChatsStore.ts";

import "./chatsList.scss";

type ChatsListProps = {
    chats: IChatsStore,
    setCurrentChat: CallableFunction,
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
                .sort((a) => {
                    const messages = chats.lastMessagesHistory;

                    const currentChatLastMessageId = chats.findChatLastMessageId(messages, a);

                    return chats.lastMessagesHistory[currentChatLastMessageId]?.timestamp ? -1 : 1;
                })
                .sort((a, b) => {
                    const messages = chats.lastMessagesHistory;

                    const currentLastMessageId = chats.findChatLastMessageId(messages, a);
                    const nextLastMessageId = chats.findChatLastMessageId(messages, b);

                    if (currentLastMessageId >= 0 && nextLastMessageId >= 0) {
                        const currentTimestamp = chats.lastMessagesHistory[currentLastMessageId].timestamp;
                        const nextTimestamp = chats.lastMessagesHistory[nextLastMessageId].timestamp;

                        return nextTimestamp - currentTimestamp;
                    }

                    return 0;
                })
                .map((chat, key) => {
                    return <li
                        className={cn(currentChat?.id === chat.id && "active")}
                        key={key}
                        onClick={() => {
                            if (timeoutId) {
                                clearTimeout(timeoutId);
                            }

                            const timeout = setTimeout(() => {
                                setCurrentChat(chats.chatsList.findIndex((el) => chat.id === el.id));
                            }, 1000);

                            setTimeoutId(timeout);
                        }}>
                        <ChatElement chat={chat} chats={chats}/>
                    </li>
                })}
        </ul>
    </section>
});

export default ChatsList;