export interface AuthenticatedUser {
  id: number;
  username: string;
  email: string;
  full_name: string;
}

export async function loginWithPassword(
  username: string,
  password: string
): Promise<{ user: AuthenticatedUser }> {
  const form = new URLSearchParams();
  form.set("username", username);
  form.set("password", password);

  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
    credentials: "include",
  });

  if (!response.ok) {
    let message = "Login failed";
    try {
      const errorBody = await response.json();
      if (typeof errorBody?.detail === "string") {
        message = errorBody.detail;
      }
    } catch {
      // Keep default error message when response body is not JSON.
    }
    throw new Error(message);
  }

  const payload = await response.json();
  return { user: payload.user as AuthenticatedUser };
}

export async function fetchCurrentUser(): Promise<AuthenticatedUser | null> {
  const response = await fetch("/api/auth/me", {
    method: "GET",
    credentials: "include",
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Session check failed: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as AuthenticatedUser;
}

export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });
}
