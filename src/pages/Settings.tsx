import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { updateUser } from "@/store/slices/usersSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";

export default function SettingsPage() {
  useEffect(() => { document.title = "Paramètres | VaultPro"; }, []);

  const { user } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();

  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [password, setPassword] = useState("");

  const save = () => {
    if (!user) return;
    dispatch(updateUser({ id: user.id, firstName, lastName, login: user.login, password: password || "admin123", createdAt: user.createdAt }));
    toast.success("Profil mis à jour");
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
    </div>
  );
}
