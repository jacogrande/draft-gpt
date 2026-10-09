import { Link } from "@remix-run/react";
import Heading from "~/components/Heading";
import Page from "~/components/Page";

const LobbyNotice = ({ children }: { children: React.ReactNode }) => (
  <Page>
    <Heading>{children}</Heading>
    <Link to="/lobbies" className="link link-primary">
      Back to lobbies
    </Link>
  </Page>
);

export default LobbyNotice;
