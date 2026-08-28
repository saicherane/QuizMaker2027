import { z } from "zod";

export const passwordSchema = z
	.string()
	.min(8, "Password must be at least 8 characters")
	.regex(/[a-zA-Z]/, "Password must contain a letter")
	.regex(/[0-9]/, "Password must contain a number");

export const registerSchema = z
	.object({
		username: z
			.string()
			.min(3, "Username must be at least 3 characters")
			.max(30, "Username must be at most 30 characters")
			.regex(/^[a-zA-Z0-9_-]+$/, "Username contains invalid characters"),
		emailId: z.string().email("Invalid email address"),
		password: passwordSchema,
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export const loginSchema = z.object({
	emailId: z.string().email("Invalid email address"),
	password: z.string().min(1, "Password is required"),
});

export const updateUserSchema = z
	.object({
		username: z
			.string()
			.min(3, "Username must be at least 3 characters")
			.max(30, "Username must be at most 30 characters")
			.regex(/^[a-zA-Z0-9_-]+$/, "Username contains invalid characters")
			.optional(),
		emailId: z.string().email("Invalid email address").optional(),
		currentPassword: z.string().optional(),
		newPassword: passwordSchema.optional(),
		confirmPassword: z.string().optional(),
	})
	.refine(
		(data) => {
			if (!data.newPassword) {
				return true;
			}
			return Boolean(data.currentPassword);
		},
		{
			message: "Current password is required to change password",
			path: ["currentPassword"],
		},
	)
	.refine(
		(data) => {
			if (!data.newPassword) {
				return true;
			}
			return data.newPassword === data.confirmPassword;
		},
		{
			message: "Passwords do not match",
			path: ["confirmPassword"],
		},
	);

export const deleteUserSchema = z.object({
	password: z.string().min(1, "Password is required"),
	confirmDelete: z.literal("DELETE", {
		message: 'Type "DELETE" to confirm account deletion',
	}),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type DeleteUserInput = z.infer<typeof deleteUserSchema>;
