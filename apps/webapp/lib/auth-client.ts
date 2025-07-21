import {
	inferAdditionalFields,
	usernameClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	baseURL: process.env.NEXT_PUBLIC_HONO_SERVER_URL as string,
	plugins: [
		usernameClient(),
		inferAdditionalFields({
			user: {
				name: { type: "string", required: false },
				birthdate: { type: "date", required: true },
			},
		}),
	],
});

export type User = typeof authClient.$Infer.Session.user;
export type Session = typeof authClient.$Infer.Session.session;
