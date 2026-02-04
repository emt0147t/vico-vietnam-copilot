
// Route disabled. Logic moved to client-side services/CopilotService.ts
export async function POST(req: Request) {
  return new Response("Client-side mode enabled. Please use CopilotService directly.", { status: 200 });
}
