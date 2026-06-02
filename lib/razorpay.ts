import Razorpay from "razorpay";

let razorpayClient: Razorpay | null = null;

export function isRazorpayConfigured(): boolean {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

export function getRazorpayKeyId(): string | null {
  return process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? process.env.RAZORPAY_KEY_ID ?? null;
}

export function getRazorpay(): Razorpay | null {
  if (!isRazorpayConfigured()) {
    return null;
  }

  razorpayClient ??= new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID as string,
    key_secret: process.env.RAZORPAY_KEY_SECRET as string,
  });

  return razorpayClient;
}

export function requireRazorpay(): Razorpay {
  const client = getRazorpay();

  if (!client) {
    throw new Error("Razorpay credentials are not configured");
  }

  return client;
}
