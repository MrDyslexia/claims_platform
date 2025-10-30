"use client";

import { usePathname } from "next/navigation";

import { Navbar } from "./navbar";

export function ConditionalNavbar() {
  const pathname = usePathname();

  const hideNavbar =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/supervisor") ||
    pathname.startsWith("/analyst");

  if (hideNavbar) {
    return null;
  }

  return <Navbar />;
}
