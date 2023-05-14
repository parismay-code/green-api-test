import IChat from "@interfaces/IChat.ts";
import IContact from "@interfaces/IContact.ts";
import {AxiosResponse} from "axios";
import IMessage from "@interfaces/IMessage.ts";

export default interface IChatsStore {
	loading: boolean;
	instanceId: string | null;
	instanceApiToken: string | null;
	authorized: boolean;
	chatsList: IChat[];
	contactsList: IContact[];
	chatHistory: IMessage[];

	getApiUrl(method: string): string;

	delay(ms: number): Promise<unknown>;

	fetchInSeries(promisesData: {
		method: string,
		apiMethod: string,
		data: object
	}[], delay: number): Promise<AxiosResponse[]>;

	authorize(): void;

	pushChats(chat: IChat): void;

	fetchChats(): void;

	pushContacts(contact: IContact): void;

	fetchContacts(): void;

	fetchAvatars(entities: IContact[] | IChat[]): void;

	getContact(id: string): IContact | undefined;

	setContactsAvatars(responses: AxiosResponse[]): void;

	getChatHistory(chatId: string): void;
}