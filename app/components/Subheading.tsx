const Subheading = ({ children }: { children: React.ReactNode }) => {
  return (
    <h2 className="text-xs font-bold text-gray-500 dark:text-slate-200 uppercase flex items-center">
      {children}
    </h2>
  );
};

export default Subheading;
