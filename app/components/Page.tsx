import { FC } from "react";

const Page: FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-16 gap-16">
      {children}
    </div>
  );
};

export default Page;
