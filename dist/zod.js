"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contentSchema = exports.userSchema = void 0;
const zod_1 = require("zod");
exports.userSchema = zod_1.z.object({
    username: zod_1.z.string().min(3),
    password: zod_1.z.string().min(6, "Password must contain minimun 6 character")
});
exports.contentSchema = zod_1.z.object({
    title: zod_1.z.string(),
    content: zod_1.z.string(),
    type: zod_1.z.string(),
    link: zod_1.z.string(),
    tags: zod_1.z.any()
});
