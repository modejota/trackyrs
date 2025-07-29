"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@trackyrs/ui/components/button";
import { Calendar } from "@trackyrs/ui/components/calendar";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@trackyrs/ui/components/form";
import { Input } from "@trackyrs/ui/components/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@trackyrs/ui/components/popover";
import { ErrorToast } from "@trackyrs/ui/components/toasts/error-toast";
import { SuccessToast } from "@trackyrs/ui/components/toasts/success-toast";
import { cn } from "@trackyrs/ui/lib/utils";
import { capitalize } from "@trackyrs/utils/src/string";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { type RegisterFormData, registerSchema } from "@/lib/validations/auth";

const minDate = new Date(1900, 0, 1);
const maxDate = new Date();

export function RegisterForm() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	const form = useForm<RegisterFormData>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			name: "",
			email: "",
			username: "",
			password: "",
			confirmPassword: "",
			birthdate: undefined,
		},
	});

	async function onSubmit(data: RegisterFormData) {
		await authClient.signUp.email({
			name: "",
			email: data.email,
			username: data.username,
			password: data.password,
			birthdate: data.birthdate,
			callbackURL: "/",
			fetchOptions: {
				onRequest: () => setIsLoading(true),
				onResponse: () => setIsLoading(false),
				onError: (ctx) => {
					toast.custom(() => {
						const message = ctx.error?.message
							? `${ctx.error.message
									.split(".")
									.map((part) => part.trim())
									.map((part) => capitalize(part))
									.join(". ")}`
							: "Unexpected error. Please, try again later.";

						return <ErrorToast message={message} />;
					});
				},
				onSuccess: async () => {
					toast.custom(() => (
						<SuccessToast message="Account created successfully!" />
					));
					router.push("/");
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

				<FormField
					control={form.control}
					name="username"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Username</FormLabel>
							<FormControl>
								<Input
									placeholder="Choose a username"
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
									placeholder="Create a password"
									type="password"
									autoComplete="new-password"
									{...field}
								/>
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
							<FormLabel>Confirm Password</FormLabel>
							<FormControl>
								<Input
									placeholder="Confirm your password"
									type="password"
									autoComplete="new-password"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="birthdate"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Birthdate</FormLabel>
							<Popover>
								<PopoverTrigger asChild>
									<FormControl>
										<Button
											variant="outline"
											type="button"
											className={cn(
												"w-full justify-start text-left font-normal",
												!field.value && "text-muted-foreground",
											)}
											disabled={isLoading}
										>
											{field.value
												? format(field.value, "PPP")
												: "Select your birthdate"}
										</Button>
									</FormControl>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0" align="start">
									<Calendar
										mode="single"
										selected={field.value}
										onSelect={(date) => {
											if (date) {
												const normalizedDate = new Date(
													Date.UTC(
														date.getFullYear(),
														date.getMonth(),
														date.getDate(),
														0,
														0,
														0,
													),
												);
												field.onChange(normalizedDate);
											} else {
												field.onChange(date);
											}
										}}
										disabled={(date) => date > maxDate || date < minDate}
										autoFocus
										captionLayout="dropdown"
									/>
								</PopoverContent>
							</Popover>
							<div className="text-muted-foreground text-xs">
								Your birthdate won't be shared with other users
							</div>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button type="submit" className="w-full" disabled={isLoading}>
					{isLoading ? "Creating account..." : "Create account"}
				</Button>
			</form>
		</Form>
	);
}
