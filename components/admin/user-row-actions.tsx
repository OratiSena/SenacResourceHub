"use client";

import { useState, useTransition } from "react";

import { fetchAdminUserDetailAction } from "@/lib/actions/admin";
import type { AdminUserDetail, AdminUserItem } from "@/lib/data/admin";
import { UserDetailDialog } from "@/components/admin/user-detail-dialog";
import { Button } from "@/components/ui/button";

export function UserRowActions({ user, isSelf }: { user: AdminUserItem; isSelf: boolean }) {
  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleOpen() {
    startTransition(async () => {
      const result = await fetchAdminUserDetailAction(user.id);
      setDetail(result);
      setOpen(true);
    });
  }

  return (
    <>
      <Button variant="outline" size="sm" disabled={pending} onClick={handleOpen}>
        {pending ? "Abrindo..." : "Ver detalhes"}
      </Button>
      {detail ? (
        <UserDetailDialog user={detail} isSelf={isSelf} open={open} onOpenChange={setOpen} />
      ) : null}
    </>
  );
}
