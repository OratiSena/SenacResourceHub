export function AuthLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
        RH
      </div>
      <div className="leading-tight">
        <p className="text-base font-bold text-navy">Senac ResourceHub</p>
        <p className="text-xs text-muted-foreground">
          Sistema de Reservas de Laboratórios e Equipamentos
        </p>
      </div>
    </div>
  );
}
