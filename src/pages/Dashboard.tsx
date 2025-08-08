import { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchEquipments } from "@/store/slices/equipmentSlice";
import { fetchUsers } from "@/store/slices/usersSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyRound, Users, Server } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  useEffect(() => {
    document.title = "Tableau de bord | VaultPro";
  }, []);

  const dispatch = useAppDispatch();
  const { items: equipments } = useAppSelector((s) => s.equipment);
  const { items: users } = useAppSelector((s) => s.users);

  useEffect(() => {
    if (equipments.length === 0) dispatch(fetchEquipments());
    if (users.length === 0) dispatch(fetchUsers());
  }, [dispatch, equipments.length, users.length]);

  const byType = useMemo(() => {
    const map: Record<string, number> = {};
    equipments.forEach((e) => {
      map[e.type] = (map[e.type] || 0) + 1;
    });
    return map;
  }, [equipments]);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Server className="h-4 w-4" /> Équipements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{equipments.length}</div>
            <p className="text-sm text-muted-foreground">Total d'équipements</p>
          </CardContent>
        </Card>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Users className="h-4 w-4" /> Utilisateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{users.length}</div>
            <p className="text-sm text-muted-foreground">Total d'utilisateurs</p>
          </CardContent>
        </Card>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><KeyRound className="h-4 w-4" /> Par type</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1">
              {Object.entries(byType).map(([type, count]) => (
                <li key={type} className="flex justify-between"><span>{type}</span><span className="font-medium">{count}</span></li>
              ))}
              {Object.keys(byType).length === 0 && <li className="text-muted-foreground">Aucune donnée</li>}
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
