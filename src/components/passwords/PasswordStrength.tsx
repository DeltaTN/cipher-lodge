import React from "react";
import { cn } from "@/lib/utils";

export type StrengthLevel = "faible" | "moyen" | "fort" | "très fort";

function evaluateStrength(pw: string): { score: number; level: StrengthLevel } {
  let score = 0;
  if (!pw) return { score: 0, level: "faible" };
  const lengthBonus = pw.length >= 12 ? 2 : pw.length >= 8 ? 1 : 0;
  score += lengthBonus;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score += 1;
  if (/[0-9]/.test(pw)) score += 1;
  if (/[^a-zA-Z0-9]/.test(pw)) score += 1;
  // cap to 4 for our 4-segment meter
  score = Math.min(score, 4);
  let level: StrengthLevel = "faible";
  if (score >= 4) level = "très fort";
  else if (score === 3) level = "fort";
  else if (score === 2) level = "moyen";
  else level = "faible";
  return { score, level };
}

function colorForLevel(level: StrengthLevel): { segment: string; text: string } {
  switch (level) {
    case "faible":
      return { segment: "bg-destructive", text: "text-destructive" };
    case "moyen":
      return { segment: "bg-accent", text: "text-accent-foreground" };
    case "fort":
      return { segment: "bg-secondary", text: "text-secondary-foreground" };
    case "très fort":
      return { segment: "bg-primary", text: "text-primary" };
  }
}

export function PasswordStrength({ password, className }: { password: string; className?: string }) {
  const { score, level } = evaluateStrength(password);
  const colors = colorForLevel(level);
  const segments = 4;

  return (
    <div className={cn("flex items-center gap-2", className)} aria-label="Indicateur de sécurité du mot de passe">
      <div className="flex items-center gap-1 w-28" role="meter" aria-valuemin={0} aria-valuemax={segments} aria-valuenow={score}>
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded",
              i < score ? colors.segment : "bg-muted"
            )}
          />
        ))}
      </div>
      <span className={cn("text-xs font-medium", colors.text)}>
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </span>
    </div>
  );
}
