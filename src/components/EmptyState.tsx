import type { ReactNode } from "react";

interface EmptyStateProps {
  /**
   * One- or two-character JP "mark" rendered in the JP serif at the top.
   * Picks a kanji whose meaning fits the screen — e.g. 始 (start) for a
   * "create your first deck" prompt, 静 (calm) for "all caught up", etc.
   */
  mark?: string;
  title: string;
  body?: ReactNode;
  /** Optional CTA button (typically a primary-btn). */
  cta?: ReactNode;
  /** Optional second-tier action — rendered as a quiet underline link. */
  secondary?: ReactNode;
  /** Extra inline style (e.g. marginTop) for tight layout integration. */
  style?: React.CSSProperties;
}

/**
 * Reusable empty-state card. Already-styled callers like Stats and MyDecks
 * used the raw `.empty-state` markup directly; this component formalizes the
 * pattern so new screens (Home, DeckDetail-no-search-results, MixedReview)
 * stay visually consistent.
 *
 * Tone is "encouraging, not apologetic" — every empty state should explain
 * either what to do next or why this is the empty path (e.g. "all caught
 * up — come back tomorrow").
 */
export function EmptyState({ mark, title, body, cta, secondary, style }: EmptyStateProps) {
  return (
    <div className="empty-state" style={style}>
      {mark && (
        <div className="empty-state-mark" lang="ja" aria-hidden>
          {mark}
        </div>
      )}
      <div className="empty-state-title">{title}</div>
      {body && <div className="empty-state-body">{body}</div>}
      {cta && <div className="empty-state-cta">{cta}</div>}
      {secondary && <div className="empty-state-secondary">{secondary}</div>}
    </div>
  );
}
