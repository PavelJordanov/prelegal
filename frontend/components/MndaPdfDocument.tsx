import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import {
  coverPageSummary,
  fillPlaceholders,
  partyFieldConfig,
  standardTermsSections,
  type MndaFormData,
  type PartyDetails,
} from "@/lib/mnda-content";
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

function PartyBlock({ label, party }: { label: string; party: PartyDetails }) {
  return (
    <View style={styles.partyColumn}>
      <Text style={styles.h3}>{label}</Text>
      {partyFieldConfig.map((field) => (
        <Text key={field.key} style={styles.paragraph}>
          {party[field.key] || field.placeholder}
        </Text>
      ))}
    </View>
  );
}

export default function MndaPdfDocument({ data }: { data: MndaFormData }) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.title}>Mutual Non-Disclosure Agreement</Text>

        <Text style={styles.h2}>Cover Page</Text>

        {coverPageSummary(data).map((item) => (
          <View key={item.label}>
            <Text style={styles.h3}>{item.label}</Text>
            <Text style={styles.paragraph}>{item.value}</Text>
          </View>
        ))}

        <View style={styles.partyRow}>
          <PartyBlock label="Party 1" party={data.party1} />
          <PartyBlock label="Party 2" party={data.party2} />
        </View>

        <Text style={styles.h2}>Standard Terms</Text>
        {standardTermsSections.map((section) => (
          <View key={section.title}>
            <Text style={styles.h3}>{section.title}</Text>
            <Text style={styles.paragraph}>{fillPlaceholders(section.body, data)}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
}
