import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "../_generated/dataModel";
import { MutationCtx, QueryCtx } from "../_generated/server";
import { reject } from "../errors";

export const findViewer = (ctx: QueryCtx | MutationCtx) => getAuthUserId(ctx);

export const requireViewer = async (
  ctx: QueryCtx | MutationCtx
): Promise<Id<"users">> => {
  const userId = await getAuthUserId(ctx);
  return userId ?? reject("UNAUTHENTICATED");
};
