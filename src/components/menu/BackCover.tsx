import { LOGO_MARK } from "@/data/menu-pages";

export function BackCover() {
  return (
    <div className="back-cover">
      <div className="cover-page__wash" aria-hidden />
      <div className="cover-page__frame" aria-hidden />
      <div className="back-cover__content">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={LOGO_MARK}
          alt=""
          className="back-cover__logo"
          draggable={false}
        />
        <div className="cover-page__gold-line" aria-hidden />
        <p className="back-cover__message">afiyet olsun</p>
      </div>
      <div className="cover-page__wave" aria-hidden />
    </div>
  );
}
