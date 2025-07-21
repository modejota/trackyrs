import * as process from "node:process";
import { database } from "@trackyrs/database";
import {
	account,
	session,
	user,
	verification,
} from "@trackyrs/database/schemas/auth-schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { username } from "better-auth/plugins";

export const auth = betterAuth({
	database: drizzleAdapter(database, {
		provider: "pg",
		schema: { user, session, account, verification },
	}),
	trustedOrigins: [process.env.ALLOWED_CORS_ORIGIN as string],
	secret: process.env.BETTER_AUTH_SECRET,
	baseURL: process.env.BETTER_AUTH_URL,
	emailAndPassword: {
		enabled: true,
		minPasswordLength: 8,
		maxPasswordLength: 32,
		autoSignIn: true,
	},
	plugins: [
		username({
			minUsernameLength: 4,
			maxUsernameLength: 32,
		}),
	],
	user: {
		additionalFields: {
			name: { type: "string", required: false },
			birthdate: { type: "date", required: true },
		},
	},
});

export type AuthType = {
	user: typeof auth.$Infer.Session.user | null;
	session: typeof auth.$Infer.Session.session | null;
};
