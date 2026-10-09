import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import type { User } from "@/types/user"

export function MembersTable({
  users,
  total,
  isPending,
}: {
  users?: User[]
  total?: number
  isPending: boolean
}) {
  return (
    <div className="rounded-2xl border bg-card p-3">
      <Table>
        <TableHeader>
          <TableRow className="border-0 bg-sidebar-accent hover:bg-sidebar-accent">
            <TableHead className="h-10 rounded-l-lg px-4 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Tên
            </TableHead>
            <TableHead className="h-10 rounded-r-lg px-4 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Số điện thoại
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isPending &&
            Array.from({ length: 5 }, (_, i) => (
              <TableRow key={i}>
                <TableCell className="px-4 py-4">
                  <Skeleton className="h-4 w-40" />
                </TableCell>
                <TableCell className="px-4 py-4">
                  <Skeleton className="h-4 w-28" />
                </TableCell>
              </TableRow>
            ))}
          {users?.map((user) => (
            <TableRow key={user._id}>
              <TableCell className="px-4 py-4 font-medium">
                {user.fullName ?? "—"}
              </TableCell>
              <TableCell className="px-4 py-4 text-muted-foreground">
                {user.phoneNumber}
              </TableCell>
            </TableRow>
          ))}
          {users?.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={2}
                className="py-10 text-center text-muted-foreground"
              >
                Không tìm thấy hội viên
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {users && users.length > 0 && (
        <p className="px-4 pt-3 pb-1 text-sm text-muted-foreground">
          {total} người
        </p>
      )}
    </div>
  )
}
