import type { Variants } from "framer-motion";

export const pageVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show:   { opacity: 1, y: 0,  transition: { duration: 0.32, ease: [0.25, 0.1, 0.25, 1] } },
  exit:   { opacity: 0, y: -6, transition: { duration: 0.18 } },
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0,  transition: { duration: 0.38, ease: [0.25, 0.1, 0.25, 1] } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1,        transition: { duration: 0.28 } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  show:   { opacity: 1, scale: 1,    transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } },
};

export const slideLeft: Variants = {
  hidden: { opacity: 0, x: -16 },
  show:   { opacity: 1, x: 0,  transition: { duration: 0.32, ease: [0.25, 0.1, 0.25, 1] } },
};

export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.065, delayChildren: 0.05 } },
};

export const staggerFast: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04, delayChildren: 0.02 } },
};

export const cardHover = {
  rest:  { y: 0,  boxShadow: "0 1px 3px rgba(0,0,0,0.2)",  transition: { duration: 0.2, ease: "easeOut" } },
  hover: { y: -3, boxShadow: "0 8px 25px rgba(99,102,241,0.15)", transition: { duration: 0.2, ease: "easeOut" } },
};

export const buttonTap = { scale: 0.97 };
