export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 bg-background px-6 text-center">
      <h1 className="text-3xl font-bold text-navy sm:text-4xl">
        Senac <span className="text-navy">Resource</span>
        <span className="text-orange">Hub</span>
      </h1>
      <p className="text-base text-muted-foreground sm:text-lg">
        Sistema de Reservas de Laboratórios e Equipamentos
      </p>
      <p className="mt-4 text-sm font-medium text-muted-foreground">
        &ldquo;Fundação do projeto configurada com sucesso.&rdquo;
      </p>
    </main>
  );
}
