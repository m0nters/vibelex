import { createContext, useContext, type RefObject } from "react";

export const ScrollContainerContext =
  createContext<RefObject<HTMLElement | null> | null>(null);

export function useScrollContainer() {
  const context = useContext(ScrollContainerContext);
  if (!context) {
    throw new Error(
      "useScrollContainer must be used within ScrollContainerProvider",
    );
  }
  return context;
}
