import Link from "next/link";

const t: Record<string, Record<string, string>> = {
  en: {
    title: "Privacy Policy",
    body: "We collect only the data necessary to operate the platform (name, email, and reviews you submit). Your data is never sold to third parties. Anonymous reviews hide your identity from all public views. For full details or a data deletion request, contact us at privacy@flatcheck.example.",
    back: "Back to home",
  },
  de: {
    title: "Datenschutz",
    body: "Wir erheben nur die Daten, die zum Betrieb der Plattform erforderlich sind (Name, E-Mail und von Ihnen eingereichte Bewertungen). Ihre Daten werden niemals an Dritte verkauft. Anonyme Bewertungen verbergen Ihre Identität in allen öffentlichen Ansichten. Für vollständige Informationen oder eine Datenanfrage wenden Sie sich an privacy@flatcheck.example.",
    back: "Zurück zur Startseite",
  },
};

export default function PrivacyPage() {
  const lang = "de";
  const s = t[lang];

  return (
    <div className="container py-12 max-w-2xl">
      <h1 className="text-3xl font-bold mb-4">{s.title}</h1>
      <p className="text-muted-foreground mb-8">{s.body}</p>
      <Link href="/" className="text-sm underline underline-offset-4">
        {s.back}
      </Link>
    </div>
  );
}
