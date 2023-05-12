import {FunctionComponent, memo} from "react";

import Header from "@components/Header";
import Footer from "@components/Footer";

type LayoutProps = {
	children: JSX.Element
};

const Layout: FunctionComponent<LayoutProps> = memo(({children}) => {
	return <>
		<div className="container">
			<Header/>
			{children}
			<Footer/>
		</div>
	</>;
});

export default Layout;
