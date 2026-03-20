import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");

    if (!from || !to) {
      return NextResponse.json(
        { error: "from and to are required" },
        { status: 400 },
      );
    }

    const [fromLat, fromLon] = from.split(",").map(Number);
    const [toLat, toLon] = to.split(",").map(Number);

    if ([fromLat, fromLon, toLat, toLon].some((v) => Number.isNaN(v))) {
      return NextResponse.json(
        { error: "Invalid coordinates" },
        { status: 400 },
      );
    }

    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${fromLon},${fromLat};${toLon},${toLat}?overview=full&geometries=geojson&alternatives=false`;
    const res = await fetch(osrmUrl, { next: { revalidate: 60 } });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch route" },
        { status: res.status },
      );
    }

    const data = await res.json();
    const route = data.routes?.[0];
    if (!route) {
      return NextResponse.json({ error: "No route found" }, { status: 404 });
    }

    const distanceKm = Number((route.distance / 1000).toFixed(1));
    const durationMin = Math.round(route.duration / 60);
    const coords = Array.isArray(route.geometry?.coordinates)
      ? route.geometry.coordinates.map((c: [number, number]) => ({
          lon: c[0],
          lat: c[1],
        }))
      : [];

    return NextResponse.json({ route: { distanceKm, durationMin, coords } });
  } catch (error) {
    console.error("Route error", error);
    return NextResponse.json(
      { error: "Failed to compute route" },
      { status: 500 },
    );
  }
}
