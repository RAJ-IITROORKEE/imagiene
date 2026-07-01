import { NextRequest } from "next/server";

import { createAdminAuditLog, requireAdmin } from "@/lib/admin";
import { handleApiError, ok } from "@/lib/api-response";
import { deleteContactMessage, updateContactMessageStatus } from "@/lib/contact-messages";
import { checkRateLimit } from "@/lib/rate-limit";
import { contactMessageParamsSchema, updateContactMessageSchema } from "@/lib/validators";

export const runtime = "nodejs";

type ContactMessageRouteProps = {
  params: Promise<{ messageId: string }>;
};

export async function PATCH(request: NextRequest, { params }: ContactMessageRouteProps) {
  try {
    const admin = await requireAdmin();
    const limited = await checkRateLimit(`admin:${admin.id}`, {
      prefix: "api:admin-contact-messages",
      limit: 90,
      window: "1 m",
    });

    if (limited) {
      return limited;
    }

    const { messageId } = contactMessageParamsSchema.parse(await params);
    const input = updateContactMessageSchema.parse(await request.json());
    const message = await updateContactMessageStatus(messageId, input.status);

    await createAdminAuditLog({
      adminId: admin.id,
      action: "contactMessage.update",
      entityType: "ContactMessage",
      entityId: message.id,
      metadata: { status: input.status },
    });

    return ok({ data: message });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: ContactMessageRouteProps) {
  try {
    const admin = await requireAdmin();
    const limited = await checkRateLimit(`admin:${admin.id}`, {
      prefix: "api:admin-contact-messages",
      limit: 60,
      window: "1 m",
    });

    if (limited) {
      return limited;
    }

    const { messageId } = contactMessageParamsSchema.parse(await params);
    const message = await deleteContactMessage(messageId);

    await createAdminAuditLog({
      adminId: admin.id,
      action: "contactMessage.delete",
      entityType: "ContactMessage",
      entityId: message.id,
      metadata: "subject" in message ? { subject: message.subject, email: message.email } : { id: message.id },
    });

    return ok({ data: { id: message.id } });
  } catch (error) {
    return handleApiError(error);
  }
}
