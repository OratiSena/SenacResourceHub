"use client";

import { useRouter } from "next/navigation";

import type { AdminResourceOption } from "@/lib/data/admin";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ResourcePicker({
  resources,
  selectedId,
}: {
  resources: AdminResourceOption[];
  selectedId: string;
}) {
  const router = useRouter();

  return (
    <Select
      value={selectedId}
      onValueChange={(value) => router.push(`/admin/unidades?resourceId=${value}`)}
    >
      <SelectTrigger className="w-full sm:w-72">
        <SelectValue placeholder="Selecione um recurso" />
      </SelectTrigger>
      <SelectContent>
        {resources.map((resource) => (
          <SelectItem key={resource.id} value={resource.id}>
            {resource.nome}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
