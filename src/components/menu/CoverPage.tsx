"use client";

import { motion } from "motion/react";
import { LOGO_MARK } from "@/data/menu-pages";

const EASE = [0.22, 1, 0.36, 1] as const;

type CoverPageProps = {
  animate: boolean;
};

export function CoverPage({ animate }: CoverPageProps) {
  return (
    <div className="cover-page">
      <div className="cover-page__wash" aria-hidden />
      <div className="cover-page__frame" aria-hidden />

      <div className="cover-page__content">
        <motion.img
          src={LOGO_MARK}
          alt="Guytu Döner"
          className="cover-page__logo"
          draggable={false}
          initial={animate ? { opacity: 0, y: 28 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.9, ease: EASE }}
        />

        <motion.div
          className="cover-page__gold-line"
          aria-hidden
          initial={animate ? { scaleX: 0 } : false}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.85, duration: 0.55, ease: EASE }}
        />

        <motion.p
          className="cover-page__menu-label"
          initial={animate ? { opacity: 0, letterSpacing: "0.38em" } : false}
          animate={{ opacity: 1, letterSpacing: "0.22em" }}
          transition={{ delay: 1.15, duration: 0.55, ease: EASE }}
        >
          menü
        </motion.p>
      </div>

      <motion.p
        className="cover-page__hint"
        initial={animate ? { opacity: 0, y: 10 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.7, duration: 0.5, ease: EASE }}
      >
        sayfayı çevirin
      </motion.p>

      <div className="cover-page__wave" aria-hidden />
    </div>
  );
}
