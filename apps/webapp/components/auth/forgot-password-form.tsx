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
import { SuccessToast } from "@trackyrs/ui/components/toasts/success-toast";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import {
	type ForgotPasswordFormData,
	forgotPasswordSchema,
} from "@/lib/validations/auth";

export default function ForgotPasswordForm() {
	const [isLoading, setIsLoading] = useState(false);

	const form = useForm<ForgotPasswordFormData>({
		resolver: zodResolver(forgotPasswordSchema),
		defaultValues: { email: "" },
	});

	async function onSubmit(data: ForgotPasswordFormData) {
		await authClient.requestPasswordReset({
			email: data.email,
			redirectTo: "/reset-password",
			fetchOptions: {
				onRequest: () => setIsLoading(true),
				onResponse: () => setIsLoading(false),
				onError: (ctx) => {
					toast.custom(() => (
						<ErrorToast
							message={
								ctx.error?.message ||
								"Unexpected error. Please, try again later."
							}
						/>
					));
				},
				onSuccess: async () => {
					toast.custom(() => (
						<SuccessToast message="If the email exists, we'll send reset instructions." />
					));
				},
			},
		});
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email</FormLabel>
							<FormControl>
								<Input
									placeholder="Enter your email address"
									type="email"
									autoComplete="email"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button type="submit" className="w-full" disabled={isLoading}>
					{isLoading ? "Sending..." : "Send reset link"}
				</Button>
			</form>
		</Form>
	);
}
