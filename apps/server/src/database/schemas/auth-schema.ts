import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name"),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").notNull(),
	image: text("image"),
	createdAt: timestamp("created_at", {
		mode: "string",
		withTimezone: true,
	}).notNull(),
	updatedAt: timestamp("updated_at", {
		mode: "string",
		withTimezone: true,
	}).notNull(),
	username: text("username").unique(),
	displayUsername: text("display_username"),
	birthdate: timestamp("birthdate", {
		mode: "string",
		withTimezone: false,
	}).notNull(),
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expires_at", {
		mode: "string",
		withTimezone: true,
	}).notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("created_at", {
		mode: "string",
		withTimezone: true,
	}).notNull(),
	updatedAt: timestamp("updated_at", {
		mode: "string",
		withTimezone: true,
	}).notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", {
		mode: "string",
		withTimezone: true,
	}),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
		mode: "string",
		withTimezone: true,
	}),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("created_at", {
		mode: "string",
		withTimezone: true,
	}).notNull(),
	updatedAt: timestamp("updated_at", {
		mode: "string",
		withTimezone: true,
	}).notNull(),
});

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at", {
		mode: "string",
		withTimezone: true,
	}).notNull(),
	createdAt: timestamp("created_at", { mode: "string", withTimezone: true }),
	updatedAt: timestamp("updated_at", { mode: "string", withTimezone: true }),
});
