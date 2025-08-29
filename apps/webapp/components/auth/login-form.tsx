"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@trackyrs/ui/components/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@trackyrs/ui/components/form";
import { Input } from "@trackyrs/ui/components/input";
import { ErrorToast } from "@trackyrs/ui/components/toasts/error-toast";
import { capitalize } from "@trackyrs/utils/src/string";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { type LoginFormData, loginSchema } from "@/lib/validations/auth";

export function LoginForm() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	const form = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			identifier: "",
			password: "",
		},
	});

	async function onSubmit(data: LoginFormData) {
		const isEmail = (value: string) => /[^\s@]+@[^\s@]+\.[^\s@]+/.test(value);

		const commonOptions = {
			password: data.password,
			callbackURL: "/",
			fetchOptions: {
				onRequest: () => setIsLoading(true),
				onResponse: () => setIsLoading(false),
				onError: (ctx: { error?: { message?: string } }) => {
					toast.custom(() => (
						<ErrorToast
							message={
								ctx.error?.message
									? `${ctx.error.message
											.split(".")
											.map((part) => part.trim())
											.map((part) => capitalize(part))
											.join(". ")}`
									: "Unexpected error. Please, try again later"
							}
						/>
					));
				},
				onSuccess: async () => {
					router.push("/");
				},
			},
		};

		const identifier = data.identifier.trim();
		if (isEmail(identifier)) {
			await authClient.signIn.email({
				...commonOptions,
				email: identifier,
			});
		} else {
			await authClient.signIn.username({
				...commonOptions,
				username: identifier,
			});
		}
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<FormField
					control={form.control}
					name="identifier"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Username or Email</FormLabel>
							<FormControl>
								<Input
									placeholder="Enter your username or email"
									type="text"
									autoComplete="username"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="password"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Password</FormLabel>
							<FormControl>
								<Input
									placeholder="Enter your password"
									type="password"
									autoComplete="current-password"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="text-right">
					<a
						href="/forgot-password"
						className="font-medium text-primary text-sm hover:text-primary/80"
					>
						Forgot your password?
					</a>
				</div>

				<Button type="submit" className="w-full" disabled={isLoading}>
					{isLoading ? "Signing in..." : "Sign in"}
				</Button>
			</form>
		</Form>
	);
}
