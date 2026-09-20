import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";

import { logoutAction } from "@/lib/actions/auth";
import { getMyFullProfile } from "@/lib/data/profile";
import { PageHeader } from "@/components/common/page-header";
import { DeleteAccountButton } from "@/components/perfil/delete-account-button";
import { ProfileHeader } from "@/components/perfil/profile-header";
import { UpdateNameForm } from "@/components/perfil/update-name-form";
import { UpdatePasswordForm } from "@/components/perfil/update-password-form";
import { Button } from "@/components/ui/button";

const CATEGORIA_LABELS: Record<string, string> = {
  aluno: "Aluno",
  professor: "Professor",
  tecnico: "Técnico",
};

export default async function PerfilPage() {
  const profile = await getMyFullProfile();

  if (!profile) {
    redirect("/login");
  }

  const roleLabel =
    profile.role === "admin"
      ? "Administrador"
      : (profile.categoria ? CATEGORIA_LABELS[profile.categoria] : null) ?? "Usuário";

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        eyebrow="Perfil"
        title="Meu Perfil"
        description="Gerencie seus dados pessoais e sua conta."
      />

      <ProfileHeader
        nome={profile.nome}
        email={profile.email}
        roleLabel={roleLabel}
        isAdmin={profile.role === "admin"}
        status={profile.status}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr] lg:items-start">
        <div className="space-y-6">
          <section className="space-y-3 rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-navy">Dados da conta</h2>
            <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div>
                <dt className="text-xs text-muted-foreground">E-mail</dt>
                <dd className="text-sm font-medium text-navy">{profile.email}</dd>
              </div>
              {profile.telefone ? (
                <div>
                  <dt className="text-xs text-muted-foreground">Telefone</dt>
                  <dd className="text-sm font-medium text-navy">{profile.telefone}</dd>
                </div>
              ) : null}
              {profile.curso ? (
                <div>
                  <dt className="text-xs text-muted-foreground">Curso</dt>
                  <dd className="text-sm font-medium text-navy">{profile.curso}</dd>
                </div>
              ) : null}
              {profile.unidadeCampus ? (
                <div>
                  <dt className="text-xs text-muted-foreground">Unidade / Campus</dt>
                  <dd className="text-sm font-medium text-navy">
                    {profile.unidadeCampus}
                  </dd>
                </div>
              ) : null}
              {profile.matricula ? (
                <div>
                  <dt className="text-xs text-muted-foreground">Matrícula</dt>
                  <dd className="font-mono text-sm font-medium text-navy">
                    {profile.matricula}
                  </dd>
                </div>
              ) : null}
            </dl>
            <p className="text-xs text-muted-foreground">
              O e-mail não pode ser alterado nesta versão do sistema.
            </p>
          </section>

          <section className="space-y-3 rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-navy">Sessão</h2>
            <p className="text-sm text-muted-foreground">
              Encerre sua sessão neste dispositivo.
            </p>
            <form action={logoutAction}>
              <Button type="submit" variant="outline" size="sm">
                <LogOut aria-hidden="true" />
                Sair da conta
              </Button>
            </form>
          </section>

          <section className="space-y-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-6">
            <h2 className="text-lg font-semibold text-destructive">Zona de risco</h2>
            <h3 className="text-sm font-semibold text-navy">Excluir conta</h3>
            <p className="text-sm text-muted-foreground">
              A exclusão cancela suas reservas futuras e remove seu acesso ao
              sistema. O histórico necessário é preservado de forma
              anonimizada.
            </p>
            <DeleteAccountButton />
          </section>
        </div>

        <div className="space-y-6">
          <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-navy">Dados pessoais</h2>
            <UpdateNameForm nomeAtual={profile.nome} />
          </section>

          <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-navy">Segurança</h2>
            <p className="text-sm text-muted-foreground">Alterar senha</p>
            <UpdatePasswordForm />
          </section>
        </div>
      </div>
    </div>
  );
}
