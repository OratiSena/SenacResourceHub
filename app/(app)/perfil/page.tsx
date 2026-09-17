import { redirect } from "next/navigation";

import { getMyFullProfile } from "@/lib/data/profile";
import { PageHeader } from "@/components/common/page-header";
import { DeleteAccountButton } from "@/components/perfil/delete-account-button";
import { UpdateNameForm } from "@/components/perfil/update-name-form";
import { UpdatePasswordForm } from "@/components/perfil/update-password-form";

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

  return (
    <div className="max-w-2xl space-y-8 pb-8">
      <PageHeader
        eyebrow="Perfil"
        title="Meu Perfil"
        description="Gerencie seus dados pessoais e sua conta."
      />

      <section className="space-y-3 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-navy">Dados cadastrais</h2>
        <dl className="grid gap-3 sm:grid-cols-2">
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
          {profile.categoria ? (
            <div>
              <dt className="text-xs text-muted-foreground">Categoria</dt>
              <dd className="text-sm font-medium text-navy">
                {CATEGORIA_LABELS[profile.categoria] ?? profile.categoria}
              </dd>
            </div>
          ) : null}
        </dl>
        <p className="text-xs text-muted-foreground">
          O e-mail não pode ser alterado nesta versão do sistema.
        </p>
      </section>

      <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-navy">Alterar nome</h2>
        <UpdateNameForm nomeAtual={profile.nome} />
      </section>

      <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-navy">Alterar senha</h2>
        <UpdatePasswordForm />
      </section>

      <section className="space-y-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-6">
        <h2 className="text-lg font-semibold text-destructive">Zona de risco</h2>
        <p className="text-sm text-muted-foreground">
          Excluir sua conta cancela suas reservas futuras e remove seu acesso
          ao sistema. Esta ação não pode ser facilmente desfeita.
        </p>
        <DeleteAccountButton />
      </section>
    </div>
  );
}
