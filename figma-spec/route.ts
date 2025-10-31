import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

type IncomingBody = {
  name?: string;
  content?: string;
};

function sanitizeName(name: string): string {
  const trimmed = name.trim();
  const safe = trimmed.replace(/[^a-zA-Z0-9-_]/g, "-");
  return safe.length ? safe : "spec";
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as IncomingBody;
    const { name, content } = body || {};
    if (!content) {
      return NextResponse.json({ error: "Missing 'content'" }, { status: 400 });
    }

    const fileName = `${sanitizeName(name || "spec")}.txt`;
    const dir = path.join(process.cwd(), "src", "components", "ui");
    const filePath = path.join(dir, fileName);

    await fs.promises.mkdir(dir, { recursive: true });
    await fs.promises.writeFile(filePath, content, "utf8");

    return new NextResponse(
      JSON.stringify({ ok: true, file: `src/components/ui/${fileName}` }),
      {
        status: 200,
        headers: {
          "content-type": "application/json",
          "access-control-allow-origin": "*",
          "access-control-allow-methods": "POST, OPTIONS",
          "access-control-allow-headers": "content-type",
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "content-type",
    },
  });
}


