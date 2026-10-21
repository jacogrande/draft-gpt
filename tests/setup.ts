globalThis.fetch = async () => {
  throw new Error("Tests must mock fetch; live network requests are disabled");
};
