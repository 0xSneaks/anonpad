// Server proxy for the mogz.fun API (TX lane — muse).
//
// Why this exists: mogz's API is session-cookie based and same-origin, so a
// browser on anonpad's origin cannot call it directly. This route forwards
// calls server-side, attaching the OPERATOR's mogz session cookie from the
// MOGZ_COOKIE env var (set only in deployment env — never committed, never
// sent to the browser). The operator model matches the AnonPad map: the
// first launches run through the operator's mogz account; the connected
// wallet still signs every transaction in the browser.
//
// If MOGZ_COOKIE is not configured, the route answers 501 with a plain
// error the launch panel shows — nothing silently pretends to work.
import { NextRequest, NextResponse } from "next/server";

const MOGZ = "https://mogz.fun";

async function forward(req: NextRequest, path: string[]) {
  const cookie = process.env.MOGZ_COOKIE;
  if (!cookie) {
    return NextResponse.json(
      { error: "operator session not configured (MOGZ_COOKIE missing)" },
      { status: 501 },
    );
  }
  const url = `${MOGZ}/api/${path.join("/")}`;
  const headers: Record<string, string> = {
    Cookie: cookie,
    "User-Agent": "Mozilla/5.0 (AnonPad operator proxy)",
  };
  const ct = req.headers.get("content-type");
  if (ct) headers["Content-Type"] = ct;
  const init: RequestInit = { method: req.method, headers };
  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.arrayBuffer();
  }
  const res = await fetch(url, init);
  const body = await res.arrayBuffer();
  return new NextResponse(body, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("content-type") ?? "application/json",
    },
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return forward(req, (await params).path);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return forward(req, (await params).path);
}
