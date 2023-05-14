import {makeAutoObservable} from "mobx";

import INotifyQueue, {PlayStates} from "@interfaces/INotifyQueue.ts";
import INotify from "@interfaces/INotify.ts";

export default class NotifyStore implements INotifyQueue {
	private showNotifyDelay = 500;

	queue: Array<INotify> = [];
	playState: PlayStates = PlayStates.stopped;

	activeNotify: INotify | null = null;

	constructor() {
		makeAutoObservable(this);
	}

	addNotify(notify: INotify) {
		this.queue.push(notify);

		this.showNotify();
	}

	showNotify() {
		if (this.playState === PlayStates.stopped) {
			const notify = this.queue.shift() as INotify;

			this.activeNotify = notify;
			this.playState = PlayStates.playing;

			setTimeout(() => {
				this.playState = PlayStates.stopped
				this.activeNotify = null;
			}, notify.duration);
		} else {
			if (this.activeNotify && this.activeNotify.message === this.queue[0].message && this.activeNotify.type === this.queue[0].type) {
				this.queue.shift();
			} else {
				setTimeout(() => {
					this.showNotify();
				}, this.showNotifyDelay);
			}
		}
	}
}
