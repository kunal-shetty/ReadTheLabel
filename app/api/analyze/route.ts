"use server"

import { NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"

const apiKey = process.env.GEMINI_API_KEY || ""
const ai = new GoogleGenAI({ apiKey })

export async function POST(req: Request) {
    try {
        if (!apiKey) {
            return NextResponse.json({ error: "Gemini API key missing" }, { status: 500 })
        }

        const formData = await req.formData()
        const file = formData.get("file") as File | null

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 })
        }

        const bytes = await file.arrayBuffer()
        const base64 = Buffer.from(bytes).toString("base64")

        const prompt = `
You are a food product label analyst for Indian consumers.

Step 1: Determine if the uploaded image is a FOOD product label.
Food product labels include:
- Packaged food items (snacks, noodles, biscuits, drinks, dairy, etc.)
- Beverage labels (juice, soda, energy drinks, milk, etc.)
- Cooking ingredients with labels (oil, spices, flour, sugar, etc.)
- Supplements and health food products
- Baby food or infant formula labels

NON-FOOD items include:
- Cosmetics, skincare, haircare products
- Household cleaning products
- Electronics, gadgets, random objects
- Medical documents, prescriptions
- Random photos, selfies, landscapes
- Clothing, toys, stationery
- Any image that is NOT a food product label

If the image is NOT a food product label:
- Do NOT analyze it
- Do NOT guess
- Return the not_food response below

If the image IS a food product label:
- Extract the product name and brand
- Identify ALL ingredients listed
- Classify each ingredient risk as "safe", "moderate", or "high"
- Give a safety score from 0 to 100 (100 = safest)
- Check for FSSAI compliance indicators
- Provide a category (e.g. "Instant Food", "Snacks", "Dairy", "Beverage", "Cooking Oil", "Spices", "Health Food", "Baby Food", "Confectionery", "Bakery", "Cereal", "Frozen Food")

IMPORTANT RULES:
- Always return valid JSON
- Never return plain text or markdown
- Never include asterisks or formatting
- If text is unclear or unreadable, say so clearly in the summary
- Be factual about ingredient risks, cite real regulations

You MUST return ONE of the following JSON responses:

NON-FOOD ITEM RESPONSE:
{
  "type": "not_food",
  "message": "This does not appear to be a food product label. Only food items are allowed. Please upload a photo of a packaged food product label.",
  "disclaimer": "This tool only works with food product labels."
}

FOOD PRODUCT ANALYSIS RESPONSE:
{
  "type": "analysis",
  "productName": "Name of the product",
  "brand": "Brand name",
  "category": "Food category",
  "safetyScore": 72,
  "fssaiCompliant": true,
  "ingredients": [
    {
      "name": "Ingredient name",
      "risk": "safe | moderate | high",
      "detail": "Plain-English explanation of what this ingredient is and its health impact",
      "regulation": "Relevant FSSAI / WHO / FDA regulation info"
    }
  ],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "disclaimer": "This analysis is AI-generated and for informational purposes only. Always consult a nutritionist or healthcare professional for specific dietary concerns."
}
`

        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                {
                    role: "user",
                    parts: [
                        { text: prompt },
                        {
                            inlineData: {
                                data: base64,
                                mimeType: file.type,
                            },
                        },
                    ],
                },
            ],
            config: {
                temperature: 0.3,
                responseMimeType: "application/json",
            },
        })

        const text = result.text
        if (!text) {
            throw new Error("Empty Gemini response")
        }

        const parsed = JSON.parse(text)

        if (parsed.type === "not_food") {
            return NextResponse.json({
                type: "not_food",
                error: {
                    message: parsed.message,
                    disclaimer: parsed.disclaimer,
                },
            })
        }

        console.info(parsed)
        return NextResponse.json({
            type: "analysis",
            analysis: parsed,
        })

    } catch (error) {
        console.error("[Gemini] Analysis error:", error)
        return NextResponse.json(
            { error: "Failed to analyze the label. Please try again." },
            { status: 500 }
        )
    }
}
