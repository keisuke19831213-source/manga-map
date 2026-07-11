"use client";

import { useEffect, useState } from "react";

// スマホ判定(実測まではnull)。スマホではズーム地図の代わりに縦スクロールUIを出す
export function useIsMobile(bp = 700): boolean | null {
  const [m, setM] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${bp}px)`);
    const f = () => setM(mq.matches);
    f();
    mq.addEventListener("change", f);
    return () => mq.removeEventListener("change", f);
  }, [bp]);
  return m;
}
