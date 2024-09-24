import { ActionFunction, json } from "@remix-run/node";
import { createSettingDoc } from "~/.server/draftActions";
import { attachSettingToLobby } from "~/.server/lobbyActions";
import { withAuthenticatedUser } from "~/.server/middleware/withAuthenticatedUser";
import { generateSetData } from "~/.server/models/openai";

//========= HANDLER =========//
export const action: ActionFunction = withAuthenticatedUser(
  async ({ request, userId }) => {
    try {
      const body = await request.json();
      if (!isValidBody(body))
        return json({ error: "Invalid body" }, { status: 422 });
      const { worldbuildingMessages, lobbyId } = body;

      // generate and save the setting
      console.log("Generating setting...");
      const setting = await generateSetData(worldbuildingMessages);
      if (!setting) {
        console.error("Setting not generated");
        return json({ error: "Setting not generated" }, { status: 500 });
      }
      const settingId = await createSettingDoc({ lobbyId, userId, setting });
      console.log("Setting generated and saved");
      await attachSettingToLobby(lobbyId, settingId);
      return json({ userId }, { status: 200 });
    } catch (error) {
      console.error(error);
      return json({ error: "Internal server error" }, { status: 500 });
    }
  }
);

//========= VALIDATION =========//
type Body = {
  worldbuildingMessages: string[];
  lobbyId: string;
};
const isValidBody = (body: unknown): body is Body => {
  console.log(body);
  return (
    typeof body === "object" &&
    body !== null &&
    "worldbuildingMessages" in body &&
    "lobbyId" in body
  );
};
