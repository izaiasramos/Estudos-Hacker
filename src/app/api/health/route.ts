import { checkDatabaseReady } from "@/lib/db";
import { databaseErrorMetadata } from "@/lib/db-errors";

export const dynamic = "force-dynamic";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
};

export async function GET(request: Request) {
  const check = new URL(request.url).searchParams.get("check");
  if (check !== "database") {
    return Response.json({ status: "ok" }, { headers: NO_STORE_HEADERS });
  }

  try {
    await checkDatabaseReady();
    return Response.json(
      { status: "ready", database: "up" },
      { headers: NO_STORE_HEADERS },
    );
  } catch (error) {
    console.error("[health] banco indisponível", databaseErrorMetadata(error));
    return Response.json(
      { status: "not_ready", database: "down" },
      {
        status: 503,
        headers: { ...NO_STORE_HEADERS, "Retry-After": "5" },
      },
    );
  }
}
