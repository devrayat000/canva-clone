import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

import { auth } from "@/auth";
import { db } from "@/db/drizzle";
import { assets } from "@/db/schema";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    .middleware(async ({ req }) => {
      const session = await auth();

      if (!session) throw new UploadThingError("Unauthorized");

      return { userId: session.user?.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Save asset to database
      await db.insert(assets).values({
        userId: metadata.userId!,
        url: file.url,
        name: file.name,
        type: file.type,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return { url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
