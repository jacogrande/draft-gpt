import { ActionFunction, ActionFunctionArgs, json } from "@remix-run/node";
import { verifySession } from "~/.server/session";

export const withAuthenticatedUser =
  (handler: AuthenticatedActionFunction): ActionFunction =>
  async ({ request, ...rest }) => {
    const validSession = await verifySession({ request });
    if (!validSession) return json({ error: "Unauthorized" }, { status: 401 });
    const userId = (validSession as { user: string }).user;
    return handler({ request, userId, ...rest });
  };

//========= TYPES =========//
// NOTE: All these type shenanigans let us create a contract that `userId` is always present in the handler's arguments
interface AuthenticatedActionFunctionArgs extends ActionFunctionArgs {
  userId: string;
}
type AuthenticatedActionFunction = (
  args: AuthenticatedActionFunctionArgs
) => ReturnType<ActionFunction>;
