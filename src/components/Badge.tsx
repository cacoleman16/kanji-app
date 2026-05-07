/**
 * Tiny inline badge — used on Settings labels ("iOS only", "Pro") and
 * deck tiles ("Pro"). Three pre-set variants so call-sites don't need
 * to repeat the inline-style block.
 */
import type { CSSProperties, ReactNode } from "react";

export type BadgeVariant = "muted" | "pro" | "good";

const VARIANT_STYLES: Record<BadgeVariant, CSSProperties> = {
  muted: {
    color: "var(--text-dim)",
    background: "var(--surface-2)",
  },
  pro: {
    color: "var(--accent)",
    background: "var(--accent-soft)",
  },
  good: {
    color: "var(--good)",
    background: "var(--good-soft)",
  },
};

const BASE: CSSProperties = {
  fontSize: 9,
  fontWeight: 600,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  padding: "2px 6px",
  borderRadius: 4,
  display: "inline-block",
  whiteSpace: "nowrap",
};

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
}

export function Badge({ children, variant = "muted" }: BadgeProps) {
  return <span style={{ ...BASE, ...VARIANT_STYLES[variant] }}>{children}</span>;
}
