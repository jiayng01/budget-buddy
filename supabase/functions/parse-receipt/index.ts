import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST")
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  try {
    const { imageBase64, mimeType } = await req.json();
    if (!imageBase64 || typeof imageBase64 !== "string")
      return new Response(
        JSON.stringify({ error: "imageBase64 is required" }),
        {
          status: 400,
          headers: { ...cors, "Content-Type": "application/json" },
        },
      );
    if (imageBase64.length > 12_000_000)
      return new Response(
        JSON.stringify({
          error: "Image is too large. Choose a smaller photo.",
        }),
        {
          status: 413,
          headers: { ...cors, "Content-Type": "application/json" },
        },
      );
    const key = Deno.env.get("GEMINI_API_KEY");
    if (!key)
      return new Response(
        JSON.stringify({
          error: "GEMINI_API_KEY is not configured on the Edge Function",
        }),
        {
          status: 500,
          headers: { ...cors, "Content-Type": "application/json" },
        },
      );
    const prompt = `Extract the main transaction from this receipt. Return ONLY valid JSON with keys merchant (string), amount (number, total charged in SGD), date (YYYY-MM-DD or null), category (one of Food & Drink, Groceries, Transport, Shopping, Entertainment, Travel, Healthcare, Utilities, Education, Fees, Taxes, Subscriptions, Others, Unknown), gst_amount (number or 0), notes (string or empty). Use the final payable total, not subtotal. If uncertain, use null/Unknown rather than inventing details. This is financial data: do not return card numbers or personal identifiers.`;
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: mimeType || "image/jpeg",
                    data: imageBase64,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                merchant: { type: "STRING" },
                amount: { type: "NUMBER", nullable: true },
                date: { type: "STRING", nullable: true },
                category: { type: "STRING" },
                gst_amount: { type: "NUMBER" },
                notes: { type: "STRING" },
              },
              required: ["merchant", "category", "gst_amount", "notes"],
            },
          },
        }),
      },
    );
    const result = await response.json();
    if (!response.ok)
      return new Response(
        JSON.stringify({
          error: result?.error?.message || "Gemini request failed",
        }),
        {
          status: 502,
          headers: { ...cors, "Content-Type": "application/json" },
        },
      );
    const raw = result?.candidates?.[0]?.content?.parts
      ?.map((p: any) => p.text || "")
      .join("");
    if (!raw)
      return new Response(
        JSON.stringify({ error: "No receipt details were returned" }),
        {
          status: 422,
          headers: { ...cors, "Content-Type": "application/json" },
        },
      );
    const transaction = JSON.parse(raw);
    if (typeof transaction.amount === "number" && transaction.amount <= 0)
      transaction.amount = null;
    return new Response(JSON.stringify({ transaction }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Unexpected parser error",
      }),
      { status: 500, headers: { ...cors, "Content-Type": "application/json" } },
    );
  }
});
