const Heading = ({ children }: { children: React.ReactNode }) => {
  return (
    <h1 className="leading text-2xl font-bold text-gray-800 dark:text-slate-200">
      {children}
    </h1>
  );
};

export default Heading;
