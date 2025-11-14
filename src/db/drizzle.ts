import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

if (process.env.NODE_ENV !== "production") { 
    neonConfig.fetchEndpoint = (host) => {
		const [protocol, port] =
			host === "db.localtest.me" ? ["http", 4444] : ["https", 443];
		return `${protocol}://${host}:${port}/sql`;
	};
	// const connectionStringUrl = new URL(process.env.DATABASE_URL!);
	// neonConfig.useSecureWebSocket =
	// 	connectionStringUrl.hostname !== "db.localtest.me";
	// neonConfig.wsProxy = (host) =>
	// 	host === "db.localtest.me" ? `${host}:4444/v2` : `${host}/v2`;
	// neonConfig.webSocketConstructor = require("ws");
}

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql);
