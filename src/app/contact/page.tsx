import Link from "next/link";

const t: Record<string, Record<string, string>> = {
  en: {
    title: "Contact",
    body: "Have a question or feedback? Reach out to us at contact@flatcheck.example. We aim to respond within 2 business days.",
    back: "Back to home",
  },
  de: {
    title: "Kontakt",
    body: "Haben Sie eine Frage oder Feedback? Schreiben Sie uns an contact@flatcheck.example. Wir antworten in der Regel innerhalb von 2 Werktagen.",
    back: "Zurück zur Startseite",
  },
};

export default function ContactPage() {
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
