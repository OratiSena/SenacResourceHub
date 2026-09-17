import { requireAdminProfile } from "@/lib/auth/require-admin";
import { getAdminUsers } from "@/lib/data/admin";
import { formatDataLocal } from "@/lib/reservations/format";
import { UserRoleButton } from "@/components/admin/user-role-button";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function AdminUsuariosPage() {
  const currentProfile = await requireAdminProfile();
  const users = await getAdminUsers();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Usuários"
        description="Promova usuários a administrador ou remova esse acesso."
      />

      <div className="rounded-xl border border-info/20 bg-info/5 p-4 text-sm text-info">
        Para criar o primeiro administrador do sistema, execute no SQL Editor
        do Supabase:{" "}
        <code className="rounded bg-info/10 px-1.5 py-0.5 font-mono text-xs">
          UPDATE public.profiles SET role=&apos;admin&apos; WHERE
          email=&apos;EMAIL_DO_ADMIN_ESCOLHIDO&apos;;
        </code>
      </div>

      {users.length === 0 ? (
        <EmptyState title="Nenhum usuário cadastrado." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Papel</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Cadastro</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium text-navy">
                    {user.nome}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        user.role === "admin"
                          ? "border-primary/20 bg-primary/10 text-primary"
                          : "border-muted-foreground/20 bg-muted text-muted-foreground"
                      }
                    >
                      {user.role === "admin" ? "Administrador" : "Usuário"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        user.status === "active"
                          ? "border-success/20 bg-success/10 text-success"
                          : "border-destructive/20 bg-destructive/10 text-destructive"
                      }
                    >
                      {user.status === "active" ? "Ativo" : "Excluído"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDataLocal(user.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    {user.status === "active" ? (
                      <UserRoleButton
                        userId={user.id}
                        role={user.role}
                        isSelf={user.id === currentProfile.id}
                      />
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
