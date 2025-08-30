export type EmailUser = {
	email: string;
	username: string;
};

export type ResetPasswordProps = {
	user: EmailUser;
	url: string;
	token: string;
};
