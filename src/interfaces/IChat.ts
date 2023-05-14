export default interface IChat {
	archive: boolean;
	id: string;
	notSpam: boolean;
	ephemeralExpiration: number;
	ephemeralSettingTimestamp: number;
}
