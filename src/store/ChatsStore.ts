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
	loadingStatus: string | null = null;
	loadingProgress = 0;
	authorized = false;
	chatsList: IChat[] = [];
	contactsList: IContact[] = [];
	chatHistory: IMessage[] = [];
	lastMessagesHistory: IMessage[] = [];

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

		const stepProgress = 70 / promisesData.length;

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

			responses.push(await this.delay(delay).then(() => {
				this.loadingProgress += stepProgress;

				return request();
			}));
		}

		return responses;
	};

	findChatLastMessageId = (messages: IMessage[], chat: IChat) => {
		return messages.findIndex((el) => {
			return el.chatId === chat.id;
		});
	}

	authorize = () => {
		this.loading = true;

		this.instanceId = localStorage.getItem("gapi_instance_id");
		this.instanceApiToken = localStorage.getItem("gapi_instance_api_token");

		if (this.instanceId && this.instanceApiToken) {
			this.loadingStatus = "Проверяем авторизацию"

			axios.get(this.getApiUrl("getStateInstance"))
				.then((response) => {
					this.authorized = response.status === 200 && response.data.stateInstance === "authorized";

					if (!this.authorized) {
						this.loadingStatus = "Не удалось авторизоваться";

						localStorage.removeItem("gapi_instance_id");
						localStorage.removeItem("gapi_instance_api_token");

						this.loading = false;

						throw new Error("Auth error");
					}
				})
				.then(() => {
					this.loadingStatus = "Запрашиваем Ваши контакты";

					this.fetchContacts()
						.then((response) => {
							if (response.status === 200) {
								return response.data;
							} else {
								this.loadingStatus = "Не удалось получить список контактов";

								throw new Error("Contacts fetch failed");
							}
						})
						.then(async (contacts: IContact[]) => {
							await contacts.forEach((contact: IContact) => {
								this.pushContacts(contact);
							});

							return contacts;
						})
						.then(async (contacts) => {
							this.loadingStatus = "Получаем фотографии Ваших контактов";

							await this.fetchAvatars(contacts)
								.then(async (responses) => {
									await this.setContactsAvatars(responses);
								})
								.then(async () => {
									this.loadingStatus = "Получаем список последних сообщений";

									return await this.fetchLastMessages()
										.then((messages) => {
											messages.forEach((message) => {
												this.pushMessages(message);
											})

											return messages;
										})
										.then(() => {
											this.loadingStatus = "Почти закончили, получаем список активных чатов";

											this.fetchChats()
												.then((response) => {
													if (response.status === 200) {
														return response.data;
													} else {
														throw new Error("Chats fetch failed");
													}
												})
												.then(async (chats: IChat[]) => {
													await chats
														.forEach((chat: IChat) => {
															this.pushChats(chat);
														});

													return chats;
												})
												.then(() => {
													this.loadingStatus = "Готово! Еще немного";
													this.loadingProgress = 100;

													setTimeout(() => {
														this.loading = false;
													}, 2000);
												})
												.catch((error) => this.loadingStatus = error);
										})
								})
								.catch((error) => this.loadingStatus = error);
						})
						.catch((error) => this.loadingStatus = error);
				})
				.catch((error) => this.loadingStatus = error);
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
		this.loadingProgress += 5;

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
		this.loadingProgress += 5;

		return await axios.get(this.getApiUrl("getContacts"));
	};

	fetchAvatars = async (entities: IContact[] | IChat[]) => {
		const promisesData = entities.map((entity) => {
			return {method: "post", apiMethod: "GetAvatar", data: {chatId: entity.id}}
		});

		return await this.fetchInSeries(promisesData, 25);
	};

	pushMessages = (message: IMessage) => {
		this.lastMessagesHistory.push({
			chatId: message.chatId,
			typeMessage: message.typeMessage,
			idMessage: message.idMessage,
			textMessage: message.textMessage,
			statusMessage: message.statusMessage,
			type: message.type,
			timestamp: message.timestamp,
			sendByApi: message.sendByApi,
		});
	};

	fetchLastMessages = async () => {
		this.loadingProgress += 5;

		const week = 604800;

		return await axios.get(this.getApiUrl("lastIncomingMessages"), {params: {minutes: week}})
			.then(async (response) => {
				if (response.status === 200) {
					return response.data;
				} else {
					throw new Error("Incoming messages fetch failed");
				}
			})
			.then(async (incomingMessages: IMessage[]) => {
				return await axios.get(this.getApiUrl("LastOutgoingMessages"), {params: {minutes: week}})
					.then((response) => {
						if (response.status === 200) {
							return incomingMessages.concat(response.data);
						} else {
							throw new Error("Outgoing messages fetch failed");
						}
					})
					.then((messages: IMessage[]) => {
						return messages.sort((a, b) => {
							return b.timestamp - a.timestamp;
						});
					});
			});
	}

	setContactsAvatars = (responses: AxiosResponse[]) => {
		this.loadingProgress += 5;

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

	sendMessage = (chatId: string, message: string) => {
		return axios.post(this.getApiUrl("sendMessage"), {chatId: chatId, message: message});
	}
}
