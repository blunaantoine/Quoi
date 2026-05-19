import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/ads — Get active ads
export async function GET() {
  try {
    const now = new Date();

    const ads = await db.ad.findMany({
      where: {
        isActive: true,
        OR: [
          { endDate: null },
          { endDate: { gte: now } },
        ],
        startDate: { lte: now },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(ads);
  } catch (error) {
    console.error("GET /api/ads error:", error);
    return NextResponse.json(
      { error: "Failed to fetch ads" },
      { status: 500 }
    );
  }
}

// POST /api/ads — Create ad (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, image, link, type, targetAudience, startDate, endDate, authorId } = body;

    if (!title || !image || !authorId) {
      return NextResponse.json(
        { error: "Missing required fields: title, image, authorId" },
        { status: 400 }
      );
    }

    // Check user is admin
    const user = await db.user.findUnique({ where: { id: authorId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can create ads" },
        { status: 403 }
      );
    }

    const ad = await db.ad.create({
      data: {
        title,
        image,
        link: link || "",
        type: type || "flyer",
        targetAudience: targetAudience || "all",
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    return NextResponse.json(ad, { status: 201 });
  } catch (error) {
    console.error("POST /api/ads error:", error);
    return NextResponse.json(
      { error: "Failed to create ad" },
      { status: 500 }
    );
  }
}
