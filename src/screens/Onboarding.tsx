import { useRef, useState, type ChangeEvent } from "react";

import { isNative, listBackupFiles, readBackupFile, type BackupFileInfo } from "@/native/bridge";
import { parseImport } from "@/storage/state";
import type { AppState } from "@/types";

interface OnboardingProps {
  setState: (updater: (s: AppState) => AppState) => void;
}

const TOTAL = 3;

export function Onboarding({ setState }: OnboardingProps) {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  /** Latest iCloud backup found on tap of "Restore" (iOS only). */
  const [foundBackup, setFoundBackup] = useState<BackupFileInfo | null>(null);
  const [restoreBusy, setRestoreBusy] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);

  const finish = () =>
    setState((s) => ({ ...s, settings: { ...s.settings, onboardingComplete: true } }));

  const next = () => {
    if (step === TOTAL - 1) finish();
    else setStep((s) => ((s + 1) as 0 | 1 | 2));
  };

  /** Replace the fresh state with an imported backup and skip onboarding. */
  const applyBackup = (text: string) => {
    const imported = parseImport(text); // throws on bad payloads
    setState(() => ({
      ...imported,
      settings: { ...imported.settings, onboardingComplete: true },
    }));
  };

  /**
   * Entry point for "Already used Kanjido?". On iOS, look for iCloud
   * backups first and offer the newest; on web (or when none exist) fall
   * straight through to the file picker.
   */
  const startRestore = async () => {
    setRestoreError(null);
    if (isNative()) {
      setRestoreBusy(true);
      try {
        const files = await listBackupFiles();
        if (files.length > 0) {
          setFoundBackup(files[0]);
          return;
        }
      } finally {
        setRestoreBusy(false);
      }
    }
    fileInputRef.current?.click();
  };

  const restoreFromICloud = async () => {
    if (!foundBackup) return;
    setRestoreBusy(true);
    setRestoreError(null);
    try {
      const text = await readBackupFile(foundBackup.name);
      if (!text) throw new Error(`Couldn't read ${foundBackup.name}.`);
      applyBackup(text);
    } catch (err) {
      setRestoreError((err as Error).message);
      setRestoreBusy(false);
    }
  };

  const handleRestoreFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setRestoreError(null);
    try {
      applyBackup(await file.text());
    } catch (err) {
      setRestoreError(`That file doesn't look like a Kanjido backup: ${(err as Error).message}`);
    }
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

        {foundBackup ? (
          <div className="onboarding-restore-card" role="group" aria-label="Backup found">
            <div className="onboarding-restore-title">Backup found in iCloud</div>
            <div className="onboarding-restore-sub">{foundBackup.name}</div>
            <button className="onboarding-cta" onClick={restoreFromICloud} disabled={restoreBusy}>
              {restoreBusy ? "Restoring…" : "Restore this backup"}
            </button>
            <button
              className="onboarding-skip"
              onClick={() => {
                setFoundBackup(null);
                fileInputRef.current?.click();
              }}
            >
              Choose a different file
            </button>
          </div>
        ) : (
          <>
            <button className="onboarding-cta" onClick={next}>
              {step === TOTAL - 1 ? "Start studying" : "Continue"}
            </button>
            {step < TOTAL - 1 && (
              <button className="onboarding-skip" onClick={finish}>
                Skip intro
              </button>
            )}
            {step === 0 && (
              <button className="onboarding-skip" onClick={() => void startRestore()} disabled={restoreBusy}>
                {restoreBusy ? "Looking for backups…" : "Already used Kanjido? Restore a backup"}
              </button>
            )}
          </>
        )}

        {restoreError && (
          <div className="onboarding-restore-error" role="alert">
            {restoreError}
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          style={{ display: "none" }}
          onChange={(e) => void handleRestoreFile(e)}
          aria-hidden
        />
      </div>
    </div>
  );
}
