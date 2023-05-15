import IChat from "@interfaces/IChat.ts";
import IContact from "@interfaces/IContact.ts";
import {AxiosResponse} from "axios";
import IMessage from "@interfaces/IMessage.ts";

export default interface IChatsStore {
	loading: boolean;
	loadingStatus: string | null;
	loadingProgress: number;
	instanceId: string | null;
	instanceApiToken: string | null;
	authorized: boolean;
	chatsList: IChat[];
	currentChat: number | null;
	contactsList: IContact[];
	chatHistory: IMessage[];
	lastMessagesHistory: IMessage[];

	setCurrentChat(id: number): void;

	getApiUrl(method: string): string;

	delay(ms: number): Promise<unknown>;

	fetchInSeries(promisesData: {
		method: string,
		apiMethod: string,
		data: object
	}[], delay: number): Promise<AxiosResponse[]>;

	findChatLastMessageId(messages: IMessage[], chat: IChat): number;

	listenNotification(): void;

	authorize(): void;

	pushChats(chat: IChat): void;

	fetchChats(): Promise<AxiosResponse>;

	pushContacts(contact: IContact): void;

	fetchContacts(): Promise<AxiosResponse>;

	fetchAvatars(entities: IContact[] | IChat[]): Promise<AxiosResponse[]>;

	fetchLastMessages(): Promise<IMessage[]>;

	getContact(id: string): IContact | undefined;

	setContactsAvatars(responses: AxiosResponse[]): void;

	getChatHistory(chatId: string): void;

	sendMessage(chadId: string, message: string): Promise<AxiosResponse>;
}