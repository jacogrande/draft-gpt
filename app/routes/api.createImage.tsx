import { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/react";
import { createImage } from "~/.server/imageActions";

export const action: ActionFunction = async ({ request }) => {
  try {
    const body = await request.json();
    const { artDirection } = body;
    if (!artDirection) return json({ error: "Invalid body" }, { status: 422 });
    const publicUrl = await createImage(artDirection, "test" + Math.random());
    if (!publicUrl)
      return json({ error: "Image generation failed" }, { status: 500 });
    return json({ success: true, imageUrl: publicUrl }, { status: 200 });
  } catch (error) {
    console.error(error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
};
