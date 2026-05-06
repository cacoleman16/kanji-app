import { useState } from "react";

import type { AppState } from "@/types";

interface OnboardingProps {
  setState: (updater: (s: AppState) => AppState) => void;
}

const TOTAL = 3;

export function Onboarding({ setState }: OnboardingProps) {
  const [step, setStep] = useState<0 | 1 | 2>(0);

  const finish = () =>
    setState((s) => ({ ...s, settings: { ...s.settings, onboardingComplete: true } }));

  const next = () => {
    if (step === TOTAL - 1) finish();
    else setStep((s) => ((s + 1) as 0 | 1 | 2));
  };

  return (
    <div className="onboarding">
      {step === 0 && (
        <div className="onboarding-step">
          <div className="onboarding-mark">道</div>
          <div className="onboarding-title">Welcome to Kanjido</div>
          <div className="onboarding-body">
            <strong style={{ color: "var(--text)" }}>Kanjido</strong> means "the way of kanji"
            (漢字 + 道). Like judo or kendo, it's a practice you walk a little every day. We'll
            do the heavy lifting on scheduling so you can focus on the characters.
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="onboarding-step">
          <div className="onboarding-mark" style={{ fontSize: 80 }}>
            学
          </div>
          <div className="onboarding-title">Spaced repetition, automatic</div>
          <div className="onboarding-body">
            Tap the card to flip it. Then rate how well you knew it. Kanjido remembers and brings
            each card back exactly when you're about to forget.
          </div>
          <div className="onboarding-rating-demo" aria-hidden>
            <div className="onboarding-rating-cell again">
              Again
              <span className="onboarding-rating-interval">10m</span>
            </div>
            <div className="onboarding-rating-cell hard">
              Hard
              <span className="onboarding-rating-interval">1d</span>
            </div>
            <div className="onboarding-rating-cell good">
              Good
              <span className="onboarding-rating-interval">6d</span>
            </div>
            <div className="onboarding-rating-cell easy">
              Easy
              <span className="onboarding-rating-interval">8d</span>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="onboarding-step">
          <div className="onboarding-mark">始</div>
          <div className="onboarding-title">Pick where to start</div>
          <div className="onboarding-body">
            Three free decks come pre-loaded — one of these is your first session:
          </div>
          <div className="onboarding-card">
            <div className="onboarding-card-row">
              <span className="onboarding-card-icon">あ</span>
              <div className="onboarding-card-text">
                <strong>Hiragana</strong> — the 46 sounds of Japanese. Start here if you're brand
                new.
              </div>
            </div>
            <div className="onboarding-card-row">
              <span className="onboarding-card-icon">ア</span>
              <div className="onboarding-card-text">
                <strong>Katakana</strong> — same sounds, sharper forms. For loanwords and
                emphasis.
              </div>
            </div>
            <div className="onboarding-card-row">
              <span className="onboarding-card-icon">日</span>
              <div className="onboarding-card-text">
                <strong>JLPT N5</strong> — your first 80 kanji. The gateway to reading Japanese.
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="onboarding-controls">
        <div className="onboarding-dots" aria-label={`Step ${step + 1} of ${TOTAL}`}>
          {Array.from({ length: TOTAL }).map((_, i) => (
            <div key={i} className={`onboarding-dot ${i === step ? "active" : ""}`} />
          ))}
        </div>
        <button className="onboarding-cta" onClick={next}>
          {step === TOTAL - 1 ? "Start studying" : "Continue"}
        </button>
        {step < TOTAL - 1 && (
          <button className="onboarding-skip" onClick={finish}>
            Skip intro
          </button>
        )}
      </div>
    </div>
  );
}
