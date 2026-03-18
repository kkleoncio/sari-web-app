import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import CommunityPost from "@/models/CommunityPost";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const { id } = await context.params;
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { ok: false, message: "userId is required" },
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

    const alreadyLiked = post.likedBy.includes(userId);

    if (alreadyLiked) {
      post.likedBy = post.likedBy.filter((id: string) => id !== userId);
    } else {
      post.likedBy.push(userId);
    }

    await post.save();

    return NextResponse.json({
      ok: true,
      likedByMe: !alreadyLiked,
      likes: post.likedBy.length,
    });
  } catch (error) {
    console.error("PATCH /api/community/posts/[id]/like error:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to update like" },
      { status: 500 }
    );
  }
}