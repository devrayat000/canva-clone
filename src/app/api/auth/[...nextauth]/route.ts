import { handlers } from "@/auth";

// bcrypt.js is not supported on Edge runtime
export const runtime = "nodejs";

export const { GET, POST } = handlers;
