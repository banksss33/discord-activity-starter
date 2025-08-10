import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { DiscordSDK } from "@discord/embedded-app-sdk";

function App() {
	useEffect(() => {
		async function setUpSdk() {
			const clientId: string = import.meta.env.VITE_DISCORD_CLIENT_ID;
			if (!clientId) {
				throw new Error(".env clientId not found!");
			}

			const discordSdk = new DiscordSDK(clientId);

			await discordSdk.ready();

			const { code } = await discordSdk.commands.authorize({
				client_id: clientId,
				response_type: "code",
				state: "",
				prompt: "none",
				scope: ["identify", "guilds", "applications.commands"],
			});

			const response = await fetch("/api/token", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					code,
				}),
			});

			const { access_token } = await response.json();

			const auth = await discordSdk.commands.authenticate({
				access_token,
			});

			if (auth == null) {
				throw new Error("Authenticate command failed");
			}

		}

    setUpSdk();
	}, []);
	const [count, setCount] = useState(0);

	return (
		<>
			<div>
				<a
					href="https://vite.dev"
					target="_blank"
				>
					<img
						src={viteLogo}
						className="logo"
						alt="Vite logo"
					/>
				</a>
				<a
					href="https://react.dev"
					target="_blank"
				>
					<img
						src={reactLogo}
						className="logo react"
						alt="React logo"
					/>
				</a>
			</div>
			<h1>Vite + React</h1>
			<div className="card">
				<button onClick={() => setCount((count) => count + 1)}>
					count is {count}
				</button>
				<p>
					Edit <code>src/App.tsx</code> and save to test HMR
				</p>
			</div>
			<p className="read-the-docs">
				Click on the Vite and React logos to learn more
			</p>
		</>
	);
}

export default App;
