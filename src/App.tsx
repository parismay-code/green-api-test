import {useEffect, useState} from "react";
import {observer, useLocalObservable} from "mobx-react-lite";

import Chat from "@pages/Chat";
import ChatsList from "@pages/ChatsList";
import NoChat from "@pages/NoChat";
import Login from "@pages/Login";

import IChat from "@interfaces/IChat.ts";

import ChatsStore from "@store/ChatsStore";

import Loader from "@components/Loader";

const App = observer(() => {
	const [currentChat, setCurrentChat] = useState<IChat | null>(null);

	const chats = useLocalObservable(() => new ChatsStore());

	useEffect(() => {
		if (currentChat) {
			chats.getChatHistory(currentChat.id);
		}
	}, [currentChat, chats]);

	return <main className="container">
		<ChatsList
			chats={chats}
			currentChat={currentChat}
			setCurrentChat={setCurrentChat}
		/>
		{
			chats.authorized ?
				currentChat ? <Chat chat={currentChat} chats={chats}/> : <NoChat/>
				: <Login authorize={chats.authorize}/>
		}
		<Loader loading={chats.loading}/>
	</main>;
});

export default App;
