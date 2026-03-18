import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import CommunityPost from "@/models/CommunityPost";
import User from "@/models/User";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const { id } = await context.params;
    const { userId, body } = await req.json();

    if (!userId || !body) {
      return NextResponse.json(
        { ok: false, message: "userId and body are required" },
        { status: 400 }
      );
    }

    const trimmedBody = String(body).trim();

    if (!trimmedBody) {
      return NextResponse.json(
        { ok: false, message: "Comment cannot be empty" },
        { status: 400 }
      );
    }

    const post = await CommunityPost.findById(id);

    if (!post) {
      return NextResponse.json(
        { ok: false, message: "Post not found" },
        { status: 404 }
      );
    }

    const user = await User.findById(userId).lean();

    const firstName = user?.firstName?.trim() || "SARI Student";
    const lastInitial = user?.lastName?.trim()?.charAt(0) || "";
    const authorName = lastInitial ? `${firstName} ${lastInitial}.` : firstName;
    const handleBase = firstName.toLowerCase().replace(/\s+/g, "");
    const authorHandle = `@${handleBase || "student"}`;

    post.comments.push({
      userId,
      authorName,
      authorHandle,
      body: trimmedBody,
    });

    await post.save();

    const lastComment = post.comments[post.comments.length - 1];

    return NextResponse.json({
      ok: true,
      message: "Comment added successfully",
      comment: {
        id: String(lastComment._id),
        author: lastComment.authorName,
        handle: lastComment.authorHandle,
        body: lastComment.body,
        createdAt: lastComment.createdAt,
      },
      comments: post.comments.length,
    });
  } catch (error) {
    console.error("POST /api/community/posts/[id]/comments error:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to add comment" },
      { status: 500 }
    );
  }
}