const Heading = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <h1
      className={
        "leading text-2xl font-bold text-gray-800 dark:text-slate-200 " +
        (className || "")
      }
    >
      {children}
    </h1>
  );
};

export default Heading;
