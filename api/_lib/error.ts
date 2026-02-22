export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

export function sendInternalError(res: any, error: unknown, context: string) {
  const message = getErrorMessage(error);

  // Keep useful diagnostics in function logs.
  console.error(`[${context}]`, error);

  return res.status(500).json({
    error: "Internal server error",
    context,
    message,
  });
}
