import { PageError, PageLoading } from "@/components/common/query-state"
import { PageHeader } from "@/components/layout/page-header"
import { PERMISSIONS } from "@/features/access/permissions"
import { usePermissions } from "@/features/access/use-permissions"
import { useCurrentUser } from "@/features/auth/hooks/use-auth"
import { AccountInfoCard } from "@/features/settings/components/account-info-card"
import { AppliedRulesCard } from "@/features/settings/components/applied-rules-card"
import { PaymentAccountCard } from "@/features/settings/components/payment-account-card"
import { StoreInfoCard } from "@/features/settings/components/store-info-card"
import { useSettings } from "@/features/settings/hooks/use-settings"

export function SettingsPage() {
  const settings = useSettings()
  const { data: user } = useCurrentUser()
  const { can } = usePermissions()
  const canEdit = can(PERMISSIONS.settingsUpdate)

  if (settings.isPending) return <PageLoading />
  if (settings.error) {
    return (
      <PageError
        error={settings.error}
        onRetry={() => void settings.refetch()}
      />
    )
  }

  const { store, paymentAccount, rules } = settings.data

  return (
    <>
      <PageHeader
        breadcrumb="Hệ thống / Cài đặt"
        title="Cài đặt"
        description="Thông tin điểm, tài khoản và thanh toán"
      />
      <div className="grid items-start gap-x-5 lg:grid-cols-2">
        <div>
          {user && <AccountInfoCard user={user} />}
          <StoreInfoCard store={store} canEdit={canEdit} />
        </div>
        <div>
          <PaymentAccountCard
            // Đổi key khi tài khoản đổi để form lấy lại giá trị mới.
            key={paymentAccount?.updatedAt ?? "none"}
            account={paymentAccount}
            canEdit={canEdit}
          />
          <AppliedRulesCard rules={rules} />
        </div>
      </div>
    </>
  )
}
