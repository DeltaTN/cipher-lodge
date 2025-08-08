import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function MaskedPassword({ password }: { password: string }) {
  const [revealed, setRevealed] = useState(false);
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");

  const handleReveal = () => {
    setOpen(true);
  };

  const onConfirm = () => {
    if (confirm === password) {
      setRevealed(true);
      setOpen(false);
      setConfirm("");
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
            <DialogTitle>Confirmer pour afficher</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Pour des raisons de sécurité, retapez le mot de passe de l'équipement pour l'afficher.</p>
            <Input
              type="password"
              placeholder="Retapez le mot de passe"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setOpen(false)}>Annuler</Button>
              <Button onClick={onConfirm} disabled={!confirm}>Confirmer</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
