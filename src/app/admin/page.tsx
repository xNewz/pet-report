"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserProfile, UserRole } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { ShieldAlert, User, ShieldCheck, Loader2, Trash2, AlertTriangle, Search } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AdminPage() {
  const { userProfile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let isCancelled = false;

    async function loadUsers() {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        if (isCancelled) return;
        const usersData: UserProfile[] = [];
        querySnapshot.forEach((doc) => {
          usersData.push(doc.data() as UserProfile);
        });
        setUsers(usersData);
      } catch (error) {
        if (isCancelled) return;
        console.error("Error fetching users:", error);
        toast.error("Failed to load users. Please check your permissions.");
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    loadUsers();

    return () => {
      isCancelled = true;
    };
  }, []);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (userId === userProfile?.uid && newRole !== "admin") {
      toast.error("You cannot remove your own admin privileges.");
      return;
    }

    try {
      setUpdating(userId);
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { role: newRole });
      
      setUsers(users.map(u => u.uid === userId ? { ...u, role: newRole } : u));
      toast.success("User role updated successfully");
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update user role.");
    } finally {
      setUpdating(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    if (userToDelete.uid === userProfile?.uid) {
      toast.error("คุณไม่สามารถลบบัญชีของตนเองได้");
      setUserToDelete(null);
      return;
    }

    try {
      setDeletingId(userToDelete.uid);
      const userRef = doc(db, "users", userToDelete.uid);
      await deleteDoc(userRef);

      setUsers((prev) => prev.filter((u) => u.uid !== userToDelete.uid));
      toast.success(
        `ลบผู้ใช้งาน "${userToDelete.displayName || userToDelete.email || userToDelete.uid}" สำเร็จ`
      );
      setUserToDelete(null);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("เกิดข้อผิดพลาดในการลบผู้ใช้งาน กรุณาลองใหม่อีกครั้ง");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    const nameMatch = u.displayName?.toLowerCase().includes(query);
    const emailMatch = u.email?.toLowerCase().includes(query);
    const uidMatch = u.uid.toLowerCase().includes(query);
    return Boolean(nameMatch || emailMatch || uidMatch);
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8 px-4 mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <ShieldAlert className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground text-sm">
              จัดการบทบาทและสมาชิกในระบบ ({users.length} คน)
            </p>
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="ค้นหาชื่อหรืออีเมล..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-card border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Current Role</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const isCurrentUser = u.uid === userProfile?.uid;
                const isProcessing = updating === u.uid || deletingId === u.uid;

                return (
                  <tr key={u.uid} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-border shrink-0">
                          <AvatarImage src={u.photoURL || undefined} alt={u.displayName || "User"} />
                          <AvatarFallback className="font-bold text-xs bg-primary/10 text-primary">
                            {u.displayName?.charAt(0)?.toUpperCase() || <User className="w-4 h-4" />}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <div className="font-medium text-foreground truncate max-w-[200px] flex items-center gap-1.5">
                            <span>{u.displayName || "Unknown User"}</span>
                            {isCurrentUser && (
                              <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium shrink-0">
                                คุณ
                              </span>
                            )}
                          </div>
                          <div className="text-muted-foreground text-xs truncate max-w-[200px]">
                            {u.email || u.uid}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {u.role === "admin" && <ShieldAlert className="w-4 h-4 text-rose-500" />}
                        {u.role === "official" && <ShieldCheck className="w-4 h-4 text-blue-500" />}
                        {u.role === "user" && <User className="w-4 h-4 text-slate-500" />}
                        <span className="capitalize font-medium">{u.role}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <select
                          className="bg-background border rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none disabled:opacity-50"
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.uid, e.target.value as UserRole)}
                          disabled={isProcessing}
                        >
                          <option value="user">User</option>
                          <option value="official">Official</option>
                          <option value="admin">Admin</option>
                        </select>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-30"
                          disabled={isCurrentUser || isProcessing}
                          title={isCurrentUser ? "ไม่สามารถลบบัญชีของตนเองได้" : "ลบผู้ใช้งาน"}
                          onClick={() => setUserToDelete(u)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>

                        {updating === u.uid && (
                          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">
                    {searchQuery ? "ไม่พบผู้ใช้งานที่ตรงกับคำค้นหา" : "No users found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Dialog for Deleting User */}
      <Dialog
        open={!!userToDelete}
        onOpenChange={(open) => {
          if (!open && !deletingId) setUserToDelete(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 mb-2">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <DialogTitle className="text-center text-lg font-semibold">
              ยืนยันการลบผู้ใช้งาน
            </DialogTitle>
            <DialogDescription className="text-center text-sm pt-1">
              คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้งาน{" "}
              <span className="font-semibold text-foreground">
                &ldquo;{userToDelete?.displayName || userToDelete?.email || userToDelete?.uid}&rdquo;
              </span>
              ? ข้อมูลโปรไฟล์จะถูกลบออกจากระบบและไม่สามารถกู้คืนได้
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex sm:justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setUserToDelete(null)}
              disabled={!!deletingId}
            >
              ยกเลิก
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={!!deletingId}
              className="gap-2"
            >
              {deletingId ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  กำลังลบ...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  ยืนยันการลบ
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
