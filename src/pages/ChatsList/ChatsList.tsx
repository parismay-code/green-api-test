import {AxiosInstance} from "axios";
import {Dispatch, FunctionComponent, SetStateAction} from "react";

import "./chatsList.scss";

type ChatsListProps = {
	api: AxiosInstance,
	chat: number | null,
	setChat: Dispatch<SetStateAction<number | null>>,
};

const ChatsList: FunctionComponent<ChatsListProps> = () => {
	return <section className="chats-list left-side">
		chats list
	</section>
};

export default ChatsList;