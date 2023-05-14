import {makeAutoObservable} from "mobx";
import axios, {AxiosResponse} from "axios";

import IChatsStore from "@interfaces/IChatsStore.ts";
import IChat from "@interfaces/IChat.ts";
import {API_URI} from "@utils/consts.ts";
import IContact from "@interfaces/IContact.ts";
import IMessage from "@interfaces/IMessage.ts";

export default class ChatsStore implements IChatsStore {
	instanceId: string | null = null;
	instanceApiToken: string | null = null;

	loading = false;
	authorized = false;
	chatsList: IChat[] = [];
	contactsList: IContact[] = [];
	chatHistory: IMessage[] = [];

	constructor() {
		this.authorize();

		makeAutoObservable(this);
	}

	getApiUrl = (method: string) => {
		return `${API_URI}/waInstance${this.instanceId}/${method}/${this.instanceApiToken}`;
	};

	delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

	fetchInSeries = async (promisesData: { method: string, apiMethod: string, data: object }[], delay: number) => {
		const responses: AxiosResponse[] = [];

		for (const promiseData of promisesData) {
			let request: CallableFunction;

			const url = this.getApiUrl(promiseData.apiMethod);

			switch (promiseData.method) {
				case "get":
					request = () => axios.get(url);
					break;
				case "post":
					request = () => axios.post(url, promiseData.data);
					break;
			}

			responses.push(await this.delay(delay).then(() => request()));
		}

		return responses;
	};

	authorize = () => {
		this.loading = true;

		this.instanceId = localStorage.getItem("gapi_instance_id");
		this.instanceApiToken = localStorage.getItem("gapi_instance_api_token");

		if (this.instanceId && this.instanceApiToken) {
			console.log('auth: started');
			axios.get(this.getApiUrl("getStateInstance"))
				.then((response) => {
					this.authorized = response.status === 200 && response.data.stateInstance === "authorized";

					if (!this.authorized) {
						localStorage.removeItem("gapi_instance_id");
						localStorage.removeItem("gapi_instance_api_token");

						this.loading = false;

						throw new Error("Auth error");
					}
				})
				.then(() => {
					console.log('auth: done', 'fetch contacts: started');
					this.fetchContacts()
						.then((response) => {
							if (response.status === 200) {
								return response.data;
							} else {
								throw new Error("Contacts fetch failed");
							}
						})
						.then(async (contacts: IContact[]) => {
							console.log('fetch contacts: done', 'push contacts: started');
							await contacts.forEach((contact: IContact) => {
								this.pushContacts(contact);
							});

							return contacts;
						})
						.then(async (contacts) => {
							console.log('push contacts: done', 'fetch avatars: started');
							await this.fetchAvatars(contacts)
								.then(async (responses) => {
									console.log('fetch avatars: done', 'set avatars: started');
									await this.setContactsAvatars(responses);
								})
								.then(() => {
									console.log('set avatars: done', 'fetch chats: started');
									this.fetchChats()
										.then((response) => {
											if (response.status === 200) {
												return response.data;
											} else {
												throw new Error("Chats fetch failed");
											}
										})
										.then(async (chats: IChat[]) => {
											console.log('fetch chats: done', 'push chats: started');
											await chats.forEach((chat: IChat) => {
												this.pushChats(chat);
											});

											return chats;
										})
										.then(() => {
											console.log('push chats: done', 'closing loader');
											this.loading = false;
										})
										.catch((error) => console.log(error));
								})
								.catch((error) => console.log(error));
						})
						.catch((error) => {
							console.log(error);
						});
				})
				.catch((error) => {
					console.log(error);
				})
		} else {
			this.loading = false;
		}
	};

	pushChats = (chat: IChat) => {
		this.chatsList.push({
			archive: chat.archive,
			id: chat.id,
			notSpam: chat.notSpam,
			ephemeralExpiration: chat.ephemeralExpiration,
			ephemeralSettingTimestamp: chat.ephemeralSettingTimestamp,
		});
	};

	fetchChats = async () => {
		return await axios.get(this.getApiUrl("getChats"));
	};

	pushContacts = (contact: IContact) => {
		this.contactsList.push({
			id: contact.id,
			name: contact.name,
			type: contact.type,
			avatar: contact.avatar,
			email: contact.email,
			lastSeen: contact.lastSeen,
			isArchive: contact.isArchive,
			isDisappearing: contact.isDisappearing,
			isMute: contact.isMute,
			messageExpiration: contact.messageExpiration,
			muteExpiration: contact.muteExpiration,
		});
	};

	fetchContacts = async () => {
		return await axios.get(this.getApiUrl("getContacts"));
	};

	fetchAvatars = async (entities: IContact[] | IChat[]) => {
		const promisesData = entities.map((entity) => {
			return {method: "post", apiMethod: "GetAvatar", data: {chatId: entity.id}}
		});

		return await this.fetchInSeries(promisesData, 10);
	};

	setContactsAvatars = (responses: AxiosResponse[]) => {
		responses.forEach((response, key) => {
			if (response.status === 200) {
				const contact = this.contactsList[key];

				if (contact) {
					contact.avatar = response.data.urlAvatar;
				}
			}
		});
	};

	getContact = (id: string) => {
		return this.contactsList.find((contact) => {
			return contact.id === id;
		});
	};

	getChatHistory = (chatId: string) => {
		axios.post(this.getApiUrl("GetChatHistory"), {chatId: chatId, count: 100})
			.then((response) => {
				if (response.status === 200) {
					this.chatHistory = response.data as IMessage[];
				}
			});
	}
}
