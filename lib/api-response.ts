import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

import { ForbiddenError } from "@/lib/admin";
import { UnauthorizedError } from "@/lib/auth";

export function ok<T>(data: T, init?: ResponseInit): NextResponse<T> {
  return NextResponse.json(data, init);
}

export function apiError(
  message: string,
  status = 400,
  details?: unknown,
): NextResponse {
  return NextResponse.json(
    {
      error: {
        message,
        details,
      },
    },
    { status },
  );
}

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ZodError) {
    return apiError("Invalid request", 422, error.flatten());
  }

  if (error instanceof UnauthorizedError) {
    return apiError(error.message, 401);
  }

  if (error instanceof ForbiddenError) {
    return apiError(error.message, 403);
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return apiError("A record with this unique value already exists", 409, error.meta);
    }

    if (error.code === "P2025") {
      return apiError("Record not found", 404);
    }
  }

  return apiError("Internal server error", 500);
}
