import { z } from "zod";

export const loginSchema = z.object({
	identifier: z.string().min(1, "Username or email is required"),
	password: z
		.string()
		.min(8, { message: "Password must be at least 8 characters long" }),
});

export const registerSchema = z
	.object({
		name: z.string(),
		email: z.email({ message: "Invalid email format" }),
		username: z
			.string()
			.min(4, { message: "Username must be at least 4 characters long" })
			.max(32, { message: "Username must be at most 32 characters long" })
			.regex(
				/^[a-zA-Z0-9_]+$/,
				"Username can only contain letters, numbers, and underscores",
			),
		password: z.string().min(8, "Password must be at least 8 characters long"),
		confirmPassword: z.string(),
		birthdate: z.date({
			message: "Birthdate is required",
		}),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

export const forgotPasswordSchema = z.object({
	email: z.email({ message: "Invalid email format" }),
});

export const resetPasswordSchema = z
	.object({
		token: z.string().min(1, "Invalid or missing token"),
		password: z.string().min(8, "Password must be at least 8 characters long"),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
