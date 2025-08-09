import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { updateUser } from "@/store/slices/usersSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { login as apiLogin } from "@/services/auth";

export default function SettingsPage() {
  useEffect(() => { document.title = "Paramètres | VaultPro"; }, []);

  const { user } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();

  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [password, setPassword] = useState("");
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [currentPass, setCurrentPass] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const save = () => {
    if (!user) return;
    if (password) {
      setVerifyOpen(true);
      return;
    }
    dispatch(updateUser({ id: user.id, firstName, lastName, login: user.login, password: password || "admin123", createdAt: user.createdAt }));
    toast.success("Profil mis à jour");
  };

  const confirmSave = async () => {
    if (!user) return;
    try {
      setVerifyLoading(true);
      setVerifyError(null);
      await apiLogin(user.login, currentPass);
      dispatch(updateUser({ id: user.id, firstName, lastName, login: user.login, password: password || "admin123", createdAt: user.createdAt }));
      toast.success("Profil mis à jour");
      setVerifyOpen(false);
      setCurrentPass("");
    } catch (e) {
      setVerifyError("Mot de passe du compte incorrect.");
    } finally {
      setVerifyLoading(false);
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader><CardTitle className="text-base">Profil</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Prénom" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          <Input placeholder="Nom" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          <Input type="password" placeholder="Nouveau mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button onClick={save}>Enregistrer</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Options d'export</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">Configuration des formats et colonnes à exporter (à venir).</p>
        </CardContent>
      </Card>
      <Dialog open={verifyOpen} onOpenChange={setVerifyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer votre identité</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Saisissez le mot de passe de votre compte pour enregistrer les modifications sensibles.</p>
            <Input
              type="password"
              placeholder="Mot de passe du compte"
              value={currentPass}
              onChange={(e) => setCurrentPass(e.target.value)}
            />
            {verifyError && <p className="text-sm text-destructive">{verifyError}</p>}
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setVerifyOpen(false)}>Annuler</Button>
              <Button onClick={confirmSave} disabled={!currentPass || verifyLoading}>{verifyLoading ? "Vérification..." : "Confirmer"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
