import type { DocumentContent, PartyBlock } from "@/lib/documents/types";

function PartyColumn({ block }: { block: PartyBlock }) {
  return (
    <div className="space-y-1 text-sm">
      <p className="font-semibold text-zinc-900">{block.label}</p>
      {block.fieldConfig.map((field) => (
        <p key={field.key}>{block.data[field.key] || field.placeholder}</p>
      ))}
    </div>
  );
}

export default function DocumentPreview<TFields>({
  content,
  data,
}: {
  content: DocumentContent<TFields>;
  data: TFields;
}) {
  const parties = content.parties(data);

  return (
    <article className="max-w-none space-y-6 text-sm text-zinc-800">
      <header>
        <h1 className="text-xl font-bold text-zinc-900">{content.title}</h1>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900">{content.summaryHeading}</h2>

        {content.summarySections(data).map((item) => (
          <div key={item.label}>
            <h3 className="font-semibold text-zinc-900">{item.label}</h3>
            <p>{item.value}</p>
          </div>
        ))}

        {parties.length > 0 && (
          <div
            className="grid gap-4 border-t border-zinc-200 pt-3"
            style={{ gridTemplateColumns: `repeat(${parties.length}, minmax(0, 1fr))` }}
          >
            {parties.map((block) => (
              <PartyColumn key={block.label} block={block} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4 border-t border-zinc-200 pt-4">
        <h2 className="text-lg font-semibold text-zinc-900">Standard Terms</h2>
        {content.bodySections(data).map((section) => (
          <div key={section.title}>
            <h3 className="font-semibold text-zinc-900">{section.title}</h3>
            <p className="whitespace-pre-wrap">{section.body}</p>
          </div>
        ))}
      </section>
    </article>
  );
}
