type OverviewStat = {
  label: string
  value: string | number
  toneClassName?: string
}

type Props = {
  badge: string
  title: string
  description: string
  stats: OverviewStat[]
}

export default function AdminOverview({ badge, title, description, stats }: Props) {
  return (
    <section className="ui-card overflow-hidden p-6 sm:p-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <div className="ui-badge ui-badge-info w-fit">{badge}</div>
          <h2 className="mt-4">{title}</h2>
          <p className="mt-3 text-sm leading-6 text-brand-text-muted">{description}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[34rem]">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-[22px] border border-brand-border/55 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(238,243,249,0.92)_100%)] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.92)]">
              <div className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-brand-text-muted">{stat.label}</div>
              <div className={`mt-2 text-3xl font-extrabold tracking-tighter ${stat.toneClassName ?? 'text-brand-text'}`}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}