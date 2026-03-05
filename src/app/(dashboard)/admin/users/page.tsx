"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/lib/i18n";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  _count: { submittedFlats: number; reviews: number };
};

const ROLES = ["LANDLORD", "RENTER", "MODERATOR", "ADMIN"];

const roleVariant: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  ADMIN: "destructive",
  MODERATOR: "default",
  LANDLORD: "secondary",
  RENTER: "outline",
};

export default function AdminUsersPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.status === 403) {
        router.push("/");
        return;
      }
      if (!res.ok) throw new Error("Failed to load users");
      const data = await res.json();
      setUsers(data.users);
    } catch {
      setError(t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeRole = async (userId: string, role: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-requested-with": "XMLHttpRequest",
        },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.message || t("common.error"));
        return;
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role } : u)),
      );
    } catch {
      alert(t("common.error"));
    }
  };

  const deleteUser = async (userId: string, userName: string) => {
    if (!confirm(`${t("admin.confirmDeleteUser")} (${userName})`)) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: { "x-requested-with": "XMLHttpRequest" },
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.message || t("common.error"));
        return;
      }
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch {
      alert(t("common.error"));
    }
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Link
            href="/admin"
            className="text-sm text-muted-foreground hover:underline"
          >
            {t("admin.dashboard")}
          </Link>
          <h1 className="text-3xl font-bold mt-1">{t("admin.users")}</h1>
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground">{t("common.loading")}</p>
      ) : error ? (
        <p className="text-destructive">{error}</p>
      ) : users.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {t("common.noResults")}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <Card key={user.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">{user.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                  <Badge variant={roleVariant[user.role] ?? "outline"}>
                    {user.role}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">
                  {t("admin.userJoined")}:{" "}
                  {new Date(user.createdAt).toLocaleDateString("de-DE")}
                  {" \u00b7 "}
                  {t("admin.userFlats")}: {user._count.submittedFlats}
                  {" \u00b7 "}
                  {t("admin.userReviews")}: {user._count.reviews}
                </p>
                <div className="flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        {t("admin.changeRole")}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {ROLES.map((r) => (
                        <DropdownMenuItem
                          key={r}
                          onClick={() => changeRole(user.id, r)}
                          className={user.role === r ? "bg-accent" : ""}
                        >
                          {r}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteUser(user.id, user.name)}
                  >
                    {t("admin.deleteUser")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
