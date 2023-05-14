export default interface IMessage {
	chatId: string,
	idMessage: string,
	sendByApi: boolean,
	statusMessage: string,
	textMessage: string,
	timestamp: number,
	type: string,
	typeMessage: string,
}
