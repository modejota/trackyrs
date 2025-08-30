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
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import {
	type ResetPasswordFormData,
	resetPasswordSchema,
} from "@/lib/validations/auth";

export default function ResetPasswordForm({ token }: { token: string }) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const form = useForm<ResetPasswordFormData>({
		resolver: zodResolver(resetPasswordSchema),
		defaultValues: { token, password: "", confirmPassword: "" },
	});

	async function onSubmit(data: ResetPasswordFormData) {
		await authClient.resetPassword({
			token: data.token,
			newPassword: data.password,
			fetchOptions: {
				onRequest: () => setIsLoading(true),
				onResponse: () => setIsLoading(false),
				onError: (ctx) => {
					toast.custom(() => (
						<ErrorToast
							message={
								ctx.error?.message ||
								"Failed to reset password. The link may have expired."
							}
						/>
					));
				},
				onSuccess: async () => {
					toast.custom(() => (
						<SuccessToast message="Password reset successfully." />
					));
					router.push("/login");
				},
			},
		});
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<FormField
					control={form.control}
					name="password"
					render={({ field }) => (
						<FormItem>
							<FormLabel>New Password</FormLabel>
							<FormControl>
								<div className="relative">
									<Input
										placeholder="Enter your new password"
										type={showPassword ? "text" : "password"}
										autoComplete="new-password"
										{...field}
									/>
									<button
										type="button"
										className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
										onClick={() => setShowPassword((v) => !v)}
										aria-label={
											showPassword ? "Hide password" : "Show password"
										}
									>
										{showPassword ? (
											<EyeOff className="h-4 w-4" />
										) : (
											<Eye className="h-4 w-4" />
										)}
									</button>
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="confirmPassword"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Confirm New Password</FormLabel>
							<FormControl>
								<div className="relative">
									<Input
										placeholder="Confirm your new password"
										type={showConfirmPassword ? "text" : "password"}
										autoComplete="new-password"
										{...field}
									/>
									<button
										type="button"
										className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
										onClick={() => setShowConfirmPassword((v) => !v)}
										aria-label={
											showConfirmPassword ? "Hide password" : "Show password"
										}
									>
										{showConfirmPassword ? (
											<EyeOff className="h-4 w-4" />
										) : (
											<Eye className="h-4 w-4" />
										)}
									</button>
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<input type="hidden" {...form.register("token")} />

				<Button type="submit" className="w-full" disabled={isLoading}>
					{isLoading ? "Resetting..." : "Reset password"}
				</Button>
			</form>
		</Form>
	);
}
