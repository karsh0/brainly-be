
import express from "express";
import mongoose from "mongoose";
import {z} from "zod";
import bcrypt from "bcrypt" 
import jwt from "jsonwebtoken";
import { contentModel, LinkModel, userModel } from "./db";
import { JWT_PASSWORD } from "./config";
import { userMiddleware } from "./middleware";
import { contentSchema, userSchema } from "./zod";
import cors from "cors"
import { random } from "./utils";

const app = express();
app.use(express.json());
app.use(cors())

app.get("/api/v1/", (req,res)=>{
    res.send("Backend is hosted!")
})

app.post("/api/v1/signup", async (req, res) => {
    // TODO: zod validation , hash the password

    try {
        const validatedData = userSchema.parse(req.body);
        const { username, password } = validatedData;
        const hashedPassword = await bcrypt.hash(password, 2);
        await userModel.create({
            username: username,
            password: hashedPassword
        }) 

        res.json({
            message: "User signed up"
        })
    } catch(e) {
        res.status(411).json({
            message: "User already exists",
            error: e
        })
    }
    
})

app.post("/api/v1/signin", async (req, res) => {
    const validatedData = userSchema.parse(req.body);
    const { username, password } = validatedData;


    const existingUser = await userModel.findOne({ username });
    if (existingUser) {
    const passwordMatch = await bcrypt.compare(password, existingUser.password)
        if(passwordMatch){
        const token = jwt.sign({
            id: existingUser._id
        }, JWT_PASSWORD)

        res.json({
            token
        })
    }
    } else {
        res.status(403).json({
            message: "Incorrrect credentials"
        })
    }
})

app.post("/api/v1/content", userMiddleware, async (req, res) => {
    const validatedData = contentSchema.parse(req.body);
    const { title, link, type, content, tags} = validatedData;

    await contentModel.create({
        title,
        link,
        type,
        content,
        tags,
        //@ts-ignore
        userId: req.userId,
    })
    res.json({
        message: "Content added"
    })
    
})

app.get("/api/v1/content", userMiddleware, async (req, res) => {
    try {
        // @ts-ignore
        const userId = req.userId;
        const content = await contentModel.find({ userId }).populate('userId', 'username');
        
        res.status(200).json({
            content
        });
    } catch (error: any) {
        res.status(500).json({
            message: 'Failed to fetch content',
        });
    }
});

app.delete("/api/v1/content", userMiddleware, async (req, res) => {
    const link = req.body.link;

    await contentModel.deleteOne({
        link,
    })

    res.json({
        message: "Deleted"
    })
})

app.post("/api/v1/brain/share",userMiddleware,async (req, res) => {
    const {share} = req.body;
    if(share){
        const existingLink = await LinkModel.findOne({
            userId: req.userId
        })
        if(existingLink){
            res.json({
                hash: existingLink.hash
            })
            return
        }
        const hash = random(10)
        await LinkModel.create({
            userId: req.userId,
            hash: hash
        })
        res.json({
            message:"/share/"+ hash
        })
    }else{
        await LinkModel.deleteOne({
            userId: req.userId
        })
        res.json({
            message:"Removed sharable link"
        })
    }
  
})

app.get("/api/v1/brain/:shareLink", async (req, res) => {
    const hash = req.params.shareLink;

    const link = await LinkModel.findOne({
        hash
    })

    if(!link){
        res.status(411).json({
            message:"sorry incorrect input"
        })
        return;
    }

    //userId
    const content = await contentModel.find({
        userId: link.userId
    })
    const user = await userModel.findOne({
        userId: link.userId
    })
    res.json({
        username: user?.username,
        content: content
    })
})

app.listen(3000);