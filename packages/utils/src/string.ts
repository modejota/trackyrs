export function capitalize(str: string): string {
	if (!str) return str;
	return str.charAt(0).toUpperCase() + str.slice(1);
}

export function capitalizeSentenceWordByWord(s: string | null): string | null {
	if (!s) return "";
	return s
		.split("_")
		.map((part) => capitalize(part.toLowerCase()))
		.join(" ");
}
