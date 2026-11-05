import type { CSSProperties } from "react";

type PosterPageProps = {
  src: string;
  title: string;
  band?: string;
};

export function PosterPage({ src, title, band = "#51020c" }: PosterPageProps) {
  return (
    <div
      className="poster-page"
      style={
        {
          "--poster-band": band,
          "--poster-image": `url("${src}")`,
        } as CSSProperties
      }
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={title}
        className="poster-page__photo"
        draggable={false}
        decoding="async"
      />
    </div>
  );
}
