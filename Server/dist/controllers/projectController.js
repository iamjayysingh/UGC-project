import * as Sentry from "@sentry/node";
import { prisma } from "../configs/prisma.js";
import { v2 as cloudinary } from "cloudinary";
import { HarmBlockThreshold, HarmCategory, } from "@google/genai";
import fs from "fs";
import path from "path";
import ai from "../configs/ai.js";
import axios from "axios";
const loadImage = (path, mimeType) => {
    return {
        inlineData: {
            data: fs.readFileSync(path).toString("base64"),
            mimeType,
        },
    };
};
export const createProject = async (req, res) => {
    let tempProjectId;
    const { userId } = req.auth();
    let isCreditDeducted = false;
    const { name = "New Project", aspectRatio, userPrompt, productName, productDescription, targetLength = 5, } = req.body;
    const images = req.files;
    if (images.length < 2 || !productName) {
        return res.status(400).json({ message: "Please upload at least 2 images" });
    }
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });
    if (!user || user.credits < 5) {
        return res.status(401).json({ message: "Insufficient credits" });
    }
    else {
        // deduct credits for generations
        await prisma.user
            .update({
            where: { id: userId },
            data: { credits: { decrement: 5 } },
        })
            .then(() => {
            isCreditDeducted = true;
        });
    }
    try {
        let uploadedImages = await Promise.all(images.map(async (item) => {
            let result = await cloudinary.uploader.upload(item.path, {
                resource_type: "image",
            });
            return result.secure_url;
        }));
        const project = await prisma.project.create({
            data: {
                name,
                userId,
                productName,
                productDescription,
                userPrompt,
                aspectRatio,
                targetLength: parseInt(targetLength),
                uploadedImages,
                isGenerating: true,
            },
        });
        tempProjectId = project.id;
        const imageGenerationModels = [
            process.env.GEMINI_IMAGE_MODEL?.trim(),
            "gemini-2.5-flash-image-preview",
            "gemini-2.0-flash-preview-image-generation",
            "gemini-3-pro-image-preview",
        ].filter(Boolean);
        const generationConfig = {
            maxOutputTokens: 32768,
            temperature: 1,
            topP: 0.95,
            responseModalities: ["IMAGE"],
            imageConfig: {
                aspectRatio: aspectRatio || "9:16",
                imageSize: "1K",
            },
            safetySettings: [
                {
                    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                    threshold: HarmBlockThreshold.OFF,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                    threshold: HarmBlockThreshold.OFF,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                    threshold: HarmBlockThreshold.OFF,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                    threshold: HarmBlockThreshold.OFF,
                },
            ],
        };
        // image to base64 structure for ai
        const img1base64 = loadImage(images[0].path, images[0].mimetype);
        const img2base64 = loadImage(images[1].path, images[1].mimetype);
        const prompt = {
            text: `
Create a photorealistic, high-end studio photograph by seamlessly integrating the person and the product into a single, cohesive scene.
The person must interact with the product naturally (holding or using it) with anatomically correct hands and posture.
Match camera angle, focal length, scale, perspective, lighting direction, and shadow fall so both elements appear captured in the same shot.
Use professional studio lighting (softbox-style) with realistic highlights and soft, grounded shadows.
Ensure sharp focus, natural skin texture, accurate colors, and realistic surface materials.
Use a clean, minimal studio background with no distractions.
The final output should resemble a premium e-commerce product image suitable for a brand website or marketplace.

Additional user instructions:
${userPrompt}
`,
        };
        // generate the image using the first available model
        let response = null;
        let lastModelError = null;
        for (const model of imageGenerationModels) {
            try {
                response = await ai.models.generateContent({
                    model,
                    contents: [img1base64, img2base64, prompt],
                    config: generationConfig,
                });
                break;
            }
            catch (err) {
                lastModelError = err;
            }
        }
        if (!response) {
            throw new Error(lastModelError?.message ||
                "No valid Gemini image generation model is available for this API key");
        }
        //check if the reponse is valid
        if (!response?.candidates?.[0]?.content?.parts) {
            throw new Error("Unexpected response");
        }
        const parts = response.candidates[0].content.parts;
        let finalBuffer = null;
        for (const part of parts) {
            if (part.inlineData) {
                finalBuffer = Buffer.from(part.inlineData.data, "base64");
            }
        }
        if (!finalBuffer) {
            throw new Error("Failed to generate image");
        }
        const base64Image = `data:image/png;base64,${finalBuffer.toString("base64")}`;
        const uploadResult = await cloudinary.uploader.upload(base64Image, {
            resource_type: "image",
        });
        await prisma.project.update({
            where: { id: tempProjectId },
            data: {
                generatedImage: uploadResult.secure_url,
                isGenerating: false,
            },
        });
        res.json({ projectId: project.id });
    }
    catch (error) {
        if (tempProjectId) {
            // update project status and error message
            await prisma.project.update({
                where: { id: tempProjectId },
                data: {
                    isGenerating: false,
                    error: error.message,
                },
            });
        }
        if (isCreditDeducted) {
            // refund credits in case of error
            await prisma.user.update({
                where: { id: userId },
                data: {
                    credits: { increment: 5 },
                },
            });
        }
        Sentry.captureException(error);
        res.status(500).json({ message: error.message });
    }
};
export const createVideo = async (req, res) => {
    const { userId } = req.auth();
    const { projectId } = req.body;
    let isCreditDeducted = false;
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });
    if (!user || user.credits < 10) {
        return res.status(401).json({ message: "Insufficient credits" });
    }
    // deduct credits for generations
    await prisma.user
        .update({
        where: { id: userId },
        data: {
            credits: { decrement: 10 },
        },
    })
        .then(() => {
        isCreditDeducted = true;
    });
    try {
        const project = await prisma.project.findUnique({
            where: { id: projectId, userId },
            include: { user: true },
        });
        if (!project || project.isGenerating) {
            return res
                .status(400)
                .json({ message: "Project is not ready or is generating" });
        }
        if (project.generatedVideo) {
            return res.json({ message: "Video already generated" });
        }
        await prisma.project.update({
            where: { id: projectId },
            data: { isGenerating: true },
        });
        const prompt = `make the person in the image use the product: ${project.productName} ${project.productDescription && ", " + project.productDescription}. The video should be showcasing the product in a natural and engaging manner. Ensure the video has smooth transitions, good lighting, and highlights the key features of the product effectively. The setting should be appropriate for the product type, creating an appealing visual narrative that captures the viewer's attention.`;
        const model = "veo-3.1-generate-preview";
        if (!project.generatedImage) {
            throw new Error("Generated image not found");
        }
        const image = await axios.get(project.generatedImage, {
            responseType: "arraybuffer",
        });
        const imageBytes = Buffer.from(image.data);
        let operation = await ai.models.generateVideos({
            model,
            prompt,
            image: {
                imageBytes: imageBytes.toString("base64"),
                mimeType: "image/png",
            },
            config: {
                aspectRatio: project?.aspectRatio || "9:16",
                numberOfVideos: 1,
                resolution: "720p",
            },
        });
        while (!operation.done) {
            console.log("waiting for video generation to complete...");
            await new Promise((resolve) => setTimeout(resolve, 10000));
            operation = await ai.operations.getVideosOperation({
                operation: operation,
            });
        }
        const filename = `${userId}-${Date.now()}.mp4`;
        const filePath = path.join("videos", filename);
        //create videos directory if not exists
        fs.mkdirSync("videos", { recursive: true });
        if (!operation.response.generatedVideos) {
            throw new Error(operation.response.raiMediaFilteredReasons[0]);
        }
        //download the video
        await ai.files.download({
            file: operation.response.generatedVideos[0].video,
            downloadPath: filePath,
        });
        // upload video to cloudinary
        const uploadResult = await cloudinary.uploader.upload(filePath, {
            resource_type: "video",
        });
        await prisma.project.update({
            where: { id: projectId },
            data: {
                generatedVideo: uploadResult.secure_url,
                isGenerating: false,
            },
        });
        // delete the local video file
        fs.unlinkSync(filePath);
        res.json({
            message: "Video generated successfully",
            videoUrl: uploadResult.secure_url,
        });
    }
    catch (error) {
        // update project status and error message
        await prisma.project.update({
            where: { id: projectId, userId },
            data: {
                isGenerating: false,
                error: error.message,
            },
        });
        if (isCreditDeducted) {
            // refund credits in case of error
            await prisma.user.update({
                where: { id: userId },
                data: {
                    credits: { increment: 10 },
                },
            });
        }
        Sentry.captureException(error);
        res.status(500).json({ message: error.message });
    }
};
export const getAllPublishedProjects = async (req, res) => {
    try {
        const projects = await prisma.project.findMany({
            where: { isPublished: true },
        });
        res.json(projects);
    }
    catch (error) {
        Sentry.captureException(error);
        res.status(500).json({ message: error.message });
    }
};
export const deleteProjects = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { projectId } = req.params;
        const project = await prisma.project.findUnique({
            //added projectId as string by my self because of typescript error, please check if it is correct
            where: { id: projectId, userId },
        });
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        await prisma.project.delete({
            //added projectId as string by my self because of typescript error, please check if it is correct
            where: { id: projectId },
        });
        res.json({ message: "Project deleted successfully" });
    }
    catch (error) {
        Sentry.captureException(error);
        res.status(500).json({ message: error.message });
    }
};
