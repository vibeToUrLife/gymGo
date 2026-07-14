// Pure plan-state reducer (no React) so it can be unit-tested directly.
// State is an ordered list of exercise ids.

export type PlanAction =
  | { type: "add"; id: string }
  | { type: "remove"; id: string }
  | { type: "move"; from: number; to: number }
  | { type: "clear" }
  | { type: "hydrate"; ids: string[] };

export function planReducer(state: string[], action: PlanAction): string[] {
  switch (action.type) {
    case "add":
      return state.includes(action.id) ? state : [...state, action.id];
    case "remove":
      return state.filter((id) => id !== action.id);
    case "move": {
      const { from, to } = action;
      if (
        from < 0 ||
        to < 0 ||
        from >= state.length ||
        to >= state.length ||
        from === to
      ) {
        return state;
      }
      const next = state.slice();
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    }
    case "clear":
      return state.length === 0 ? state : [];
    case "hydrate":
      // de-dup while preserving order
      return Array.from(new Set(action.ids));
    default:
      return state;
  }
}
