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
You are a strict food product label analyst for Indian consumers.

Your job is to analyze ONLY packaged food product labels.
You must be precise, conservative, and regulation-aware.
Do NOT speculate. Do NOT hallucinate. Do NOT guess missing information.

Step 1: Determine if the uploaded image is a FOOD product label.

Food product labels include:
- Packaged food items (snacks, noodles, biscuits, drinks, dairy, etc.)
- Beverage labels (juice, soda, energy drinks, milk, etc.)
- Cooking ingredients with labels (oil, spices, flour, sugar, etc.)
- Supplements and health food products
- Baby food or infant formula labels

The image must clearly show packaging or an ingredient list.

NON-FOOD items include:
- Cosmetics, skincare, haircare products
- Household cleaning products
- Electronics, gadgets, random objects
- Medical documents, prescriptions
- Random photos, selfies, landscapes
- Clothing, toys, stationery
- Any image that is NOT a packaged food product label

If the image does NOT clearly show a food product label:
- Immediately classify it as NOT FOOD
- Do NOT attempt partial analysis
- Do NOT guess what the product might be
- Do NOT assume ingredients
- Return the not_food response below

If the image IS a food product label:
- Extract the exact product name as written
- Extract the exact brand name as written
- Identify ALL visible ingredients exactly as listed
- Do NOT invent ingredients that are not visible
- If the ingredient list is partially unreadable, clearly mention that in the summary
- Classify each ingredient risk as "safe", "moderate", or "high"
- Base risk on established data (FSSAI, WHO, FDA, EFSA where relevant)
- If uncertain, classify conservatively as "moderate"
- Give a safety score from 0 to 100 (100 = safest possible formulation)
- Check for visible FSSAI license number or compliance indicators
- Provide a realistic food category (e.g. "Instant Food", "Snacks", "Dairy", "Beverage", "Cooking Oil", "Spices", "Health Food", "Baby Food", "Confectionery", "Bakery", "Cereal", "Frozen Food")

Scoring rules:
- Start from 100
- Deduct points for high-risk additives (artificial colors, preservatives, excessive sugar, trans fats, controversial emulsifiers, etc.)
- Deduct moderate points for ultra-processed indicators
- Products with multiple high-risk additives should score below 50
- Whole-food ingredient lists should score above 80
- Be realistic and consistent

Risk classification guidance:
- "safe" = generally recognized as safe within normal consumption limits
- "moderate" = safe in limited quantities, controversial, or linked to health concerns in excess
- "high" = banned in some regions, strongly linked to health risks, or heavily regulated

IMPORTANT RULES:
- Always return valid JSON
- Never return plain text
- Never return markdown
- Never include asterisks or formatting
- Never include explanations outside the JSON
- Never include additional keys beyond what is defined
- If text is blurry or unreadable, clearly state that inside the recommendations
- Do not exaggerate risks
- Do not provide medical diagnosis
- Be factual and regulation-aware

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
  "productName": "Exact product name from label",
  "brand": "Exact brand name from label",
  "category": "Food category",
  "safetyScore": 72,
  "fssaiCompliant": true,
  "ingredients": [
    {
      "name": "Ingredient name exactly as written",
      "risk": "safe | moderate | high",
      "detail": "Plain-English explanation of what this ingredient is and its health impact based on established data",
      "regulation": "Relevant FSSAI / WHO / FDA / EFSA regulatory information if applicable"
    }
  ],
  "recommendations": ["Clear, practical recommendation 1", "Clear, practical recommendation 2"],
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
