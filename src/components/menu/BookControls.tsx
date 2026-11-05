"use client";

import { BOOK_PAGE_COUNT, LOGO_MARK } from "@/data/menu-pages";

type BookControlsProps = {
  visible: boolean;
  pageIndex: number;
  pageTitle: string;
  onPrev: () => void;
  onNext: () => void;
};

export function BookControls({
  visible,
  pageIndex,
  pageTitle,
  onPrev,
  onNext,
}: BookControlsProps) {
  const atStart = pageIndex <= 0;
  const atEnd = pageIndex >= BOOK_PAGE_COUNT - 1;

  if (!visible) return null;

  return (
    <div className="book-controls">
      <div className="book-controls__mark" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO_MARK} alt="" draggable={false} />
      </div>
      <div
        className="book-controls__bar"
        onPointerDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="book-controls__nav"
          aria-label="Önceki sayfa"
          disabled={atStart}
          data-emphasis={atStart ? "off" : "on"}
          onClick={onPrev}
        >
          <ChevronLeft />
        </button>

        <div className="book-controls__meta">
          <p className="book-controls__title">{pageTitle}</p>
          <p className="sr-only" aria-live="polite">
            Sayfa {pageIndex + 1} / {BOOK_PAGE_COUNT}, {pageTitle}
          </p>
          <div className="book-controls__dots" aria-hidden>
            {Array.from({ length: BOOK_PAGE_COUNT }).map((_, i) => (
              <span
                key={i}
                className="book-controls__dot"
                data-active={i === pageIndex ? "true" : "false"}
              />
            ))}
          </div>
        </div>

        <button
          type="button"
          className="book-controls__nav"
          aria-label="Sonraki sayfa"
          disabled={atEnd}
          data-emphasis={atEnd ? "off" : "on"}
          onClick={onNext}
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
}

function ChevronLeft() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden fill="none">
      <path
        d="M14.5 6.5 9 12l5.5 5.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden fill="none">
      <path
        d="M9.5 6.5 15 12l-5.5 5.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
