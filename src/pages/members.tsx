import { SearchIcon } from "lucide-react"

import { Input } from "@/components/ui/input"
import { MemberFilters } from "@/features/members/components/member-filters"
import { MembersTable } from "@/features/members/components/members-table"
import { MembersPagination } from "@/features/members/components/members-pagination"
import { useMemberFilters } from "@/features/members/hooks/use-member-filters"
import { useMembers } from "@/features/members/hooks/use-members"

export function MembersPage() {
  const { role, setRole, search, setSearch, page, setPage, params } =
    useMemberFilters()
  const { data, isPending } = useMembers(params)

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold">Hội viên</h1>
        <p className="text-sm text-muted-foreground">
          Hồ sơ, thẻ và lịch sử của từng hội viên
        </p>
      </div>
      <div className="relative">
        <SearchIcon className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tên hoặc số điện thoại"
          className="h-11 rounded-xl bg-card pl-10"
        />
      </div>
      <MemberFilters value={role} onChange={setRole} counts={data?.counts} />
      <MembersTable
        users={data?.users}
        total={data?.pagination.total}
        isPending={isPending}
      />
      <MembersPagination
        page={page}
        totalPages={data?.pagination.totalPages ?? 1}
        onChange={setPage}
      />
    </div>
  )
}
