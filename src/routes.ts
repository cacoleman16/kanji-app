import type { Jlpt } from "@/types";

/** Discriminated union of every screen the App can show. */
export type Route =
  | { name: "home" }
  | { name: "deck"; deckId: string }
  | { name: "group"; groupId: string }
  | { name: "study"; deckId: string; includeAll?: boolean }
  | { name: "mixedReview" }
  | { name: "mixedStudy"; jlpt: Jlpt | "all" }
  | { name: "stats" }
  | { name: "settings" }
  | { name: "myDecks" }
  | { name: "myDeckEdit"; deckId: string }
  | { name: "myDeckImport"; deckId: string }
  | { name: "paywall"; reason?: string };
