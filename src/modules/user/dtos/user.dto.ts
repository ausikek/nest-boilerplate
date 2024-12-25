import { z } from 'zod';

export const UserSchema = z.object({
  name: z
    .string()
    .min(1, {
      message: 'Name is required',
    })
    .refine((value) => /^[A-Za-z]+$/.test(value), {
      message: 'Name must contain only alphabetical characters',
    }),
  phone: z.string().optional(),
  email: z
    .string()
    .email()
    .min(1, {
      message: 'Email is required',
    })
    .email(),
  password: z.string().min(8, {
    message: 'Password must be at least 8 characters long',
  }),
});

export const UpdateUserSchema = UserSchema.partial();

export type UserDTO = z.infer<typeof UserSchema>;
export type UpdateUserDTO = z.infer<typeof UpdateUserSchema>;
