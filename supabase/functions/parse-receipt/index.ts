import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const GEMINI_MODEL = "gemini-3.5-flash-lite";
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/interactions";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

const transactionSchema = {
  type: "object",
  properties: {
    merchant: {
      type: "string",
      description: "Merchant or business name shown on the receipt.",
    },
    amount: {
      type: "number",
      description: "Final total paid, as a positive number.",
    },
    date: {
      type: "string",
      description: "Transaction date in YYYY-MM-DD format.",
    },
    category: {
      type: "string",
      description:
        "Best-fit expense category, such as Food & Dining, Groceries, Transport, Shopping, Bills, Healthcare, Entertainment, or Other.",
    },
    gst_amount: {
      type: ["number", "null"],
      description:
        "GST amount explicitly shown on the receipt, or null if unavailable.",
    },
    notes: {
      type: "string",
      description:
        "Short useful note, or an empty string if there is none.",
    },
  },
  required: [
    "merchant",
    "amount",
    "date",
    "category",
    "gst_amount",
    "notes",
  ],
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  try {
    const apiKey = Deno.env.get("GEMINI_API_KEY");

    if (!apiKey) {
      console.error("GEMINI_API_KEY is not configured.");
      return jsonResponse(
        { error: "Receipt parsing is not configured on the server." },
        500,
      );
    }

    const body = await req.json();
    const imageBase64 = body?.imageBase64;
    const mimeType = body?.mimeType;

    if (
      typeof imageBase64 !== "string" ||
      imageBase64.length === 0 ||
      typeof mimeType !== "string" ||
      !["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]
        .includes(mimeType)
    ) {
      return jsonResponse(
        {
          error:
            "A valid imageBase64 and supported image mimeType are required.",
        },
        400,
      );
    }

    // Reject excessively large encoded images before sending them to Gemini.
    if (imageBase64.length > 15_000_000) {
      return jsonResponse(
        { error: "Image is too large. Please use a smaller receipt image." },
        413,
      );
    }

    const prompt = `
Extract transaction details from this receipt for a personal expense tracker.

Rules:
- Extract the final amount actually paid, including applicable tax.
- Do not mistake subtotal, change, cash tendered, or a card limit for the final amount.
- Use the receipt's transaction date in YYYY-MM-DD format.
- Do not invent missing information.
- If the merchant is unclear, return an empty string.
- If the date is unclear, return an empty string.
- If the total cannot be determined reliably, return 0.
- Return GST only when it is explicitly shown; otherwise return null.
- Choose the closest expense category from the provided examples, or Other.
- Keep notes brief. Do not include payment card numbers or other sensitive details.
`;

    const geminiResponse = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "x-goog-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GEMINI_MODEL,
        store: false,
        input: [
          {
            type: "text",
            text: prompt,
          },
          {
            type: "image",
            data: imageBase64,
            mime_type: mimeType,
          },
        ],
        response_format: {
          type: "text",
          mime_type: "application/json",
          schema: transactionSchema,
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error(
        "Gemini API error:",
        geminiResponse.status,
        errorText.slice(0, 1000),
      );

      return jsonResponse(
        { error: "Gemini could not process the receipt. Please try again." },
        502,
      );
    }

    const result = await geminiResponse.json();

    // Extract text from the final model-output step in the Interactions response.
    const outputSteps = (result.steps ?? []).filter(
      (step: { type?: string }) => step.type === "model_output",
    );

    const lastOutput = outputSteps[outputSteps.length - 1];

    const outputText = (lastOutput?.content ?? [])
      .filter((part: { type?: string }) => part.type === "text")
      .map((part: { text?: string }) => part.text ?? "")
      .join("")
      .trim();

    if (!outputText) {
      console.error("Gemini returned no text output.");
      return jsonResponse(
        { error: "No transaction details could be extracted." },
        502,
      );
    }

    let transaction: Record<string, unknown>;

    try {
      transaction = JSON.parse(outputText);
    } catch {
      console.error("Gemini returned invalid JSON.");
      return jsonResponse(
        { error: "Receipt details could not be parsed. Please try again." },
        502,
      );
    }

    // Basic validation before returning data to the app.
    if (
      typeof transaction.merchant !== "string" ||
      typeof transaction.amount !== "number" ||
      !Number.isFinite(transaction.amount) ||
      transaction.amount < 0 ||
      typeof transaction.date !== "string" ||
      typeof transaction.category !== "string" ||
      !(
        transaction.gst_amount === null ||
        (
          typeof transaction.gst_amount === "number" &&
          Number.isFinite(transaction.gst_amount) &&
          transaction.gst_amount >= 0
        )
      ) ||
      typeof transaction.notes !== "string"
    ) {
      console.error("Gemini returned unexpected transaction fields.");
      return jsonResponse(
        { error: "Receipt details were incomplete or invalid." },
        502,
      );
    }

    return jsonResponse({ transaction });
  } catch (error) {
    console.error(
      "Receipt parsing failed:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return jsonResponse(
      { error: "An unexpected error occurred while parsing the receipt." },
      500,
    );
  }
});
