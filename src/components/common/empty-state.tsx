type EmptyStateProps = {
  title: string
  description?: string
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="px-5 py-10 text-center text-[13.5px] text-muted-foreground">
      <b className="mb-1 block text-[15px] font-semibold text-foreground">
        {title}
      </b>
      {description}
    </div>
  )
}
