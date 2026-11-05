import type { MenuPage } from "@/data/menu-pages";
import { BackCover } from "./BackCover";
import { CoverPage } from "./CoverPage";
import { PosterPage } from "./PosterPage";

type MenuPageViewProps = {
  page: MenuPage;
  playIntro: boolean;
};

export function MenuPageView({ page, playIntro }: MenuPageViewProps) {
  if (page.kind === "cover") {
    return <CoverPage animate={playIntro} />;
  }

  if (page.kind === "back") {
    return <BackCover />;
  }

  return (
    <PosterPage
      src={page.src ?? ""}
      title={page.title}
      band={page.band ?? "#51020c"}
    />
  );
}
