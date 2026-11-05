declare module "page-flip/dist/js/page-flip.module.js" {
  export interface PageFlipEvent {
    data: number | string;
  }

  export class PageFlip {
    constructor(element: HTMLElement, settings: Record<string, unknown>);
    loadFromHTML(items: NodeListOf<Element> | HTMLElement[]): void;
    on(event: "flip", callback: (e: PageFlipEvent) => void): void;
    on(event: "init", callback: (e: PageFlipEvent) => void): void;
    flipNext(corner?: "top" | "bottom"): void;
    flipPrev(corner?: "top" | "bottom"): void;
    getCurrentPageIndex(): number;
    getPageCount(): number;
    destroy(): void;
  }
}
