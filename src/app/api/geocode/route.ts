import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const q = url.searchParams.get("q");
    if (!q || q.length < 3) {
      return NextResponse.json({ results: [] });
    }

    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(q)}`;
    const res = await fetch(nominatimUrl, {
      headers: {
        "User-Agent": "cross-ride-app/1.0",
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return NextResponse.json({ results: [] }, { status: res.status });
    }

    const data = (await res.json()) as Array<{
      display_name: string;
      lat: string;
      lon: string;
    }>;

    const results = data.map((item) => ({
      label: item.display_name,
      lat: Number(item.lat),
      lon: Number(item.lon),
    }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Geocode error", error);
    return NextResponse.json(
      { error: "Failed to search location" },
      { status: 500 },
    );
  }
}
