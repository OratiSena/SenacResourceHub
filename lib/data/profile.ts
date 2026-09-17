import { createClient } from "@/lib/supabase/server";

export interface FullProfile {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  curso: string | null;
  unidadeCampus: string | null;
  matricula: string | null;
  categoria: string | null;
  role: "user" | "admin";
  status: "active" | "deleted";
}

/** Perfil completo da própria pessoa, para a tela /perfil. */
export async function getMyFullProfile(): Promise<FullProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, nome, email, telefone, curso, unidade_campus, matricula, categoria, role, status",
    )
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    nome: data.nome,
    email: data.email,
    telefone: data.telefone,
    curso: data.curso,
    unidadeCampus: data.unidade_campus,
    matricula: data.matricula,
    categoria: data.categoria,
    role: data.role,
    status: data.status,
  };
}
