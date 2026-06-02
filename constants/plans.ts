export const PLAN_TYPES = ["FREE", "PRO", "PREMIUM"] as const;

export type PlanType = (typeof PLAN_TYPES)[number];

export type Plan = {
  id: PlanType;
  name: string;
  description: string;
  priceMonthlyInr: number;
  priceMonthlyPaise: number;
  displayPrice: string;
  features: string[];
};

export const plans: Plan[] = [
  {
    id: "FREE",
    name: "Free",
    description: "Browse and download free scientific assets.",
    priceMonthlyInr: 0,
    priceMonthlyPaise: 0,
    displayPrice: "₹0/month",
    features: ["Browse the asset library", "Download free assets", "Bookmark assets"],
  },
  {
    id: "PRO",
    name: "Pro",
    description: "Access free and pro assets for active research work.",
    priceMonthlyInr: 1499,
    priceMonthlyPaise: 149900,
    displayPrice: "₹1499/month",
    features: ["Everything in Free", "Download pro assets", "Priority library updates"],
  },
  {
    id: "PREMIUM",
    name: "Premium",
    description: "Unlock all free, pro, and premium asset collections.",
    priceMonthlyInr: 2999,
    priceMonthlyPaise: 299900,
    displayPrice: "₹2999/month",
    features: ["Everything in Pro", "Download premium assets", "Full collection access"],
  },
];

export const planById = plans.reduce(
  (acc, plan) => ({ ...acc, [plan.id]: plan }),
  {} as Record<PlanType, Plan>,
);

export const paidPlans = plans.filter((plan) => plan.id !== "FREE");
