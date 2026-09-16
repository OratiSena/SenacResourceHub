export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
        Senac <span className="text-blue-900">Resource</span>
        <span className="text-orange-500">Hub</span>
      </h1>
      <p className="text-base text-slate-600 sm:text-lg">
        Sistema de Reservas de Laboratórios e Equipamentos
      </p>
      <p className="mt-4 text-sm font-medium text-slate-500">
        &ldquo;Fundação do projeto configurada com sucesso.&rdquo;
      </p>
    </main>
  );
}
