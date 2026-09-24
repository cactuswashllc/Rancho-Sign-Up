import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { getCurrentOrganizer } from "@/lib/auth";

/**
 * Issues short-lived client-upload tokens for event photos. Only signed-in
 * organizers get a token; files go straight from the browser to Vercel Blob
 * (bypassing the serverless request-size limit). No onUploadCompleted
 * webhook: the client records the uploaded URL through a server action.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!(await getCurrentOrganizer())) throw new Error("Not signed in");
        if (!pathname.startsWith("events/")) throw new Error("Invalid path");
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"],
          maximumSizeInBytes: 8 * 1024 * 1024,
          addRandomSuffix: true,
        };
      },
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 400 },
    );
  }
}
