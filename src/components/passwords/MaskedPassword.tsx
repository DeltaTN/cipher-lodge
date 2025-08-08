import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAppSelector } from "@/store";
import { login as apiLogin } from "@/services/auth";

export function MaskedPassword({ password }: { password: string }) {
  const [revealed, setRevealed] = useState(false);
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = useAppSelector((s) => s.auth.user);

  const handleReveal = () => {
    setError(null);
    setConfirm("");
    setOpen(true);
  };

  const onConfirm = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      await apiLogin(user.login, confirm);
      setRevealed(true);
      setOpen(false);
      setConfirm("");
    } catch (e) {
      setError("Mot de passe du compte incorrect.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span>{revealed ? password : "••••••••"}</span>
      {revealed ? (
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setRevealed(false)} aria-label="Masquer le mot de passe">
          <EyeOff className="h-4 w-4" />
        </Button>
      ) : (
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleReveal} aria-label="Afficher le mot de passe">
          <Eye className="h-4 w-4" />
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer votre identité</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Pour des raisons de sécurité, saisissez le mot de passe de votre compte pour afficher ce mot de passe.</p>
            <Input
              type="password"
              placeholder="Mot de passe du compte"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setOpen(false)}>Annuler</Button>
              <Button onClick={onConfirm} disabled={!confirm || loading}>{loading ? "Vérification..." : "Confirmer"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
