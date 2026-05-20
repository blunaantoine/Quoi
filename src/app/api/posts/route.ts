import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/posts — List posts with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status") || "approved";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (category) where.categorySlug = category;

    const [posts, total] = await Promise.all([
      db.post.findMany({
        where,
        include: {
          author: {
            include: { profile: true },
          },
          category: true,
          _count: {
            select: { likes: true, comments: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.post.count({ where }),
    ]);

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/posts error:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

// POST /api/posts — Create a new post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      image,
      categorySlug,
      externalLink,
      whatsapp,
      email,
      phone,
      location,
      eventDate,
      deadlineDate,
      mode,
      authorId,
    } = body;

    if (!title || !description || !categorySlug || !authorId) {
      return NextResponse.json(
        { error: "Missing required fields: title, description, categorySlug, authorId" },
        { status: 400 }
      );
    }

    // Check user exists and get role
    const user = await db.user.findUnique({ where: { id: authorId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Determine status based on user role
    const status =
      user.role === "user" ? "pending" : "approved";

    const post = await db.post.create({
      data: {
        title,
        description,
        image: image || "",
        categorySlug,
        externalLink: externalLink || "",
        whatsapp: whatsapp || "",
        email: email || "",
        phone: phone || "",
        location: location || "",
        eventDate: eventDate ? new Date(eventDate) : null,
        deadlineDate: deadlineDate ? new Date(deadlineDate) : null,
        mode: mode || "presentiel",
        status,
        authorId,
      },
      include: {
        author: {
          include: { profile: true },
        },
        category: true,
        _count: {
          select: { likes: true, comments: true },
        },
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("POST /api/posts error:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
