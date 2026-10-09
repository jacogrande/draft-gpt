import { Link } from "@remix-run/react";
import Heading from "~/components/Heading";
import Page from "~/components/Page";

const GameNotice = ({ children }: { children: React.ReactNode }) => (
  <Page>
    <Heading>{children}</Heading>
    <Link to="/" className="link link-primary">
      Go back home
    </Link>
  </Page>
);

export default GameNotice;
