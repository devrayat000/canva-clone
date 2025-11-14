import { Hono } from "hono";
import { verifyAuth } from "@hono/auth-js";
import { desc, eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { assets } from "@/db/schema";

const app = new Hono()
  .get("/", verifyAuth(), async (c) => {
    const auth = c.get("authUser");
    
    if (!auth.token?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const data = await db
      .select()
      .from(assets)
      .where(eq(assets.userId, auth.token.id))
      .orderBy(desc(assets.createdAt));

    return c.json({ data });
  });

export default app;
