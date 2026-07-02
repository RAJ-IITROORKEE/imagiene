import { NextRequest } from "next/server";

import { createAdminAuditLog, requireAdmin } from "@/lib/admin";
import { handleApiError, ok } from "@/lib/api-response";
import { upsertPlanSettings } from "@/lib/plan-settings";
import { checkRateLimit } from "@/lib/rate-limit";
import { adminPlanSettingsSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const limited = await checkRateLimit(`admin:${admin.id}`, {
      prefix: "api:admin-mutations",
      limit: 60,
      window: "1 m",
    });

    if (limited) {
      return limited;
    }

    const input = adminPlanSettingsSchema.parse(await request.json());
    const plans = await upsertPlanSettings(input.plans);

    await createAdminAuditLog({
      adminId: admin.id,
      action: "settings.plans.update",
      entityType: "PlanSetting",
      metadata: { plans: input.plans },
    });

    return ok({ data: plans });
  } catch (error) {
    return handleApiError(error);
  }
}
