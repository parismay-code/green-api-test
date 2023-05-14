import ReactDOM from "react-dom/client";

import App from "./App.tsx";

import "@utils/initMobX.ts";

import "@styles/global.scss";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(<App/>);
