import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchEquipments, Equipment, EquipmentType, addEquipment, updateEquipment, deleteEquipment } from "@/store/slices/equipmentSlice";
import { exportToCSV, exportToPDF } from "@/services/export";
import { useReactTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel, flexRender, createColumnHelper } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from "@/components/ui/alert-dialog";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { MaskedPassword } from "@/components/passwords/MaskedPassword";
import { PasswordStrength } from "@/components/passwords/PasswordStrength";

export default function PasswordsPage() {
  useEffect(() => {
    document.title = "Mots de passe | VaultPro";
  }, []);

  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((s) => s.equipment);
  const [globalFilter, setGlobalFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");

  useEffect(() => {
    if (items.length === 0) dispatch(fetchEquipments());
  }, [dispatch, items.length]);

  const columnHelper = createColumnHelper<Equipment>();
  const columns = useMemo(
    () => [
      columnHelper.accessor("name", { header: "Équipement" }),
      columnHelper.accessor("type", { header: "Type" }),
      columnHelper.accessor("ipAddress", { header: "IP" }),
      columnHelper.accessor("location", { header: "Emplacement" }),
      columnHelper.accessor("username", { header: "Utilisateur" }),
      columnHelper.accessor("password", {
        header: "Mot de passe",
        cell: ({ getValue }) => <MaskedPassword password={getValue() as string} />,
      }),
      columnHelper.display({
        id: "strength",
        header: "Sécurité",
        cell: ({ row }) => <PasswordStrength password={row.original.password} />,
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => <RowActions equipment={row.original} />,
      }),
    ],
    []
  );

  const filteredData = useMemo(() => {
    return items.filter((it) =>
      (typeFilter ? it.type === (typeFilter as EquipmentType) : true) &&
      (globalFilter
        ? Object.values(it).join(" ").toLowerCase().includes(globalFilter.toLowerCase())
        : true)
    );
  }, [items, globalFilter, typeFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Gestion des mots de passe</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col md:flex-row gap-2 items-stretch md:items-center justify-between">
              <div className="flex gap-2">
                <Input placeholder="Rechercher..." value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} />
                <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v === "all" ? "" : v)}>
                  <SelectTrigger className="w-48"><SelectValue placeholder="Filtrer par type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="ordinateur">Ordinateur</SelectItem>
                    <SelectItem value="serveur">Serveur</SelectItem>
                    <SelectItem value="routeur">Routeur</SelectItem>
                    <SelectItem value="switch">Switch</SelectItem>
                    <SelectItem value="point_d_acces">Point d'accès</SelectItem>
                    <SelectItem value="imprimante">Imprimante</SelectItem>
                    <SelectItem value="camera_ip">Caméra IP</SelectItem>
                    <SelectItem value="autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <AddEditDialog />
                <Button variant="secondary" onClick={() => exportToCSV(items, "equipements")}>Exporter CSV</Button>
                <Button variant="secondary" onClick={() => exportToPDF(items as any, "equipements")}>Exporter PDF</Button>
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

function RowActions({ equipment }: { equipment: Equipment }) {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);

  return (
    <div className="flex gap-2">
      <AddEditDialog existing={equipment} onOpenChange={setOpen} open={open} />
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>Modifier</Button>
      <AlertDialog open={confirm}>
        <Button variant="destructive" size="sm" onClick={() => setConfirm(true)}>Supprimer</Button>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirm(false)}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => { dispatch(deleteEquipment(equipment.id)); toast.success("Supprimé"); setConfirm(false); }}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function AddEditDialog({ existing, open, onOpenChange }: { existing?: Equipment; open?: boolean; onOpenChange?: (o: boolean) => void }) {
  const dispatch = useAppDispatch();
  const [localOpen, setLocalOpen] = useState(false);
  const controlled = typeof open === "boolean" && !!onOpenChange;
  const isEdit = !!existing;

  const [form, setForm] = useState<Partial<Equipment>>(
    existing || { name: "", type: "ordinateur", ipAddress: "", location: "", username: "", password: "" }
  );

  const setField = (k: keyof Equipment, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const doSave = () => {
    if (!form.name || !form.type) return toast.error("Nom et type requis");
    if (isEdit) {
      dispatch(updateEquipment(form as Equipment));
      toast.success("Modifié");
    } else {
      // @ts-ignore
      dispatch(addEquipment(form));
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
          <DialogTitle>{isEdit ? "Modifier l'équipement" : "Nouvel équipement"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-2">
          <Input placeholder="Nom" value={form.name || ""} onChange={(e) => setField("name", e.target.value)} />
          <Select value={form.type || "ordinateur"} onValueChange={(v) => setField("type", v as EquipmentType)}>
            <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ordinateur">Ordinateur</SelectItem>
              <SelectItem value="serveur">Serveur</SelectItem>
              <SelectItem value="routeur">Routeur</SelectItem>
              <SelectItem value="switch">Switch</SelectItem>
              <SelectItem value="point_d_acces">Point d'accès</SelectItem>
              <SelectItem value="imprimante">Imprimante</SelectItem>
              <SelectItem value="camera_ip">Caméra IP</SelectItem>
              <SelectItem value="autre">Autre</SelectItem>
            </SelectContent>
          </Select>
          <Input placeholder="Adresse IP" value={form.ipAddress || ""} onChange={(e) => setField("ipAddress", e.target.value)} />
          <Input placeholder="Emplacement" value={form.location || ""} onChange={(e) => setField("location", e.target.value)} />
          <Input placeholder="Nom d'utilisateur" value={form.username || ""} onChange={(e) => setField("username", e.target.value)} />
          <Input type="password" placeholder="Mot de passe" value={form.password || ""} onChange={(e) => setField("password", e.target.value)} />
          <PasswordStrength password={form.password || ""} />
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="secondary" onClick={() => setOpenState(false)}>Annuler</Button>
            <Button onClick={doSave}>{isEdit ? "Enregistrer" : "Créer"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
