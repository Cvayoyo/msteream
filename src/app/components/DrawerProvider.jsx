"use client";

import { createContext, useContext, useState } from 'react';

const DrawerContext = createContext({
  isExpanded: false,
  setIsExpanded: () => {},
});

export const useDrawer = () => useContext(DrawerContext);

export const DrawerProvider = ({ children, drawer }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <DrawerContext.Provider value={{ isExpanded, setIsExpanded }}>
      {drawer}
      <div
        className="transition-all duration-300"
        style={{
          marginLeft: isExpanded ? '256px' : '80px', // w-64 = 256px, w-20 = 80px
        }}
      >
        {children}
      </div>
    </DrawerContext.Provider>
  );
};
