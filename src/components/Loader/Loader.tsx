import {FunctionComponent} from "react";
import cn from "classnames";

import "./loader.scss";

type LoaderProps = {
	loading: boolean,
}

const Loader: FunctionComponent<LoaderProps> = ({loading}) => {
	return <section className={cn("loader", loading && "loader_active")}>
		<div className="loader-container">
			<div className="loader-container__square"></div>
			<div className="loader-container__square"></div>
			<div className="loader-container__square"></div>
			<div className="loader-container__square"></div>
		</div>
		<div className="loader-status">
			Loading
			<span className="loader-status__dot">.</span>
			<span className="loader-status__dot">.</span>
			<span className="loader-status__dot">.</span>
		</div>
	</section>;
};

export default Loader;
