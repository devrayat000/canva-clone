import { Hono } from "hono";
import { verifyAuth } from "@hono/auth-js";
import { desc, eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { userAssets } from "@/db/schema";

const app = new Hono()
  .get("/", verifyAuth(), async (c) => {
    const auth = c.get("authUser");
    
    if (!auth.token?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const assets = await db
      .select()
      .from(userAssets)
      .where(eq(userAssets.userId, auth.token.id))
      .orderBy(desc(userAssets.createdAt));

    return c.json({ data: assets });
  });

export default app;
