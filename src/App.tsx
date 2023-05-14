import {useEffect, useState} from "react";
import {observer, useLocalObservable} from "mobx-react-lite";

import Chat from "@pages/Chat";
import ChatsList from "@pages/ChatsList";
import NoChat from "@pages/NoChat";
import Login from "@pages/Login";

import IChat from "@interfaces/IChat.ts";

import ChatsStore from "@store/ChatsStore.ts";

import Loader from "@components/Loader";
import Notify from "@components/Notify";
import NotifyStore from "@store/NotifyStore.ts";
import {NotifyTypes} from "@interfaces/INotify.ts";

const App = observer(() => {
	const [currentChat, setCurrentChat] = useState<IChat | null>(null);

	const chats = useLocalObservable(() => new ChatsStore());
	const notifyQueue = useLocalObservable(() => new NotifyStore());

	useEffect(() => {
		if (currentChat) {
			chats.getChatHistory(currentChat.id);
		}
	}, [currentChat, chats]);

	useEffect(() => {
		if (chats.loadingProgress === 100) {
			notifyQueue.addNotify({
				type: NotifyTypes.success,
				message: "Данные успешно получены!",
				duration: 4000,
			})
		}
	}, [chats.loadingProgress, notifyQueue]);

	return <main className="container">
		<ChatsList
			chats={chats}
			currentChat={currentChat}
			setCurrentChat={setCurrentChat}
		/>
		{
			chats.authorized ?
				currentChat ? <Chat notify={notifyQueue} chat={currentChat} chats={chats}/> : <NoChat/>
				: <Login authorize={chats.authorize}/>
		}
		<Loader progress={chats.loadingProgress} status={chats.loadingStatus} loading={chats.loading}/>
		<Notify notify={notifyQueue}/>
	</main>;
});

export default App;
