import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirm: string;
}

const schema: yup.ObjectSchema<RegisterForm> = yup
  .object({
    firstName: yup.string().required("Prénom requis"),
    lastName: yup.string().required("Nom requis"),
    email: yup.string().email("Email invalide").required("Email requis"),
    password: yup.string().min(6, "6 caractères minimum").required("Mot de passe requis"),
    confirm: yup
      .string()
      .oneOf([yup.ref("password")], "Les mots de passe ne correspondent pas")
      .required("Confirmation requise"),
  })
  .required();

export default function RegisterPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Inscription | VaultPro";
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: yupResolver(schema) as any,
    defaultValues: { firstName: "", lastName: "", email: "", password: "", confirm: "" },
  });

  const [step, setStep] = useState<1 | 2>(1);
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [emailForOtp, setEmailForOtp] = useState("");

  const onSubmit = handleSubmit(async (data) => {
    // Étape 1: inscription (mock) + envoi du code (mock)
    setEmailForOtp(data.email);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setStep(2);
    toast.info("Code de vérification envoyé à votre email (démo)");
    // TODO: Brancher l'envoi d'email réel via Supabase Auth (OTP) une fois connecté
  });

  const verifyOtp = () => {
    if (otp === generatedOtp && emailForOtp) {
      toast.success("Email vérifié. Compte activé (démo)");
      navigate("/login");
    } else {
      toast.error("Code invalide");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <Helmet>
        <title>Inscription | VaultPro</title>
        <meta name="description" content="Inscription VaultPro avec vérification par email (OTP)." />
        <link rel="canonical" href="/register" />
      </Helmet>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="w-full max-w-xl">
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-center text-xl">{step === 1 ? "Créer un compte" : "Vérifier votre email"}</CardTitle>
          </CardHeader>
          <CardContent>
            {step === 1 ? (
              <form onSubmit={onSubmit} className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Input placeholder="Prénom" {...register("firstName")} />
                    {errors.firstName && <p className="text-sm text-destructive mt-1">{errors.firstName.message}</p>}
                  </div>
                  <div>
                    <Input placeholder="Nom" {...register("lastName")} />
                    {errors.lastName && <p className="text-sm text-destructive mt-1">{errors.lastName.message}</p>}
                  </div>
                </div>
                <div>
                  <Input type="email" placeholder="Email" {...register("email")} />
                  {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Input type="password" placeholder="Mot de passe" {...register("password")} />
                    {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
                  </div>
                  <div>
                    <Input type="password" placeholder="Confirmer le mot de passe" {...register("confirm")} />
                    {errors.confirm && <p className="text-sm text-destructive mt-1">{errors.confirm.message}</p>}
                  </div>
                </div>
                <Button type="submit" className="w-full">S'inscrire</Button>
                <p className="text-xs text-muted-foreground text-center">
                  En continuant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
                </p>
              </form>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  Nous avons envoyé un code à <span className="font-medium">{emailForOtp}</span>. Saisissez-le pour activer votre compte.
                </p>
                <div className="flex justify-center">
                  <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" className="w-full" onClick={() => setStep(1)}>Retour</Button>
                  <Button className="w-full" onClick={verifyOtp} disabled={otp.length !== 6}>Vérifier</Button>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Astuce: en prod, ce code est envoyé par email via Supabase Auth.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
