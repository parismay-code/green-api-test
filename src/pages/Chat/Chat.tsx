import {AxiosInstance} from "axios";
import {FunctionComponent} from "react";

type ChatProps = {
	api: AxiosInstance,
	chat: number | null,
};

const Chat: FunctionComponent<ChatProps> = () => {
	return <section className="chat">
		chat
	</section>
};

export default Chat;