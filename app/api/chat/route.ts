
// Route disabled. Logic moved to client-side services/CopilotService.ts or direct Gemini API calls.
export async function POST(req: Request) {
    return new Response("Client-side mode enabled.", { status: 200 });
}
