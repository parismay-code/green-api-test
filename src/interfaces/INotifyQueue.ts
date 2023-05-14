import INotify from "@interfaces/INotify.ts";

export enum PlayStates {
    playing = "playing",
    stopped = "stopped",
}

export default interface INotifyQueue {
    activeNotify: INotify | null;
    addNotify(notify: INotify): void;
    showNotify(): void;
    queue: Array<INotify>,
    playState: PlayStates,
}
