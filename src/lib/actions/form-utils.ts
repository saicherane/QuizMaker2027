export function formDataToRecord(formData: FormData): Record<string, string> {
	const record: Record<string, string> = {};
	for (const [key, value] of formData.entries()) {
		if (typeof value === "string") {
			record[key] = value;
		}
	}
	return record;
}

export function flattenZodErrors(error: {
	flatten: () => { fieldErrors: Record<string, string[] | undefined> };
}): Record<string, string[] | undefined> {
	return error.flatten().fieldErrors;
}
