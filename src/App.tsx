import {useMemo} from "react";
import axios from "axios";
import {createBrowserRouter, RouterProvider} from "react-router-dom";

import {routes} from "@configs/routes.tsx";

import {AppContext} from "@contexts/AppContext.ts";

import {API_URI} from "@utils/consts.ts";

const App = () => {
	const apiClient = useMemo(() => {
		return axios.create({
			baseURL: API_URI,
			headers: {
				"Content-Type": "application/json",
			},
		});
	}, []);

	const router = createBrowserRouter(routes);

	return <AppContext.Provider value={{
		api: apiClient,
	}}>
		<RouterProvider router={router}/>
	</AppContext.Provider>
}

export default App;
