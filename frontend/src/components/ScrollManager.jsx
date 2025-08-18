import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollManager() {
  const { pathname, hash, key } = useLocation();

  useEffect(() => {
    // ブラウザの自動復元を無効化
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    // ハッシュ指定がある場合は、その要素へ（描画待ちしてから）
    if (hash) {
      const id = hash.replace("#", "");
      const go = () => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      };
      // 描画タイミング差を吸収
      requestAnimationFrame(() => setTimeout(go, 50));
      return;
    }

    // それ以外はページ先頭へ（Samsung対策で二度呼び＋fallback）
    const jumpTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      // 一部端末の保険
      const se = document.scrollingElement || document.documentElement;
      if (se) se.scrollTop = 0;
      document.body.scrollTop = 0;
    };
    requestAnimationFrame(() => {
      jumpTop();
      requestAnimationFrame(jumpTop);
    });
  }, [pathname, hash, key]);

  return null;
}
