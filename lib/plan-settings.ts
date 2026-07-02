import { PLAN_TYPES, plans, type Plan, type PlanType } from "@/constants/plans";
import { prisma } from "@/lib/prisma";

const PLAN_SETTINGS_COLLECTION = "PlanSetting";

export type RuntimePlan = Plan & {
  active: boolean;
  inactiveMessage: string;
};

export type PlanSettingInput = {
  plan: PlanType;
  priceMonthlyInr: number;
  active: boolean;
  inactiveMessage?: string;
};

type StoredPlanSetting = Partial<PlanSettingInput> & {
  plan?: string;
};

type MongoFindResult = {
  cursor?: {
    firstBatch?: StoredPlanSetting[];
  };
};

function displayPrice(priceMonthlyInr: number) {
  return `₹${priceMonthlyInr}/month`;
}

function normalizeSetting(plan: Plan, setting?: StoredPlanSetting): RuntimePlan {
  const priceMonthlyInr = Number.isInteger(setting?.priceMonthlyInr)
    ? Number(setting?.priceMonthlyInr)
    : plan.priceMonthlyInr;
  const active = typeof setting?.active === "boolean" ? setting.active : true;
  const inactiveMessage = setting?.inactiveMessage?.trim() || `${plan.name} is temporarily unavailable.`;

  return {
    ...plan,
    priceMonthlyInr,
    priceMonthlyPaise: priceMonthlyInr * 100,
    displayPrice: displayPrice(priceMonthlyInr),
    active,
    inactiveMessage,
  };
}

export async function getRuntimePlans(): Promise<RuntimePlan[]> {
  const result = (await prisma.$runCommandRaw({
    find: PLAN_SETTINGS_COLLECTION,
    filter: {},
  })) as MongoFindResult;
  const settings = new Map(
    (result.cursor?.firstBatch ?? [])
      .filter((setting) => PLAN_TYPES.includes(setting.plan as PlanType))
      .map((setting) => [setting.plan as PlanType, setting]),
  );

  return plans.map((plan) => normalizeSetting(plan, settings.get(plan.id)));
}

export async function getRuntimePlanById(planId: PlanType) {
  const runtimePlans = await getRuntimePlans();

  return runtimePlans.find((plan) => plan.id === planId) ?? normalizeSetting(plans[0]);
}

export async function getRuntimePaidPlans() {
  const runtimePlans = await getRuntimePlans();

  return runtimePlans.filter((plan) => plan.id !== "FREE");
}

export async function upsertPlanSettings(settings: PlanSettingInput[]) {
  const updatedAt = new Date();

  await Promise.all(
    settings.map((setting) =>
      prisma.$runCommandRaw({
        update: PLAN_SETTINGS_COLLECTION,
        updates: [
          {
            q: { plan: setting.plan },
            u: {
              $set: {
                plan: setting.plan,
                priceMonthlyInr: setting.priceMonthlyInr,
                active: setting.active,
                inactiveMessage: setting.inactiveMessage?.trim() ?? "",
                updatedAt,
              },
              $setOnInsert: { createdAt: updatedAt },
            },
            upsert: true,
          },
        ],
      }),
    ),
  );

  return getRuntimePlans();
}
