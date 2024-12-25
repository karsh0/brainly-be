"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.contentModel = exports.LinkModel = exports.userModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
require('dotenv').config();
mongoose_1.default.connect(process.env.MONGO_URI || "");
const userSchema = new mongoose_1.Schema({
    username: { type: String, unique: true },
    password: { type: String, required: true }
});
exports.userModel = mongoose_1.default.model("User", userSchema);
const contentSchema = new mongoose_1.Schema({
    link: String,
    type: String,
    title: String,
    content: String,
    tags: [{ type: String, ref: "Tag" }],
    userId: { type: mongoose_1.Schema.ObjectId, ref: "User", required: true }
});
const LinkSchema = new mongoose_1.Schema({
    hash: String,
    userId: { type: mongoose_1.Schema.ObjectId, ref: "User", required: true, unique: true }
});
exports.LinkModel = mongoose_1.default.model("Links", LinkSchema);
exports.contentModel = mongoose_1.default.model("Content", contentSchema);
