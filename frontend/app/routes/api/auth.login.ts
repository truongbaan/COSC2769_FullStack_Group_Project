export async function action({ request }: { request: Request }) {
  const body = await request.json().catch(() => ({}));
  const { username } = body || {};
  if (!username) {
    return new Response(JSON.stringify({ error: "Missing credentials" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  // Echo back a demo user DTO based on prefix
  const role = username.startsWith("ven")
    ? "vendor"
    : username.startsWith("shi")
      ? "shipper"
      : "customer";
  return new Response(
    JSON.stringify({ id: `${role}_${username}`, username, role }),
    { headers: { "Content-Type": "application/json" } }
  );
}
