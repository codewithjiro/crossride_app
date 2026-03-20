// Clerk webhook endpoint - Not used with custom authentication
export async function POST() {
  return Response.json({ error: "Not Found" }, { status: 404 });
}
