"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { toggleResourceAtivoAction } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";

export function ResourceActiveToggle({
  resourceId,
  ativo,
}: {
  resourceId: string;
  ativo: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await toggleResourceAtivoAction(resourceId, !ativo);
          router.refresh();
        })
      }
    >
      {ativo ? "Desativar" : "Ativar"}
    </Button>
  );
}
