import { motion } from "motion/react";

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  align?: 'center' | 'left' | 'right';
}

export const SectionTitle = ({ title, subtitle, align = 'center' }: SectionTitleProps) => (
  <div className={`mb-8 md:mb-12 ${align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'}`}>
    {subtitle && (
      <motion.span
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-primary font-black text-[10px] md:text-xs uppercase tracking-[0.3em] mb-2 md:mb-3 block"
      >
        {subtitle}
      </motion.span>
    )}
    <motion.h2
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.1 }}
      className="text-3xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-[0.9]"
    >
      {title}
    </motion.h2>
  </div>
);
