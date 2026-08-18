import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/hooks/useAuth";
import { ApiError } from "@/lib/api";

const schema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .refine((value) => value.includes("@") && Boolean(value.split("@", 2)[1]), {
      message: "Enter a valid email.",
    }),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const login = useLogin();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: FormValues) {
    try {
      await login.mutateAsync(values);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Could not sign in.";
      toast.error(message);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md border border-border bg-card p-8 sm:p-10">
        <p className="eyebrow text-muted-foreground">HOORAIN</p>
        <h1 className="mt-3 font-display text-4xl">Admin</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to manage the edit, orders, and WhatsApp confirmations.
        </p>
        <form className="mt-8 space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
            {form.formState.errors.email ? (
              <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              {...form.register("password")}
            />
            {form.formState.errors.password ? (
              <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
            ) : null}
          </div>
          <Button type="submit" className="w-full eyebrow h-11" disabled={login.isPending}>
            {login.isPending ? "Signing in" : "Sign in"}
          </Button>
        </form>
        <p className="mt-6 text-xs text-muted-foreground">Internal use only. The public storefront is unchanged.</p>
      </div>
    </div>
  );
}
