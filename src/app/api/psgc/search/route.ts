import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const q = url.searchParams.get("q");
    if (!q || q.length < 2) {
      return NextResponse.json({ results: [] });
    }

    // PSGC API for cities/municipalities
    const psgcUrl = `https://psgc.gitlab.io/api/cities-municipalities/?q=${encodeURIComponent(q)}`;
    const res = await fetch(psgcUrl, { next: { revalidate: 3600 } });

    if (!res.ok) {
      return NextResponse.json({ results: [] }, { status: res.status });
    }

    const data = (await res.json()) as Array<{
      name: string;
      code: string;
      regionName?: string;
      provinceName?: string;
    }>;

    const results = data.slice(0, 10).map((item) => ({
      name: item.name,
      code: item.code,
      region: item.regionName,
      province: item.provinceName,
    }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error("PSGC search error", error);
    return NextResponse.json(
      { error: "Failed to search PSGC" },
      { status: 500 },
    );
  }
}
