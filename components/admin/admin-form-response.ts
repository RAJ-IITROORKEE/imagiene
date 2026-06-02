type AdminApiResponse = {
  error?: string | { message?: string };
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

  return result.error?.message ?? fallback;
}
