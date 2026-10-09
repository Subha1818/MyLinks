import { put, del } from "@vercel/blob";
import { generateId } from "@/lib/utils";

export async function uploadAvatar({
  userId,
  data,
  contentType,
}: {
  userId: string;
  data: Buffer;
  contentType: string;
}): Promise<{ url: string }> {
  // Use a random suffix to make URLs unguessable and cache-safe
  const filename = `avatars/${userId}/${generateId(12)}.webp`;
  
  const blob = await put(filename, data, {
    access: "public",
    contentType,
  });

  return { url: blob.url };
}

export async function deleteAvatarIfOwned({
  userId,
  url,
}: {
  userId: string;
  url: string;
}) {
  try {
    // Only delete if the URL belongs to our Vercel Blob store
    // Vercel Blob URLs look like: https://<random>.public.blob.vercel-storage.com/...
    if (url.includes(".blob.vercel-storage.com/")) {
      const parsedUrl = new URL(url);
      const path = parsedUrl.pathname.slice(1); // remove leading slash
      
      // Safety check: only allow deleting from this user's avatar folder
      if (path.startsWith(`avatars/${userId}/`)) {
        await del(url);
      }
    }
  } catch (error) {
    // Silently ignore errors (e.g. invalid URL, missing file)
    console.error("[deleteAvatarIfOwned] Error deleting blob:", error);
  }
}
