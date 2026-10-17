# Receipt parsing Edge Function

1. Install Supabase CLI and link this project.
2. Set the secret: `supabase secrets set GEMINI_API_KEY=your_key`
3. Deploy: `supabase functions deploy parse-receipt`
4. In Supabase Function settings, require a valid JWT for authenticated users.
5. The mobile app calls `supabase.functions.invoke("parse-receipt", ...)`.

The Gemini key is server-side only. This function does not store the image or transaction. The client must review the parsed draft before saving. The prompt/model may be adjusted to match current Gemini free-tier model availability.
