import {useMemo, useState} from "react";
import axios from "axios";

import Chat from "@pages/Chat";
import ChatsList from "@pages/ChatsList";

import {API_URI} from "@utils/consts.ts";
import NoChat from "@pages/NoChat";

const App = () => {
	const [chat, setChat] = useState<number | null>(null);

	const apiClient = useMemo(() => {
		return axios.create({
			baseURL: API_URI,
			headers: {
				"Content-Type": "application/json",
			},
		});
	}, []);

	return <main className="container">
		<ChatsList api={apiClient} chat={chat} setChat={setChat}/>
		{chat ? <Chat api={apiClient} chat={chat}/> : <NoChat/>}
	</main>;
}

export default App;
