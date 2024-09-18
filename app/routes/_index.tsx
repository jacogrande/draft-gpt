import type { MetaFunction } from "@remix-run/node";
import Heading from "~/components/Heading";
import Nav from "~/components/Nav";
import Page from "~/components/Page";

export const meta: MetaFunction = () => {
  return [
    { title: "DraftGPT" },
    { name: "description", content: "Welcome to DraftGPT!" },
  ];
};

export default function Index() {
  return (
    <Page>
      <div className="flex flex-col items-center gap-16">
        <header className="flex flex-col items-center gap-9">
          <Heading>Welcome to the Game</Heading>
        </header>
        <Nav />
      </div>
    </Page>
  );
}
