import { LegalPage } from "@/components/common/legal-page";

export default function TermosPage() {
  return (
    <LegalPage title="Termos de Uso">
      <p>
        Ao criar uma conta no Senac ResourceHub, você concorda em utilizar o
        sistema exclusivamente para consultar disponibilidade e reservar
        laboratórios, equipamentos e espaços do Centro Universitário Senac.
      </p>
      <p>
        Cada reserva vincula um usuário a um recurso e a um período
        específico. O usuário é responsável pelo uso adequado do recurso
        reservado e por seguir as orientações de segurança de cada espaço ou
        equipamento, quando aplicável.
      </p>
      <p>
        Reservas podem ser canceladas pelo próprio usuário até 2 dias antes do
        horário de início, ou a qualquer momento por um administrador,
        conforme as regras operacionais do sistema.
      </p>
      <p>
        O uso indevido do sistema, incluindo tentativas de burlar as regras de
        reserva ou de acesso administrativo, pode resultar na suspensão da
        conta.
      </p>
      <p>
        Este sistema foi desenvolvido como projeto acadêmico e pode passar por
        alterações a qualquer momento durante o período letivo.
      </p>
    </LegalPage>
  );
}
