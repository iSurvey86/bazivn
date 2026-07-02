import { z } from "zod";

export const genderSchema = z.enum(["male", "female"]);

export const baziCalculateSchema = z.object({
  fullName: z.string().trim().max(100).optional(),
  birthPlace: z.string().trim().max(120).optional(),
  gender: genderSchema,
  year: z.number().int().min(1900).max(2100),
  month: z.number().int().min(1).max(12),
  day: z.number().int().min(1).max(31),
  hour: z.number().int().min(0).max(23),
  minute: z.number().int().min(0).max(59),
  second: z.number().int().min(0).max(59).default(0),
  timezone: z.string().min(1),
  save: z.boolean().optional().default(true),
});

export type BaziCalculateInput = z.infer<typeof baziCalculateSchema>;
export type Gender = z.infer<typeof genderSchema>;
