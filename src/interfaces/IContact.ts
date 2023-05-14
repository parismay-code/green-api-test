export default interface IContact {
	id: string;
	name: string;
	type: string;
	avatar: string;
	email: string;
	lastSeen: number | null;
	isArchive: boolean;
	isDisappearing: boolean;
	isMute: boolean;
	messageExpiration: number;
	muteExpiration: number | null;
}
