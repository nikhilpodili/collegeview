/**
 * Form Validation Schemas and Utilities
 *
 * Provides Zod validation schemas for all authentication forms
 * and utilities for password strength validation and error formatting
 */

import { z } from "zod";

//Supabase Email OTP length requirement for verification 
export const EMAIL_OTP_LENGTH = 6;

// Common validation patterns
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PASSWORD_MIN_LENGTH = 8;

// List of common disposable email domains to block
export const DISPOSABLE_EMAIL_DOMAINS = [
    "10minutemail.com",
    "guerrillamail.com",
    "mailinator.com",
    "tempmail.org",
    "throwaway.email",
    "temp-mail.org",
    "telegmail.com",
    "yopmail.com",
    "maildrop.cc",
    "sharklasers.com",
    "guerrillamailblock.com",
    "pokemail.net",
    "spam4.me",
    "bccto.me",
    "chacuo.net",
    "dispostable.com",
    "emailondeck.com",
    "fakeinbox.com",
    "hide.biz.st",
    "mytrashmail.com",
    "nobulk.com",
    "sogetthis.com",
    "spamherald.com",
    "spamhole.com",
    "speed.1s.fr",
    "trashmail.at",
    "trashmail.com",
    "trashmail.me",
    "trashmail.net",
    "wegwerfmail.de",
    "wegwerfmail.net",
    "wegwerfmail.org",
];

// Password strength validation function
export function validatePasswordStrength(password: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
} {
    const feedback: string[] = [];
    let score = 0;

    // Length check
    if (password.length >= PASSWORD_MIN_LENGTH) {
        score += 1;
    } else {
        feedback.push(
            `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`,
        );
    }

    // Uppercase letter check
    if (/[A-Z]/.test(password)) {
        score += 1;
    } else {
        feedback.push("Password must contain at least one uppercase letter");
    }

    // Lowercase letter check
    if (/[a-z]/.test(password)) {
        score += 1;
    } else {
        feedback.push("Password must contain at least one lowercase letter");
    }

    // Number check
    if (/\d/.test(password)) {
        score += 1;
    } else {
        feedback.push("Password must contain at least one number");
    }

    // Special character check
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        score += 1;
    } else {
        feedback.push("Password must contain at least one special character");
    }

    // Common patterns check
    const commonPatterns = [
        /123456/,
        /password/i,
        /qwerty/i,
        /abc123/i,
        /admin/i,
        /letmein/i,
    ];

    if (commonPatterns.some((pattern) => pattern.test(password))) {
        feedback.push("Password contains common patterns and is not secure");
        score = Math.max(0, score - 2);
    }

    return {
        isValid: score >= 4,
        score,
        feedback,
    };
}

// Email validation with disposable domain checking
export function validateEmail(email: string): {
    isValid: boolean;
    feedback: string[];
} {
    const feedback: string[] = [];

    // Basic format validation
    if (!EMAIL_REGEX.test(email)) {
        feedback.push("Please enter a valid email address");
        return { isValid: false, feedback };
    }

    // Extract domain
    const domain = email.split("@")[1]?.toLowerCase();

    if (!domain) {
        feedback.push("Please enter a valid email address");
        return { isValid: false, feedback };
    }

    // Check for disposable email domains
    if (DISPOSABLE_EMAIL_DOMAINS.includes(domain)) {
        feedback.push(
            "Disposable email addresses are not allowed. Please use a permanent email address.",
        );
        return { isValid: false, feedback };
    }

    return { isValid: true, feedback: [] };
}

// Custom Zod refinements
const emailValidation = z
    .string()
    .min(1, "Email is required")
    .superRefine((email, ctx) => {
        const validation = validateEmail(email);
        if (!validation.isValid) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: validation.feedback[0] || "Invalid email address",
            });
        }
    });

const passwordValidation = z
    .string()
    .min(1, "Password is required")
    .refine((password) => {
        const validation = validatePasswordStrength(password);
        return validation.isValid;
    }, {
        message: "Password does not meet security requirements",
    });


// Validation utilities
export class ValidationUtils {
    /**
     * Format validation errors for display
     */
    static formatValidationErrors(errors: z.ZodError): Record<string, string> {
        const formattedErrors: Record<string, string> = {};

        errors.issues.forEach((error) => {
            const path = error.path.join(".");
            formattedErrors[path] = error.message;
        });

        return formattedErrors;
    }

