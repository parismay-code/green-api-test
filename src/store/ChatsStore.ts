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
    currentChat: number | null = null;
    contactsList: IContact[] = [];
    chatHistory: IMessage[] = [];
    lastMessagesHistory: IMessage[] = [];

    constructor() {
        this.authorize();

        makeAutoObservable(this);
    }

    setCurrentChat = (id: number) => {
        this.currentChat = id;
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

    listenNotification = () => {
        axios.get(this.getApiUrl("receiveNotification"))
            .then((response) => {
                if (response.status !== 200) {
                    throw new Error("Notification receive failed");
                }

                if (!response.data) {
                    throw new Error("No data");
                }

                return response.data;
            })
            .then(async (notification) => {
                const types = ["stateInstanceChanged", "incomingMessageReceived", "outgoingMessageReceived"];

                if (types.includes(notification.body.typeWebhook)) {
                    await axios.delete(this.getApiUrl("deleteNotification") + `/${notification.receiptId}`)
                        .then((response) => {
                            if (response.status === 200 && response.data.result) {
                                return notification.body;
                            } else {
                                throw new Error("Delete notification failed");
                            }
                        })
                        .then((notification) => {
                            switch (notification.typeWebhook) {
                                case "stateInstanceChanged":
                                    if (notification.stateInstance !== "authorized") {
                                        localStorage.removeItem("gapi_instance_id");
                                        localStorage.removeItem("gapi_instance_api_token");

                                        this.authorized = false;
                                    } else if (this.instanceId && this.instanceApiToken) {
                                        localStorage.setItem("gapi_instance_id", this.instanceId);
                                        localStorage.setItem("gapi_instance_api_token", this.instanceApiToken);

                                        this.authorized = true;
                                    } else {
                                        this.authorized = false;
                                    }

                                    break;
                                case "incomingMessageReceived":
                                    this.lastMessagesHistory.unshift({
                                        chatId: notification.senderData.chatId,
                                        idMessage: notification.idMessage,
                                        statusMessage: "",
                                        type: "incoming",
                                        textMessage: notification.messageData.textMessageData.textMessage,
                                        typeMessage: notification.messageData.typeMessage,
                                        sendByApi: true,
                                        timestamp: notification.timestamp,
                                    });

                                    if (this.currentChat && this.chatsList[this.currentChat].id === notification.senderData.chatId) {
                                        this.chatHistory.unshift({
                                            chatId: notification.senderData.chatId,
                                            idMessage: notification.idMessage,
                                            statusMessage: "",
                                            type: "incoming",
                                            textMessage: notification.messageData.textMessageData.textMessage,
                                            typeMessage: notification.messageData.typeMessage,
                                            sendByApi: false,
                                            timestamp: notification.timestamp,
                                        });
                                    }

                                    break;
                                case "outgoingMessageReceived":
                                    if (notification.messageData.typeMessage !== 'textMessage') {
                                        break;
                                    }

                                    this.lastMessagesHistory.unshift({
                                        chatId: notification.senderData.chatId,
                                        idMessage: notification.idMessage,
                                        statusMessage: "",
                                        type: "outgoing",
                                        textMessage: notification.messageData.textMessageData.textMessage,
                                        typeMessage: notification.messageData.typeMessage,
                                        sendByApi: true,
                                        timestamp: notification.timestamp,
                                    });

                                    if (this.currentChat && this.chatsList[this.currentChat].id === notification.senderData.chatId) {
                                        this.chatHistory.unshift({
                                            chatId: notification.senderData.chatId,
                                            idMessage: notification.idMessage,
                                            statusMessage: "",
                                            type: "outgoing",
                                            textMessage: notification.messageData.textMessageData.textMessage,
                                            typeMessage: notification.messageData.typeMessage,
                                            sendByApi: false,
                                            timestamp: notification.timestamp,
                                        });
                                    }

                                    break;
                                default:
                                    throw new Error("Wrong method");
                            }
                        })
                        .then(() => {
                            this.listenNotification();
                        })
                } else {
                    throw new Error("Received type not processed");
                }
            })
            .catch(() => {
                this.listenNotification();
            });
    };

    findChatLastMessageId = (messages: IMessage[], chat: IChat) => {
        return messages.findIndex((el) => {
            return el.chatId === chat.id;
        });
    };

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
                                                .then(async () => {
                                                    return await axios.post(this.getApiUrl("SetSettings"), {
                                                        webhookUrl: "",
                                                        webhookUrlToken: "",
                                                        outgoingMessageWebhook: "yes",
                                                        incomingWebhook: "yes",
                                                        stateWebhook: "yes",
                                                    })
                                                        .then((response) => {
                                                            if (response.status === 200 && response.data.saveSettings) {
                                                                return true;
                                                            } else {
                                                                throw new Error("Setting account setting failed");
                                                            }
                                                        })
                                                        .then(() => {
                                                            this.listenNotification();
                                                        })
                                                        .then(() => {
                                                            this.loadingStatus = "Готово! Еще немного";
                                                            this.loadingProgress = 100;

                                                            setTimeout(() => {
                                                                this.loading = false;
                                                            }, 2000);
                                                        })
                                                })
                                        })
                                })
                        })
                })
                .catch((error) => console.log(error.message));
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

        const minutesInYear = 526000;

        return await axios.get(this.getApiUrl("lastIncomingMessages"), {params: {minutes: minutesInYear * 8}})
            .then(async (response) => {
                if (response.status === 200) {
                    return response.data;
                } else {
                    throw new Error("Incoming messages fetch failed");
                }
            })
            .then(async (incomingMessages: IMessage[]) => {
                return await axios.get(this.getApiUrl("LastOutgoingMessages"), {params: {minutes: minutesInYear * 8}})
                    .then((response) => {
                        if (response.status === 200) {
                            return incomingMessages.concat(response.data);
                        } else {
                            throw new Error("Outgoing messages fetch failed");
                        }
                    })
                    .then((messages: IMessage[]) => {
                        return messages
                            .filter((message) => {
                                return message.typeMessage === "textMessage" || message.typeMessage === "extendedTextMessage";
                            })
                            .sort((a, b) => {
                                return b.timestamp - a.timestamp;
                            });
                    });
            });
    };

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
                    this.chatHistory = response.data
                        .filter((message: IMessage) => {
                            return message.typeMessage === "textMessage" || message.typeMessage === "extendedTextMessage";
                        }) as IMessage[];
                }
            });
    };

    sendMessage = (chatId: string, message: string) => {
        return axios.post(this.getApiUrl("sendMessage"), {chatId: chatId, message: message});
    };
}
