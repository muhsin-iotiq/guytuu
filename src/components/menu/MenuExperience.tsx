"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MENU_PAGES } from "@/data/menu-pages";
import { BookControls } from "./BookControls";
import { FlipBook, type FlipBookHandle } from "./FlipBook";

export function MenuExperience() {
  const bookRef = useRef<FlipBookHandle>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [interactive, setInteractive] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      setInteractive(true);
      setControlsVisible(true);
      return;
    }
    const enable = window.setTimeout(() => setInteractive(true), 2100);
    const showControls = window.setTimeout(() => setControlsVisible(true), 2450);
    return () => {
      window.clearTimeout(enable);
      window.clearTimeout(showControls);
    };
  }, [reducedMotion]);

  const handleIndexChange = useCallback((index: number) => {
    setPageIndex(index);
    setInteractive(true);
    setControlsVisible(true);
  }, []);

  useEffect(() => {
    if (!interactive) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        bookRef.current?.goNext();
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        bookRef.current?.goPrev();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [interactive]);

  const page = MENU_PAGES[pageIndex];

  return (
    <div className="menu-experience">
      <FlipBook
        ref={bookRef}
        reducedMotion={reducedMotion}
        interactive={interactive}
        playIntro={!reducedMotion}
        onIndexChange={handleIndexChange}
      />

      <BookControls
        visible={controlsVisible}
        pageIndex={pageIndex}
        pageTitle={page?.title ?? ""}
        onPrev={() => bookRef.current?.goPrev()}
        onNext={() => bookRef.current?.goNext()}
      />
    </div>
  );
}
