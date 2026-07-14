import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { DocumentContent, PartyBlock } from "@/lib/documents/types";
import { NOTO_SANS_FAMILY, registerNotoSansFont } from "@/lib/pdf-fonts";

registerNotoSansFont();

const styles = StyleSheet.create({
  page: { padding: 48, fontSize: 10, lineHeight: 1.5, color: "#18181b", fontFamily: NOTO_SANS_FAMILY },
  title: { fontSize: 16, fontWeight: 700, marginBottom: 12 },
  h2: { fontSize: 13, fontWeight: 700, marginTop: 16, marginBottom: 8 },
  h3: { fontSize: 10.5, fontWeight: 700, marginTop: 8, marginBottom: 2 },
  paragraph: { marginBottom: 4 },
  partyRow: { flexDirection: "row", gap: 24, marginTop: 8 },
  partyColumn: { flex: 1 },
});

function PartyBlockView({ block }: { block: PartyBlock }) {
  return (
    <View style={styles.partyColumn}>
      <Text style={styles.h3}>{block.label}</Text>
      {block.fieldConfig.map((field) => (
        <Text key={field.key} style={styles.paragraph}>
          {block.data[field.key] || field.placeholder}
        </Text>
      ))}
    </View>
  );
}

export default function DocumentPdfDocument<TFields>({
  content,
  data,
}: {
  content: DocumentContent<TFields>;
  data: TFields;
}) {
  const parties = content.parties(data);

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.title}>{content.title}</Text>

        <Text style={styles.h2}>{content.summaryHeading}</Text>
        {content.summarySections(data).map((item) => (
          <View key={item.label}>
            <Text style={styles.h3}>{item.label}</Text>
            <Text style={styles.paragraph}>{item.value}</Text>
          </View>
        ))}

        {parties.length > 0 && (
          <View style={styles.partyRow}>
            {parties.map((block) => (
              <PartyBlockView key={block.label} block={block} />
            ))}
          </View>
        )}

        <Text style={styles.h2}>Standard Terms</Text>
        {content.bodySections(data).map((section) => (
          <View key={section.title}>
            <Text style={styles.h3}>{section.title}</Text>
            <Text style={styles.paragraph}>{section.body}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
}
