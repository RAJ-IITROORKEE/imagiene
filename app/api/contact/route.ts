import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

import { apiError, handleApiError, ok } from "@/lib/api-response";
import { createContactMessage } from "@/lib/contact-messages";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getRateLimitIdentifier } from "@/lib/rate-limit";
import { createContactMessageSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const limited = await checkRateLimit(getRateLimitIdentifier(request, "contact"), {
      prefix: "api:contact",
      limit: 8,
      window: "1 m",
    });

    if (limited) {
      return limited;
    }

    const input = createContactMessageSchema.parse(await request.json());
    const { userId: clerkId } = await auth();
    const user = clerkId
      ? await prisma.user.findUnique({ where: { clerkId }, select: { id: true } })
      : null;

    const message = await createContactMessage({ ...input, userId: user?.id });

    return ok({ data: message, message: "Message received" }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return apiError("Invalid JSON body", 400);
    }

    return handleApiError(error);
  }
}
