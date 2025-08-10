import { getOrdersByHub, mockOrders } from "~/lib/data/orders";

export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const hub = url.searchParams.get("hub");
  const data = hub ? getOrdersByHub(hub) : mockOrders;
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
}

export async function action({ request }: { request: Request }) {
  const url = new URL(request.url);
  if (url.pathname.endsWith("/checkout")) {
    // accept any payload and return success
    await request.json().catch(() => ({}));
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  }
  return new Response(JSON.stringify({ error: "Unknown action" }), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
}
