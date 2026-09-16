import { LegalPage } from "@/components/common/legal-page";

export default function PrivacidadePage() {
  return (
    <LegalPage title="Política de Privacidade">
      <p>
        Coletamos apenas os dados necessários para o funcionamento do sistema:
        nome, e-mail e, opcionalmente, telefone, curso, unidade/campus e
        matrícula, além do histórico das suas próprias reservas.
      </p>
      <p>
        Sua senha nunca é armazenada em texto puro — a autenticação é
        gerenciada pelo Supabase Auth, que aplica hashing seguro de senhas.
      </p>
      <p>
        Você pode consultar e atualizar seus dados de perfil a qualquer
        momento, e solicitar a exclusão da sua conta. Ao excluir a conta, seus
        dados pessoais são anonimizados; o histórico de reservas é mantido de
        forma agregada para preservar a integridade do sistema, sem
        identificá-lo.
      </p>
      <p>
        Administradores do sistema podem visualizar reservas e dados de
        usuários exclusivamente para fins de gestão dos recursos do Senac.
      </p>
      <p>
        Este sistema não coleta nem processa dados biométricos. Por ser um
        projeto acadêmico, esta política é simplificada para fins didáticos e
        não substitui uma política de privacidade formal de produção.
      </p>
    </LegalPage>
  );
}
