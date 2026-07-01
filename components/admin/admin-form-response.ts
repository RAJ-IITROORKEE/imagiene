type AdminApiResponse = {
  error?: string | {
    message?: string;
    details?: {
      fieldErrors?: Record<string, string[]>;
      formErrors?: string[];
    };
  };
};

export async function parseAdminApiResponse(response: Response): Promise<AdminApiResponse> {
  try {
    return (await response.json()) as AdminApiResponse;
  } catch {
    return {};
  }
}

export function getAdminApiErrorMessage(
  result: AdminApiResponse,
  fallback: string,
): string {
  if (typeof result.error === "string") {
    return result.error;
  }

  const fieldErrors = result.error?.details?.fieldErrors;
  const firstFieldError = fieldErrors
    ? Object.entries(fieldErrors).find(([, messages]) => messages.length > 0)
    : null;

  if (firstFieldError) {
    return `${firstFieldError[0]}: ${firstFieldError[1][0]}`;
  }

  return result.error?.message ?? fallback;
}
