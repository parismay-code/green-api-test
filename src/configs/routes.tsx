import {RouteObject} from "react-router-dom";
import Layout from "@components/Layout";

export const routes: Array<RouteObject> = [
	{
		path: "/",
		element: <Layout>
			<div>home</div>
		</Layout>,
	},
	{
		path: "/login",
		element: <Layout>
			<div>login</div>
		</Layout>,
	},
	{
		path: "/registration",
		element: <Layout>
			<div>registration</div>
		</Layout>,
	},
];

export const routesDetails = {
	"/": {
		title: "No Coins",
		nav: true,
		auth: false,
	},
	"/login": {
		title: "Вход",
		nav: false,
		auth: false,
	},
	"/registration": {
		title: "Регистрация",
		nav: false,
		auth: false,
	},
};
