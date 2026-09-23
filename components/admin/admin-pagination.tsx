import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface AdminPaginationProps {
  page: number;
  pageSize: number;
  total: number;
  /** Monta a URL para uma página específica (preserva os demais filtros da rota). */
  buildHref: (page: number) => string;
}

/**
 * Paginação real via query param (?page=N), nunca client-side sobre um
 * dataset já carregado por inteiro — buildHref é responsabilidade da
 * página, que já sabe quais outros filtros preservar na URL.
 */
export function AdminPagination({ page, pageSize, total, buildHref }: AdminPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (total === 0) return null;

  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  const pageNumbers = new Set<number>([1, totalPages, page, page - 1, page + 1].filter(
    (p) => p >= 1 && p <= totalPages,
  ));
  const sorted = Array.from(pageNumbers).sort((a, b) => a - b);

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
      <p className="text-sm text-muted-foreground">
        {startItem}–{endItem} de {total}
      </p>
      <Pagination className="mx-0 w-auto">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href={page > 1 ? buildHref(page - 1) : undefined}
              aria-disabled={page <= 1}
              className={page <= 1 ? "pointer-events-none opacity-50" : undefined}
            />
          </PaginationItem>
          {sorted.map((p, i) => {
            const prev = sorted[i - 1];
            const showEllipsisBefore = prev != null && p - prev > 1;
            return (
              <span key={p} className="flex items-center">
                {showEllipsisBefore ? (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : null}
                <PaginationItem>
                  <PaginationLink href={buildHref(p)} isActive={p === page}>
                    {p}
                  </PaginationLink>
                </PaginationItem>
              </span>
            );
          })}
          <PaginationItem>
            <PaginationNext
              href={page < totalPages ? buildHref(page + 1) : undefined}
              aria-disabled={page >= totalPages}
              className={page >= totalPages ? "pointer-events-none opacity-50" : undefined}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
