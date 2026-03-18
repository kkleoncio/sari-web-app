import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import CommunityPost from "@/models/CommunityPost";
import User from "@/models/User";

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "";
    const q = (searchParams.get("q") || "").trim();
    const tag = (searchParams.get("tag") || "").trim();
    const view = (searchParams.get("view") || "all").trim(); // all | mine | saved

    const filter: Record<string, any> = {};

    if (tag && tag !== "All") {
      filter.tag = tag;
    }

    if (view === "mine" && userId) {
      filter.userId = userId;
    }

    if (view === "saved" && userId) {
      filter.savedBy = userId;
    }

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { body: { $regex: q, $options: "i" } },
        { authorName: { $regex: q, $options: "i" } },
        { tag: { $regex: q, $options: "i" } },
      ];
    }

    const posts = await CommunityPost.find(filter).sort({ createdAt: -1 }).lean();

    const mappedPosts = posts.map((post: any) => ({
      id: String(post._id),
      author: post.authorName,
      handle: post.authorHandle,
      tag: post.tag,
      title: post.title,
      body: post.body,
      likes: post.likedBy?.length ?? 0,
      comments: post.comments?.length ?? 0,
      saved: post.savedBy?.length ?? 0,
      likedByMe: userId ? (post.likedBy ?? []).includes(userId) : false,
      savedByMe: userId ? (post.savedBy ?? []).includes(userId) : false,
      isMine: userId ? String(post.userId) === String(userId) : false,
      createdAt: post.createdAt,
      commentsList: (post.comments ?? []).map((comment: any) => ({
        id: String(comment._id),
        author: comment.authorName,
        handle: comment.authorHandle,
        body: comment.body,
        createdAt: comment.createdAt,
      })),
    }));

    return NextResponse.json({
      ok: true,
      posts: mappedPosts,
    });
  } catch (error) {
    console.error("GET /api/community/posts error:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to load posts" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const { userId, tag, title, body } = await req.json();

    if (!userId || !tag || !title || !body) {
      return NextResponse.json(
        { ok: false, message: "userId, tag, title, and body are required" },
        { status: 400 }
      );
    }

    const trimmedTitle = String(title).trim();
    const trimmedBody = String(body).trim();

    if (!trimmedTitle || !trimmedBody) {
      return NextResponse.json(
        { ok: false, message: "Title and body cannot be empty" },
        { status: 400 }
      );
    }

    const user = await User.findById(userId).lean();

    const firstName = user?.firstName?.trim() || "SARI Student";
    const lastInitial = user?.lastName?.trim()?.charAt(0) || "";
    const authorName = lastInitial ? `${firstName} ${lastInitial}.` : firstName;

    const handleBase = firstName.toLowerCase().replace(/\s+/g, "");
    const authorHandle = `@${handleBase || "student"}`;

    const post = await CommunityPost.create({
      userId,
      authorName,
      authorHandle,
      tag,
      title: trimmedTitle,
      body: trimmedBody,
    });

    return NextResponse.json({
      ok: true,
      message: "Post created successfully",
      post: {
        id: String(post._id),
        author: post.authorName,
        handle: post.authorHandle,
        tag: post.tag,
        title: post.title,
        body: post.body,
        likes: 0,
        comments: 0,
        saved: 0,
        likedByMe: false,
        savedByMe: false,
        isMine: true,
        createdAt: post.createdAt,
        commentsList: [],
      },
    });
  } catch (error) {
    console.error("POST /api/community/posts error:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to create post" },
      { status: 500 }
    );
  }
}