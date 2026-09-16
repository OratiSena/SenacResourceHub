import Link from "next/link";

export default function RootNotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 bg-background px-6 text-center">
      <h1 className="text-3xl font-bold text-navy">Página não encontrada</h1>
      <p className="text-base text-muted-foreground">
        O endereço acessado não existe ou foi movido.
      </p>
      <Link
        href="/"
        className="mt-4 inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/80"
      >
        Voltar para o início
      </Link>
    </main>
  );
}
