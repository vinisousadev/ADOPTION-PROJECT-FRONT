export const pageMotion = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: 'easeOut' },
} as const

export const revealMotion = {
  initial: { opacity: 0, y: 34 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.18 },
  transition: { duration: 0.65, ease: 'easeOut' },
} as const

export const staggerContainerMotion = {
  initial: 'hidden',
  whileInView: 'visible',
  viewport: { once: true, amount: 0.16 },
  variants: {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.12,
      },
    },
  },
} as const

export const staggerItemMotion = {
  variants: {
    hidden: { opacity: 0, y: 28, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.58, ease: 'easeOut' },
    },
  },
} as const

export const modalMotion = {
  initial: { opacity: 0, scale: 0.96, y: 18 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.96, y: 18 },
  transition: { duration: 0.22, ease: 'easeOut' },
} as const
