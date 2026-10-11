import { Link } from "@remix-run/react";
import Heading from "~/components/Heading";
import Page from "~/components/Page";

const DeckNotice = ({ children }: { children: React.ReactNode }) => (
  <Page>
    <Heading>{children}</Heading>
    <Link to="/decks" className="link link-primary">
      Back to decks
    </Link>
  </Page>
);

export default DeckNotice;
