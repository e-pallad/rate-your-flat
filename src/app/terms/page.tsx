import Link from "next/link";

const t: Record<string, Record<string, string>> = {
  en: {
    title: "Terms of Service",
    body: "By using FlatCheck you agree to submit only truthful reviews based on your own experience, to not harass other users, and to comply with applicable law. We reserve the right to remove content that violates these terms. Continued use of the platform constitutes acceptance of any updates to these terms.",
    back: "Back to home",
  },
  de: {
    title: "Nutzungsbedingungen",
    body: "Durch die Nutzung von FlatCheck erklären Sie sich damit einverstanden, nur wahrheitsgemäße Bewertungen auf Basis eigener Erfahrungen einzureichen, andere Nutzer nicht zu belästigen und geltendes Recht einzuhalten. Wir behalten uns das Recht vor, Inhalte zu entfernen, die gegen diese Bedingungen verstoßen. Die weitere Nutzung der Plattform gilt als Zustimmung zu etwaigen Aktualisierungen dieser Bedingungen.",
    back: "Zurück zur Startseite",
  },
};

export default function TermsPage() {
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
