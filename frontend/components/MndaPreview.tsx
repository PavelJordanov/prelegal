import {
  coverPageSummary,
  fillPlaceholders,
  partyFieldConfig,
  standardTermsSections,
  type MndaFormData,
  type PartyDetails,
} from "@/lib/mnda-content";

function PartyColumn({ label, party }: { label: string; party: PartyDetails }) {
  return (
    <div className="space-y-1 text-sm">
      <p className="font-semibold text-zinc-900">{label}</p>
      {partyFieldConfig.map((field) => (
        <p key={field.key}>{party[field.key] || field.placeholder}</p>
      ))}
    </div>
  );
}

export default function MndaPreview({ data }: { data: MndaFormData }) {
  return (
    <article className="max-w-none space-y-6 text-sm text-zinc-800">
      <header>
        <h1 className="text-xl font-bold text-zinc-900">
          Mutual Non-Disclosure Agreement
        </h1>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900">Cover Page</h2>

        {coverPageSummary(data).map((item) => (
          <div key={item.label}>
            <h3 className="font-semibold text-zinc-900">{item.label}</h3>
            <p>{item.value}</p>
          </div>
        ))}

        <div className="grid grid-cols-2 gap-4 border-t border-zinc-200 pt-3">
          <PartyColumn label="Party 1" party={data.party1} />
          <PartyColumn label="Party 2" party={data.party2} />
        </div>
      </section>

      <section className="space-y-4 border-t border-zinc-200 pt-4">
        <h2 className="text-lg font-semibold text-zinc-900">Standard Terms</h2>
        {standardTermsSections.map((section) => (
          <div key={section.title}>
            <h3 className="font-semibold text-zinc-900">{section.title}</h3>
            <p className="whitespace-pre-wrap">{fillPlaceholders(section.body, data)}</p>
          </div>
        ))}
      </section>
    </article>
  );
}
