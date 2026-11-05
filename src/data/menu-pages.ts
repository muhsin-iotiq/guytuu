export type MenuPage = {
  id: string;
  title: string;
  kind: "cover" | "poster" | "back";
  src?: string;
  paper?: string;
  cream?: string;
  band?: string;
};

export const MENU_PAGES: MenuPage[] = [
  {
    id: "cover",
    title: "Kapak",
    kind: "cover",
    paper: "/assets/paper/mercimek-paper.jpg",
  },
  {
    id: "guytu",
    title: "Guytu Çeşitleri",
    kind: "poster",
    src: "/assets/menu-guytu.jpg",
    paper: "/assets/paper/guytu-paper.jpg",
    cream: "#e6be9b",
    band: "#51010b",
  },
  {
    id: "pilav-doner",
    title: "Pilav Üstü Döner",
    kind: "poster",
    src: "/assets/menu-pilav-ustu-doner.jpg",
    paper: "/assets/paper/pilav-paper.jpg",
    cream: "#fadec6",
    band: "#55020f",
  },
  {
    id: "mercimek",
    title: "Mercimek Çorbası",
    kind: "poster",
    src: "/assets/menu-mercimek-corbasi.jpg",
    paper: "/assets/paper/mercimek-paper.jpg",
    cream: "#f4d3b2",
    band: "#51020c",
  },
  {
    id: "icecek",
    title: "İçecekler",
    kind: "poster",
    src: "/assets/menu-icecek.jpg",
    paper: "/assets/paper/icecek-paper.jpg",
    cream: "#f4d5b6",
    band: "#57020f",
  },
  {
    id: "guytu-kayik",
    title: "Guytu Kayık · Yakında",
    kind: "poster",
    src: "/assets/menu-guytu-kayik-yakinda.jpg",
    paper: "/assets/paper/kayik-paper.jpg",
    cream: "#f6d5b6",
    band: "#4e010e",
  },
  {
    id: "back",
    title: "Afiyet olsun",
    kind: "back",
    paper: "/assets/paper/icecek-paper.jpg",
  },
];

export const BOOK_PAGE_COUNT = MENU_PAGES.length;
export const LOGO_MARK = "/assets/logo-mark.png";
export const WAVE_SRC = "/assets/slices/wave.jpg";
