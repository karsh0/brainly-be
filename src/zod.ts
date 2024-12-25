import { string, z } from "zod";

export const userSchema = z.object({
    username: z.string().min(3),
    password: z.string().min(6, "Password must contain minimun 6 character")
})

export const contentSchema = z.object({
    title: z.string(),
    content: z.string(),
    type: z.string(),
    link: z.string(),
    tags: z.any()
})