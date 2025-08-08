import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchUsers, AppUser, addUser, updateUser, deleteUser } from "@/store/slices/usersSlice";
import { exportToCSV, exportToPDF } from "@/services/export";
import { useReactTable, getCoreRowModel, flexRender, createColumnHelper } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

export default function UsersPage() {
  useEffect(() => { document.title = "Utilisateurs | VaultPro"; }, []);

  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((s) => s.users);
  const [search, setSearch] = useState("");

  useEffect(() => { if (items.length === 0) dispatch(fetchUsers()); }, [dispatch, items.length]);

  const columnHelper = createColumnHelper<AppUser>();
  const columns = useMemo(() => [
    columnHelper.accessor("firstName", { header: "Prénom" }),
    columnHelper.accessor("lastName", { header: "Nom" }),
    columnHelper.accessor("login", { header: "Login" }),
    columnHelper.display({ id: "actions", header: "Actions", cell: ({ row }) => <RowActions user={row.original} /> }),
  ], []);

  const data = useMemo(() => items.filter(u => `${u.firstName} ${u.lastName} ${u.login}`.toLowerCase().includes(search.toLowerCase())), [items, search]);

  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Gestion des utilisateurs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col md:flex-row gap-2 items-stretch md:items-center justify-between">
              <Input placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} />
              <div className="flex gap-2">
                <AddEditDialog />
                <Button variant="secondary" onClick={() => exportToCSV(items, "utilisateurs")}>Exporter CSV</Button>
                <Button variant="secondary" onClick={() => exportToPDF(items as any, "utilisateurs")}>Exporter PDF</Button>
              </div>
            </div>
            <div className="rounded-md border overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  {table.getHeaderGroups().map((hg) => (
                    <tr key={hg.id}>
                      {hg.headers.map((header) => (
                        <th key={header.id} className="text-left px-3 py-2 font-medium">
                          {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td className="px-3 py-4" colSpan={columns.length}>Chargement...</td></tr>
                  ) : table.getRowModel().rows.length ? (
                    table.getRowModel().rows.map((row) => (
                      <tr key={row.id} className="border-t">
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="px-3 py-2">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr><td className="px-3 py-4" colSpan={columns.length}>Aucune donnée</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function RowActions({ user }: { user: AppUser }) {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);

  return (
    <div className="flex gap-2">
      <AddEditDialog existing={user} onOpenChange={setOpen} open={open} />
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>Modifier</Button>
      <AlertDialog open={confirm}>
        <Button variant="destructive" size="sm" onClick={() => setConfirm(true)}>Supprimer</Button>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirm(false)}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => { dispatch(deleteUser(user.id)); toast.success("Supprimé"); setConfirm(false); }}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function AddEditDialog({ existing, open, onOpenChange }: { existing?: AppUser; open?: boolean; onOpenChange?: (o: boolean) => void }) {
  const dispatch = useAppDispatch();
  const [localOpen, setLocalOpen] = useState(false);
  const controlled = typeof open === "boolean" && !!onOpenChange;
  const isEdit = !!existing;

  const [form, setForm] = useState<Partial<AppUser>>(existing || { firstName: "", lastName: "", login: "", password: "" });

  const setField = (k: keyof AppUser, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const doSave = () => {
    if (!form.firstName || !form.lastName || !form.login) return toast.error("Champs requis manquants");
    if (isEdit) {
      dispatch(updateUser(form as AppUser));
      toast.success("Modifié");
    } else {
      // @ts-ignore
      dispatch(addUser(form));
      toast.success("Ajouté");
    }
    (controlled ? onOpenChange! : setLocalOpen)(false);
  };

  const openState = controlled ? open! : localOpen;
  const setOpenState = controlled ? onOpenChange! : setLocalOpen;

  return (
    <Dialog open={openState} onOpenChange={setOpenState}>
      {!isEdit && (
        <DialogTrigger asChild>
          <Button>Ajouter</Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Modifier l'utilisateur" : "Nouvel utilisateur"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-2">
          <Input placeholder="Prénom" value={form.firstName || ""} onChange={(e) => setField("firstName", e.target.value)} />
          <Input placeholder="Nom" value={form.lastName || ""} onChange={(e) => setField("lastName", e.target.value)} />
          <Input placeholder="Login" value={form.login || ""} onChange={(e) => setField("login", e.target.value)} />
          {!isEdit && <Input type="password" placeholder="Mot de passe" value={(form as any).password || ""} onChange={(e) => setField("password", e.target.value)} />}
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="secondary" onClick={() => setOpenState(false)}>Annuler</Button>
            <Button onClick={doSave}>{isEdit ? "Enregistrer" : "Créer"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
