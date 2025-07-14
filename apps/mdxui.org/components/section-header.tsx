interface SectionHeaderProps {
  title: string
}

export function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8 border-b pb-4">
      <h1 className="font-display text-3xl font-bold">{title}</h1>
    </div>
  )
} 