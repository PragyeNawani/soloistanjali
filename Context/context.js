"use client";
// import { createContext } from "react";
// export const Scrollactivecontext = createContext({children})
import { createContext, useState, useContext } from "react";

const NavContext = createContext();

export function NavProvider({ children }) {
  const [navani, setNavani] = useState(false); // shared state

  return (
    <NavContext.Provider value={{ navani, setNavani }}>
      {children}
    </NavContext.Provider>
  );
}

export function useNavContext() {
  return useContext(NavContext);
}
