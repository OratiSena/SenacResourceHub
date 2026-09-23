import { getAdminUsers } from "@/lib/data/admin";
import { requireAdminProfile } from "@/lib/auth/require-admin";
import { formatDataLocal } from "@/lib/reservations/format";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { UserRoleButton } from "@/components/admin/user-role-button";
import { UserRowActions } from "@/components/admin/user-row-actions";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SearchParams {
  page?: string;
  search?: string;
  role?: string;
  status?: string;
}

function buildHref(params: SearchParams, overrides: Partial<SearchParams>) {
  const merged = { ...params, ...overrides };
  const qs = new URLSearchParams();
  if (merged.search) qs.set("search", merged.search);
  if (merged.role) qs.set("role", merged.role);
  if (merged.status) qs.set("status", merged.status);
  if (merged.page && merged.page !== "1") qs.set("page", merged.page);
  const str = qs.toString();
  return `/admin/usuarios${str ? `?${str}` : ""}`;
}

export default async function AdminUsuariosPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const currentProfile = await requireAdminProfile();
  const params = await searchParams;
  const role = params.role === "user" || params.role === "admin" ? params.role : undefined;
  const status = params.status === "active" || params.status === "deleted" ? params.status : undefined;

  const { items: users, total, page, pageSize } = await getAdminUsers({
    page: params.page ? Number(params.page) : 1,
    search: params.search,
    role,
    status,
  });

  const hasFilters = Boolean(params.search || role || status);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Usuários"
        description="Consulte usuários, promova administradores e gerencie contas."
      />

      <div className="rounded-xl border border-info/20 bg-info/5 p-4 text-sm text-info">
        Para criar o primeiro administrador do sistema, execute no SQL Editor
        do Supabase:{" "}
        <code className="rounded bg-info/10 px-1.5 py-0.5 font-mono text-xs">
          UPDATE public.profiles SET role=&apos;admin&apos; WHERE
          email=&apos;EMAIL_DO_ADMIN_ESCOLHIDO&apos;;
        </code>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-card p-4">
        <div className="min-w-48 flex-1 space-y-1.5">
          <label htmlFor="search" className="text-xs font-medium text-muted-foreground">
            Buscar por nome ou e-mail
          </label>
          <Input id="search" name="search" defaultValue={params.search} placeholder="Ex.: Ana Silva" />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="role" className="text-xs font-medium text-muted-foreground">
            Papel
          </label>
          <Select name="role" defaultValue={role ?? "todos"}>
            <SelectTrigger id="role" className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="user">Usuário</SelectItem>
              <SelectItem value="admin">Administrador</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="status" className="text-xs font-medium text-muted-foreground">
            Status
          </label>
          <Select name="status" defaultValue={status ?? "todos"}>
            <SelectTrigger id="status" className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="deleted">Excluído</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" size="sm">
          Filtrar
        </Button>
        {hasFilters ? (
          <Button asChild type="button" variant="ghost" size="sm">
            <a href="/admin/usuarios">Limpar filtros</a>
          </Button>
        ) : null}
      </form>

      <p className="text-sm text-muted-foreground">
        {total} {total === 1 ? "usuário encontrado" : "usuários encontrados"}
      </p>

      {users.length === 0 ? (
        <EmptyState
          title="Nenhum usuário encontrado."
          description={hasFilters ? "Tente ajustar a busca ou os filtros." : undefined}
        />
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-2xl border border-border bg-card lg:block">
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
                {users.map((user) => {
                  const isSelf = user.id === currentProfile.id;
                  return (
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
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <UserRowActions user={user} isSelf={isSelf} />
                          {user.status === "active" ? (
                            <UserRoleButton
                              userId={user.id}
                              nome={user.nome}
                              role={user.role}
                              isSelf={isSelf}
                            />
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-3 lg:hidden">
            {users.map((user) => {
              const isSelf = user.id === currentProfile.id;
              return (
                <div
                  key={user.id}
                  className="space-y-3 rounded-2xl border border-border bg-card p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-navy">{user.nome}</p>
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
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
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Cadastro: {formatDataLocal(user.createdAt)}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <UserRowActions user={user} isSelf={isSelf} />
                    {user.status === "active" ? (
                      <UserRoleButton
                        userId={user.id}
                        nome={user.nome}
                        role={user.role}
                        isSelf={isSelf}
                      />
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <AdminPagination
        page={page}
        pageSize={pageSize}
        total={total}
        buildHref={(p) => buildHref(params, { page: String(p) })}
      />
    </div>
  );
}
