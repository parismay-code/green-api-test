import {FunctionComponent} from "react";
import {observer} from "mobx-react-lite";
import cn from "classnames";

import INotifyQueue, {PlayStates} from "@interfaces/INotifyQueue.ts";

import "./notify.scss";

type NotifyProps = {
	notify: INotifyQueue
};

const Notify: FunctionComponent<NotifyProps> = observer(({notify}) => {
	return <div className={
		cn(
			'notify',
			`notify_${notify.activeNotify?.type}`,
			notify.playState === PlayStates.playing && 'notify_active'
		)
	}
	>
		<p>{notify.activeNotify?.message}</p>
	</div>
});

export default Notify;