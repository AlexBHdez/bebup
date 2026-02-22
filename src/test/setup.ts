import "@testing-library/jest-dom";
import React, { ReactNode } from "react";
import { vi } from "vitest";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

vi.mock("framer-motion", () => {
  const stripMotionProps = (props: Record<string, unknown>) => {
    const {
      animate,
      initial,
      exit,
      whileTap,
      whileHover,
      whileFocus,
      layoutId,
      transition,
      variants,
      ...rest
    } = props;
    return rest;
  };

  const motion = new Proxy({}, {
    get: (_, tag: string) =>
      React.forwardRef<HTMLElement, Record<string, ReactNode>>(({ children, ...props }, ref) =>
        React.createElement(tag, { ...stripMotionProps(props), ref }, children)
      ),
  });

  return {
    motion,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
  };
});
