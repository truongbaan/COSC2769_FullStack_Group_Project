export async function action({ request }: { request: Request }) {
  const body = await request.json().catch(() => ({}));
  const { email } = body || {};
  if (!email) {
    return new Response(JSON.stringify({ error: "Missing credentials" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  // Echo back a demo user DTO based on email prefix
  const role = email.startsWith("vendor@") || email.includes("vendor")
    ? "vendor"
    : email.startsWith("shipper@") || email.includes("shipper")
      ? "shipper"
      : "customer";
  // Extract username from email for backwards compatibility
  const username = email.split('@')[0];
  return new Response(
    JSON.stringify({ id: `${role}_${username}`, username, role }),
    { headers: { "Content-Type": "application/json" } }
  );
}
