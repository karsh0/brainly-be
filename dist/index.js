"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("./db");
const config_1 = require("./config");
const middleware_1 = require("./middleware");
const zod_1 = require("./zod");
const cors_1 = __importDefault(require("cors"));
const utils_1 = require("./utils");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.get("/api/v1/", (req, res) => {
    res.send("Backend is hosted!");
});
app.post("/api/v1/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // TODO: zod validation , hash the password
    try {
        const validatedData = zod_1.userSchema.parse(req.body);
        const { username, password } = validatedData;
        const hashedPassword = yield bcrypt_1.default.hash(password, 2);
        yield db_1.userModel.create({
            username: username,
            password: hashedPassword
        });
        res.json({
            message: "User signed up"
        });
    }
    catch (e) {
        res.status(411).json({
            message: "User already exists",
            error: e
        });
    }
}));
app.post("/api/v1/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const validatedData = zod_1.userSchema.parse(req.body);
    const { username, password } = validatedData;
    const existingUser = yield db_1.userModel.findOne({ username });
    if (existingUser) {
        const passwordMatch = yield bcrypt_1.default.compare(password, existingUser.password);
        if (passwordMatch) {
            const token = jsonwebtoken_1.default.sign({
                id: existingUser._id
            }, config_1.JWT_PASSWORD);
            res.json({
                token
            });
        }
    }
    else {
        res.status(403).json({
            message: "Incorrrect credentials"
        });
    }
}));
app.post("/api/v1/content", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const validatedData = zod_1.contentSchema.parse(req.body);
    const { title, link, type, content, tags } = validatedData;
    yield db_1.contentModel.create({
        title,
        link,
        type,
        content,
        tags,
        //@ts-ignore
        userId: req.userId,
    });
    res.json({
        message: "Content added"
    });
}));
app.get("/api/v1/content", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // @ts-ignore
        const userId = req.userId;
        const content = yield db_1.contentModel.find({ userId }).populate('userId', 'username');
        res.status(200).json({
            content
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Failed to fetch content',
        });
    }
}));
app.delete("/api/v1/content", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const link = req.body.link;
    yield db_1.contentModel.deleteOne({
        link,
    });
    res.json({
        message: "Deleted"
    });
}));
app.post("/api/v1/brain/share", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { share } = req.body;
    if (share) {
        const existingLink = yield db_1.LinkModel.findOne({
            userId: req.userId
        });
        if (existingLink) {
            res.json({
                hash: existingLink.hash
            });
            return;
        }
        const hash = (0, utils_1.random)(10);
        yield db_1.LinkModel.create({
            userId: req.userId,
            hash: hash
        });
        res.json({
            message: "/share/" + hash
        });
    }
    else {
        yield db_1.LinkModel.deleteOne({
            userId: req.userId
        });
        res.json({
            message: "Removed sharable link"
        });
    }
}));
app.get("/api/v1/brain/:shareLink", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const hash = req.params.shareLink;
    const link = yield db_1.LinkModel.findOne({
        hash
    });
    if (!link) {
        res.status(411).json({
            message: "sorry incorrect input"
        });
        return;
    }
    //userId
    const content = yield db_1.contentModel.find({
        userId: link.userId
    });
    const user = yield db_1.userModel.findOne({
        userId: link.userId
    });
    res.json({
        username: user === null || user === void 0 ? void 0 : user.username,
        content: content
    });
}));
app.listen(3000);
