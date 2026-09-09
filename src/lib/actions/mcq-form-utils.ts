export function parseMcqFormData(formData: FormData): {
	name: string;
	question: string;
	choices: { label: string; isCorrect: boolean }[];
} {
	const name = String(formData.get("name") ?? "");
	const question = String(formData.get("question") ?? "");
	const correctChoiceIndex = Number(formData.get("correctChoiceIndex"));

	const choices: { label: string; isCorrect: boolean }[] = [];
	let index = 0;

	while (formData.has(`choiceLabel_${index}`)) {
		choices.push({
			label: String(formData.get(`choiceLabel_${index}`) ?? ""),
			isCorrect: index === correctChoiceIndex,
		});
		index += 1;
	}

	return { name, question, choices };
}
