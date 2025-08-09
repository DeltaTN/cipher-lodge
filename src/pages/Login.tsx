import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useAppDispatch, useAppSelector } from "@/store";
import { login } from "@/store/slices/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface LoginForm {
  login: string;
  password: string;
}

const schema: yup.ObjectSchema<LoginForm> = yup
  .object({
    login: yup.string().required("Login requis"),
    password: yup.string().required("Mot de passe requis"),
  })
  .required();

export default function LoginPage() {
  useEffect(() => {
    document.title = "Connexion | VaultPro";
  }, []);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error, token } = useAppSelector((s) => s.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: yupResolver(schema) as any, defaultValues: { login: "", password: "" } });

  useEffect(() => {
    if (token) navigate("/dashboard");
  }, [token, navigate]);

  const onSubmit = handleSubmit(async (data) => {
    const res = await dispatch(login({ login: data.login, password: data.password }));
    // @ts-ignore
    if (res.error) {
      toast.error(error || "Échec de la connexion");
    } else {
      toast.success("Connexion réussie");
      navigate("/dashboard");
    }
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-xl">Connexion sécurisée</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <Input placeholder="Login" {...register("login")} />
                {errors.login && <p className="text-sm text-destructive mt-1">{errors.login.message}</p>}
              </div>
              <div>
                <Input type="password" placeholder="Mot de passe" {...register("password")} />
                {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Connexion..." : "Se connecter"}
              </Button>
              <div className="mt-3 text-center text-sm text-muted-foreground">
                Pas de compte ? <Link to="/register" className="story-link text-primary">Inscrivez-vous</Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
