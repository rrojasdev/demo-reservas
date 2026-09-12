export async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, { ...options, headers: { 'Content-Type': 'application/json', ...options?.headers } });
  if (!response.ok) throw new Error('No pudimos completar la operación.');
  return response.status === 204 ? undefined as T : response.json() as Promise<T>;
}