    /**
     * Get password strength indicator
     */
    static getPasswordStrengthIndicator(password: string): {
        strength: "weak" | "fair" | "good" | "strong";
        color: string;
        percentage: number;
    } {
        const validation = validatePasswordStrength(password);
        const score = validation.score;

        if (score <= 1) {
            return { strength: "weak", color: "red", percentage: 25 };
        } else if (score <= 2) {
            return { strength: "fair", color: "orange", percentage: 50 };
        } else if (score <= 3) {
            return { strength: "good", color: "yellow", percentage: 75 };
        } else {
            return { strength: "strong", color: "green", percentage: 100 };
        }
    }

    /**
     * Validate form data against schema
     */
    static validateFormData<T>(
        schema: z.ZodSchema<T>,
        data: unknown,
    ): { success: true; data: T } | {
        success: false;
        errors: Record<string, string>;
    } {
        try {
            const validatedData = schema.parse(data);
            return { success: true, data: validatedData };
        } catch (error) {
            if (error instanceof z.ZodError) {
                return {
                    success: false,
                    errors: ValidationUtils.formatValidationErrors(error),
                };
            }
            throw error;
        }
    }

    /**
     * Check if email domain is disposable
     */
    static isDisposableEmail(email: string): boolean {
        const domain = email.split("@")[1]?.toLowerCase();
        return domain ? DISPOSABLE_EMAIL_DOMAINS.includes(domain) : false;
    }

    /**
     * Get detailed password feedback
     */
    static getPasswordFeedback(password: string): {
        isValid: boolean;
        score: number;
        feedback: string[];
        strength: "weak" | "fair" | "good" | "strong";
    } {
        const validation = validatePasswordStrength(password);
        const indicator = ValidationUtils.getPasswordStrengthIndicator(
            password,
        );

        return {
            ...validation,
            strength: indicator.strength,
        };
    }
}

// Export validation constants for use in components
export const VALIDATION_CONSTANTS = {
    PASSWORD_MIN_LENGTH,
    EMAIL_REGEX,
    DISPOSABLE_EMAIL_DOMAINS: [...DISPOSABLE_EMAIL_DOMAINS], // Create a copy to prevent mutation
} as const;




// Sign In Form Schema
export const signInSchema = z.object({
    email: emailValidation,
    password: z
        .string()
        .min(1, "Password is required"),

});

// Sign Up Form Schema
export const signUpSchema = z.object({
    email: emailValidation,
    password: passwordValidation,
    confirmPassword: z
        .string()
        .min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

// Export with alternative name for consistency
export const signUpFormSchema = signUpSchema;

// Reset Password Form Schema
export const forgotPasswordSchema = z.object({
    email: emailValidation,
});

export const NewEmailSchema = z
    .object({
        email: emailValidation,
        confirmEmail: emailValidation,
    })
    .refine((data) => data.email === data.confirmEmail, {
        message: "Emails don't match",
        path: ["confirmEmail"],
    });



// New Password Form Schema
export const newPasswordSchema = z.object({
    password: passwordValidation,
    confirmPassword: z
        .string()
        .min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

// Profile Form Schema
export const profileSchema = z.object({
    username: z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(30, "Username too long")
        .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers and underscores"),
    full_name: z
        .string()
        .min(1, "Full name is required")
        .max(50, "Full name too long"),
    bio: z
        .string()
        .max(100, "Bio too long")
        .optional()
        .or(z.literal('')),
    current_college: z
        .string()
        .max(100, "College name too long")
        .optional()
        .or(z.literal('')),
    graduation_year: z.preprocess(
        (val) => (val === "" || val === null || Number.isNaN(val) ? undefined : Number(val)),
        z.number()
            .int()
            .min(1950)
            .max(2040)
            .optional()
            .nullable()
    ),
    state: z
        .string()
        .min(1, "State is required")
        .max(100),
    city: z
        .string()
        .min(1, "City is required")
        .max(100),
    avatar_url: z
        .string()
        .url("Invalid URL")
        .optional()
        .or(z.literal('')),
    gender: z
        .string()
        .min(1, "Gender is required"),
});

// Forum Reply Form Schema
export const forumReplySchema = z.object({
    body: z
        .string()
        .min(2, "Reply must be at least 2 characters long")
        .max(1000, "Reply cannot exceed 1000 characters")
        .refine((val) => val.trim().length > 0, "Reply cannot be just whitespace"),
});

// Export schema types for TypeScript inference
export type SignInFormData = z.infer<typeof signInSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ChangeEmailFormData = z.infer<typeof NewEmailSchema>;
export type ResetPasswordFormData = z.infer<typeof newPasswordSchema>;
export type NewPasswordFormData = z.infer<typeof newPasswordSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type ForumReplyFormData = z.infer<typeof forumReplySchema>;
