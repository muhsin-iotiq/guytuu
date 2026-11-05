"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BOOK_PAGE_COUNT, MENU_PAGES } from "@/data/menu-pages";
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
  const atStart = pageIndex <= 0;
  const atEnd = pageIndex >= BOOK_PAGE_COUNT - 1;

  return (
    <div className="menu-experience">
      <FlipBook
        ref={bookRef}
        reducedMotion={reducedMotion}
        interactive={interactive}
        playIntro={!reducedMotion}
        onIndexChange={handleIndexChange}
      />

      {interactive ? (
        <>
          <button
            type="button"
            className="flip-hit flip-hit--prev"
            aria-label="Önceki sayfa"
            disabled={atStart}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => bookRef.current?.goPrev()}
          />
          <button
            type="button"
            className="flip-hit flip-hit--next"
            aria-label="Sonraki sayfa"
            disabled={atEnd}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => bookRef.current?.goNext()}
          />
        </>
      ) : null}

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
