import { getCurrentProfile } from "@/lib/auth/current-profile";
import { PageHeader } from "@/components/common/page-header";

/**
 * Home provisória (Prompt 4, seção 19) — só confirma que a autenticação e o
 * profile real estão funcionando de ponta a ponta. O dashboard completo
 * (próximas reservas, atalhos, destaques) vem no próximo prompt.
 */
export default async function HomePage() {
  const profile = await getCurrentProfile();
  const primeiroNome = profile?.nome.split(" ")[0] ?? "";

  return (
    <PageHeader
      eyebrow="Home"
      title={`Olá, ${primeiroNome}`}
      description="Bem-vindo ao Senac ResourceHub. O dashboard completo, com suas próximas reservas e atalhos, será implementado na próxima etapa."
    />
  );
}
