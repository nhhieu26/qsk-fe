import { InfoRow, SectionCard } from "@/components/common/section-card"
import type { AppliedRule, RuleGroup } from "@/features/settings/types"

const GROUP_LABELS: Record<RuleGroup, string> = {
  sales: "Bán hàng & điểm Mi",
  shipping: "Vận chuyển",
  stock: "Kho",
}

const GROUP_ORDER: readonly RuleGroup[] = ["sales", "shipping", "stock"]

export function AppliedRulesCard({ rules }: { rules: readonly AppliedRule[] }) {
  return (
    <SectionCard title="Quy tắc đang áp dụng">
      <div className="grid gap-5">
        {GROUP_ORDER.map((group) => {
          const items = rules.filter((r) => r.group === group)
          if (items.length === 0) return null
          return (
            <div key={group}>
              <h3 className="mb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {GROUP_LABELS[group]}
              </h3>
              {items.map((rule) => (
                <InfoRow
                  key={rule.label}
                  label={<span className="font-normal">{rule.label}</span>}
                >
                  <span className="text-right font-bold text-foreground">
                    {rule.value}
                  </span>
                </InfoRow>
              ))}
            </div>
          )
        })}
      </div>
    </SectionCard>
  )
}
