"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import type { PageFlip, PageFlipEvent } from "page-flip/dist/js/page-flip.module.js";
import { MENU_PAGES } from "@/data/menu-pages";
import {
  bindPageTurnSoundUnlock,
  getTurnDirection,
  playPageTurnSound,
} from "@/lib/page-turn-sound";
import { MenuPageView } from "./MenuPageView";

export type FlipBookHandle = {
  goNext: () => void;
  goPrev: () => void;
};

type FlipBookProps = {
  reducedMotion: boolean;
  interactive: boolean;
  playIntro: boolean;
  onIndexChange: (index: number) => void;
};

export const FlipBook = forwardRef<FlipBookHandle, FlipBookProps>(
  function FlipBook(
    { reducedMotion, interactive, playIntro, onIndexChange },
    ref,
  ) {
    const rootRef = useRef<HTMLDivElement>(null);
    const bookRef = useRef<HTMLDivElement>(null);
    const pageFlipRef = useRef<PageFlip | null>(null);
    const onIndexChangeRef = useRef(onIndexChange);
    const reducedMotionRef = useRef(reducedMotion);
    onIndexChangeRef.current = onIndexChange;
    reducedMotionRef.current = reducedMotion;

    useImperativeHandle(ref, () => ({
      goNext: () => pageFlipRef.current?.flipNext("bottom"),
      goPrev: () => pageFlipRef.current?.flipPrev("bottom"),
    }));

    useEffect(() => {
      const root = rootRef.current;
      const book = bookRef.current;
      if (!root || !book) return;

      let cancelled = false;
      let pageFlip: PageFlip | null = null;

      async function init() {
        const { PageFlip } = await import(
          "page-flip/dist/js/page-flip.module.js"
        );
        if (cancelled || !rootRef.current || !bookRef.current) return;

        const width = Math.max(320, rootRef.current.clientWidth);
        const height = Math.max(480, rootRef.current.clientHeight);
        const pages = bookRef.current.querySelectorAll(".menu-page");
        if (pages.length === 0) return;

        pageFlip = new PageFlip(bookRef.current, {
          width,
          height,
          size: "stretch",
          minWidth: width,
          maxWidth: Math.max(width, 2400),
          minHeight: height,
          maxHeight: Math.max(height, 2400),
          usePortrait: true,
          showCover: true,
          flippingTime: reducedMotion ? 280 : 860,
          drawShadow: true,
          showPageCorners: true,
          mobileScrollSupport: false,
          autoSize: false,
          maxShadowOpacity: 0.45,
          swipeDistance: 25,
          useMouseEvents: true,
          disableFlipByClick: false,
        });

        pageFlipRef.current = pageFlip;

        pageFlip.on("flip", (event: PageFlipEvent) => {
          onIndexChangeRef.current(Number(event.data));
        });

        const engine = pageFlip;
        pageFlip.on("changeState", (event: PageFlipEvent) => {
          if (cancelled) return;
          if (event.data !== "flipping" && event.data !== "user_fold") return;
          playPageTurnSound(
            getTurnDirection(engine),
            reducedMotionRef.current ? 420 : 820,
          );
        });

        pageFlip.on("init", () => {
          if (!cancelled && pageFlip) {
            onIndexChangeRef.current(pageFlip.getCurrentPageIndex());
          }
        });

        pageFlip.loadFromHTML(pages);
      }

      void init();

      return () => {
        cancelled = true;
        pageFlipRef.current?.destroy();
        pageFlipRef.current = null;
      };
    }, [reducedMotion]);

    useEffect(() => {
      bindPageTurnSoundUnlock();
    }, []);

    return (
      <div
        ref={rootRef}
        className="flip-stage"
        data-interactive={interactive ? "true" : "false"}
      >
        <div ref={bookRef} className="flip-book">
          {MENU_PAGES.map((page, index) => (
            <div
              key={page.id}
              className="menu-page"
              data-density={
                page.kind === "cover" || page.kind === "back" ? "hard" : "soft"
              }
            >
              <MenuPageView page={page} playIntro={playIntro && index === 0} />
            </div>
          ))}
        </div>
      </div>
    );
  },
);
