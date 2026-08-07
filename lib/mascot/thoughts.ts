import { pickThought, hourBucket, type ThoughtKind } from "./personality";

export function speak(kind: ThoughtKind) {
  if (typeof window === "undefined") return;
  const text = pickThought(kind);
  window.dispatchEvent(
    new CustomEvent("animenexus:mascot-thought", { detail: { text, kind } }),
  );
}

export function ambientHourThought() {
  const b = hourBucket();
  if (b === "night") speak("night");
  else if (b === "morning") speak("morning");
  else speak("idle");
}
