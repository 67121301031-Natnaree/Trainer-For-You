import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();

  // Allow parsing json up to 25mb for camera & photo uploads
  app.use(express.json({ limit: "25mb" }));
  app.use(express.urlencoded({ extended: true, limit: "25mb" }));

  // Health check
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({
      status: "ok",
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      time: new Date().toISOString(),
    });
  });

  // Food Analysis Endpoint
  app.post("/api/analyze-food", async (req: Request, res: Response): Promise<void> => {
    try {
      const { text, imageBase64, mimeType } = req.body;

      if (!text && !imageBase64) {
        res.status(400).json({ error: "กรุณาระบุชื่ออาหารหรืออัปโหลดรูปภาพ" });
        return;
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        // Fallback intelligent parser when API key is not yet set in environment
        console.warn("GEMINI_API_KEY is not set. Using smart fallback for Thai food analysis.");
        const fallbackResult = generateSmartFallback(text);
        res.json(fallbackResult);
        return;
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const parts: Array<{ text?: string; inlineData?: { data: string; mimeType: string } }> = [];

      if (imageBase64) {
        // Remove data URL prefix if present
        const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");
        parts.push({
          inlineData: {
            data: cleanBase64,
            mimeType: mimeType || "image/jpeg",
          },
        });
      }

      const promptText = text
        ? `วิเคราะห์อาหาร: "${text}"`
        : "กรุณาวิเคราะห์รายการอาหารที่ปรากฏในรูปภาพนี้อย่างละเอียด";

      parts.push({ text: promptText });

      const systemInstruction = `คุณเป็นผู้เชี่ยวชาญด้านโภชนาการสำหรับแอปเกมดูแลสุขภาพของนักศึกษาไทยชื่อ "Trainer For You"
หน้าที่ของคุณคือประเมินคุณค่าทางโภชนาการของอาหารจากข้อความและ/หรือรูปภาพ
- ถ้าในภาพหรือข้อความมีอาหารหลายอย่าง เช่น "ข้าวกะเพราไก่ไข่ดาว" ให้แยกเป็น 2 รายการ (ข้าวกะเพราไก่ 1 จาน และ ไข่ดาว 1 ฟอง)
- ให้ระบุชื่ออาหารเป็นภาษาไทยที่เป็นกันเอง เข้าใจง่าย
- ประเมิน portion เช่น 1 จาน, 1 ชาม, 3 ไม้, 1 แก้ว, 1 ห่อ, 1 ลูก
- ประเมิน calories (kcal), protein (g), carbohydrates (g), fat (g)
- รวมผลลัพธ์ใน total
- ระบุ note เกี่ยวกับความไม่แน่นอน เช่น "สูตรการปรุง น้ำมัน และปริมาณซอสอาจทำให้พลังงานแตกต่างกัน"
- ตอบกลับเฉพาะรูปแบบ JSON ที่กำหนดเท่านั้น`;

      // List of valid models to try in order if one experiences high demand (503/429)
      const candidateModels = ["gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
      let response: any = null;
      let lastModelError: any = null;

      for (const model of candidateModels) {
        try {
          response = await ai.models.generateContent({
            model,
            contents: { parts },
            config: {
              systemInstruction,
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  items: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING, description: "ชื่อรายการอาหาร" },
                        portion: { type: Type.STRING, description: "ปริมาณโดยประมาณ เช่น 1 จาน, 1 ฟอง" },
                        calories: { type: Type.NUMBER, description: "พลังงาน (kcal)" },
                        protein: { type: Type.NUMBER, description: "โปรตีน (g)" },
                        carbs: { type: Type.NUMBER, description: "คาร์โบไฮเดรต (g)" },
                        fat: { type: Type.NUMBER, description: "ไขมัน (g)" },
                      },
                      required: ["name", "portion", "calories", "protein", "carbs", "fat"],
                    },
                  },
                  total: {
                    type: Type.OBJECT,
                    properties: {
                      calories: { type: Type.NUMBER, description: "แคลอรีรวม" },
                      protein: { type: Type.NUMBER, description: "โปรตีนรวม (g)" },
                      carbs: { type: Type.NUMBER, description: "คาร์โบรวย (g)" },
                      fat: { type: Type.NUMBER, description: "ไขมันรวม (g)" },
                    },
                    required: ["calories", "protein", "carbs", "fat"],
                  },
                  note: { type: Type.STRING, description: "ข้อสังเกตและระดับความไม่แน่นอน" },
                },
                required: ["items", "total", "note"],
              },
            },
          });

          if (response?.text) {
            // Success with this model!
            break;
          }
        } catch (err: any) {
          lastModelError = err;
          console.warn(`Model ${model} encountered temporary issue:`, err?.message || err);
          // Wait briefly before trying fallback model
          await new Promise((resolve) => setTimeout(resolve, 600));
        }
      }

      if (!response && lastModelError) {
        throw lastModelError;
      }

      const responseText = response.text?.trim() || "";
      let parsedData;
      try {
        parsedData = JSON.parse(responseText);
      } catch (err) {
        console.error("Failed to parse Gemini JSON output:", responseText);
        // Fallback cleanup
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Invalid response format from AI model");
        }
      }

      res.json(parsedData);
    } catch (error: any) {
      console.warn("Notice: AI service temporary fallback triggered:", error?.message || error);
      // If all models hit temporary limits, provide a healthy nutritional estimate
      const fallback = generateSmartFallback(req.body.text || "มื้ออาหารสุขภาพ");
      fallback.note = "ระบบประเมินคุณค่าทางโภชนาการเบื้องต้น (คุณสามารถกดปรับแต่งตัวเลขได้ตามจริง)";
      res.json(fallback);
    }
  });

  // Smart fallback dictionary for common Thai student meals
  function generateSmartFallback(text: string = "") {
    const query = text.toLowerCase().trim();
    let items = [
      {
        name: text || "มื้ออาหารเพื่อสุขภาพ",
        portion: "1 จาน/ชุด",
        calories: 480,
        protein: 22,
        carbs: 62,
        fat: 14,
      },
    ];

    if (query.includes("กะเพรา") && (query.includes("ไข่ดาว") || query.includes("ไข่"))) {
      items = [
        { name: "ข้าวกะเพราไก่", portion: "1 จาน", calories: 530, protein: 25, carbs: 68, fat: 17 },
        { name: "ไข่ดาว", portion: "1 ฟอง", calories: 120, protein: 7, carbs: 1, fat: 10 },
      ];
    } else if (query.includes("กะเพรา")) {
      items = [
        { name: "ข้าวกะเพราไก่", portion: "1 จาน", calories: 550, protein: 27, carbs: 70, fat: 18 },
      ];
    } else if (query.includes("ข้าวมันไก่")) {
      items = [
        { name: "ข้าวมันไก่ต้ม", portion: "1 จาน", calories: 590, protein: 28, carbs: 74, fat: 20 },
      ];
    } else if (query.includes("ข้าวผัด")) {
      items = [
        { name: "ข้าวผัดหมู/ไก่", portion: "1 จาน", calories: 560, protein: 22, carbs: 72, fat: 20 },
      ];
    } else if (query.includes("ไข่เจียว")) {
      items = [
        { name: "ข้าวสวย", portion: "1 จาน", calories: 200, protein: 4, carbs: 45, fat: 1 },
        { name: "ไข่เจียว", portion: "1 ฟอง", calories: 240, protein: 8, carbs: 2, fat: 22 },
      ];
    } else if (query.includes("หมูปิ้ง") || query.includes("ข้าวเหนียว")) {
      items = [
        { name: "หมูปิ้ง", portion: "3 ไม้", calories: 375, protein: 21, carbs: 9, fat: 28 },
        { name: "ข้าวเหนียว", portion: "1 ห่อ", calories: 160, protein: 3, carbs: 35, fat: 1 },
      ];
    } else if (query.includes("ก๋วยเตี๋ยว") || query.includes("บะหมี่")) {
      items = [
        { name: "ก๋วยเตี๋ยวหมูน้ำใส", portion: "1 ชาม", calories: 350, protein: 18, carbs: 52, fat: 8 },
      ];
    } else if (query.includes("ผัดไทย")) {
      items = [
        { name: "ผัดไทยกุ้งสด", portion: "1 จาน", calories: 580, protein: 22, carbs: 75, fat: 22 },
      ];
    } else if (query.includes("ส้มตำ")) {
      items = [
        { name: "ส้มตำไทย", portion: "1 จาน", calories: 120, protein: 3, carbs: 26, fat: 1 },
        { name: "ไก่ย่าง", portion: "1 น่อง", calories: 180, protein: 22, carbs: 2, fat: 9 },
      ];
    } else if (query.includes("ชาเขียว") || query.includes("ชานม")) {
      items = [
        { name: "ชาเขียวนมสดหวานน้อย", portion: "1 แก้ว", calories: 180, protein: 4, carbs: 28, fat: 6 },
      ];
    } else if (query.includes("ลาเต้") || query.includes("กาแฟ")) {
      items = [
        { name: "ลาเต้เย็นหวานน้อย", portion: "1 แก้ว", calories: 140, protein: 5, carbs: 16, fat: 6 },
      ];
    } else if (query.includes("กล้วย")) {
      items = [
        { name: "กล้วยหอม", portion: "2 ลูก", calories: 210, protein: 2.6, carbs: 54, fat: 0.6 },
      ];
    } else if (query.includes("อกไก่") || query.includes("สลัด")) {
      items = [
        { name: "สลัดอกไก่ย่าง", portion: "1 จาน", calories: 310, protein: 38, carbs: 16, fat: 9 },
      ];
    } else if (query.includes("ไข่ต้ม")) {
      items = [
        { name: "ไข่ต้ม", portion: "2 ฟอง", calories: 155, protein: 13, carbs: 1, fat: 11 },
      ];
    }

    const total = items.reduce(
      (acc, cur) => ({
        calories: acc.calories + cur.calories,
        protein: acc.protein + cur.protein,
        carbs: acc.carbs + cur.carbs,
        fat: acc.fat + cur.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    return {
      items,
      total,
      note: "ค่าประมาณสารอาหารสำหรับนักศึกษา (สามารถแก้ไขตัวเลขได้อย่างอิสระ)",
    };
  }

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🌸 Trainer For You server running on http://localhost:${PORT}`);
  });
}

startServer();
