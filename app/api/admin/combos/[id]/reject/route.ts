import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import CommunityPost from "@/models/CommunityPost";
import { requireAdminApi } from "@/lib/requireAdmin";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdminApi();

  if (!adminCheck.ok) {
    return NextResponse.json(
      { ok: false, message: adminCheck.message },
      { status: adminCheck.status }
    );
  }

  const { id } = await params;

  await connectToDatabase();

  const updated = await CommunityPost.findByIdAndUpdate(
    id,
    {
      verificationStatus: "rejected",
      isVerified: false,
    },
    { new: true }
  );

  if (!updated) {
    return NextResponse.json(
      { ok: false, message: "Combo post not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ok: true,
    message: "Combo rejected successfully",
    post: updated,
  });
}