import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/articles — List articles with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const eventStatus = searchParams.get("eventStatus");

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (eventStatus) where.eventStatus = eventStatus;

    const articles = await db.article.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(articles);
  } catch (error) {
    console.error("GET /api/articles error:", error);
    return NextResponse.json(
      { error: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}

// POST /api/articles — Create article (admin/manager only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, images, status, eventStatus, authorId } = body;

    if (!title || !content || !authorId) {
      return NextResponse.json(
        { error: "Missing required fields: title, content, authorId" },
        { status: 400 }
      );
    }

    // Check user exists and has proper role
    const user = await db.user.findUnique({ where: { id: authorId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role !== "admin" && user.role !== "manager") {
      return NextResponse.json(
        { error: "Only admins and managers can create articles" },
        { status: 403 }
      );
    }

    const article = await db.article.create({
      data: {
        title,
        content,
        images: images || "",
        status: status || "published",
        eventStatus: eventStatus || "upcoming",
        authorId,
      },
    });

    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    console.error("POST /api/articles error:", error);
    return NextResponse.json(
      { error: "Failed to create article" },
      { status: 500 }
    );
  }
}
