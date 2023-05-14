import {FunctionComponent} from "react";
import cn from "classnames";

import "./loader.scss";

type LoaderProps = {
	loading: boolean,
	status: string | null,
	progress: number,
}

const Loader: FunctionComponent<LoaderProps> = ({loading, status, progress}) => {
	return <section className={cn("loader", loading && "loader_active")}>
		<div className="loader-container">
			<div className="loader-container__square"></div>
			<div className="loader-container__square"></div>
			<div className="loader-container__square"></div>
			<div className="loader-container__square"></div>
		</div>
		<div className="loader-status">
			{status}
			<span className="loader-status__dot">.</span>
			<span className="loader-status__dot">.</span>
			<span className="loader-status__dot">.</span>
		</div>
		<div className="loader-progress">
			<div className="loader-progress__bar" style={{width: `${progress}%`}}/>
		</div>
	</section>;
};

export default Loader;
