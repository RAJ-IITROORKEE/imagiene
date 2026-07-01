import { NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin";
import { handleApiError, ok } from "@/lib/api-response";
import { listContactMessages } from "@/lib/contact-messages";
import { contactMessageQuerySchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const query = contactMessageQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams.entries()),
    );
    const { total, messages } = await listContactMessages({
      q: query.q,
      status: query.status,
      page: query.page,
      pageSize: query.pageSize,
    });

    return ok({
      data: messages,
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        pageCount: Math.ceil(total / query.pageSize),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
