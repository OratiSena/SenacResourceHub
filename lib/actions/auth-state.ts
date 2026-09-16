export interface AuthActionState {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string[]>;
}

export const INITIAL_AUTH_ACTION_STATE: AuthActionState = { status: "idle" };
