import Link from "next/link";

const t: Record<string, Record<string, string>> = {
  en: {
    title: "About Us",
    body: "Rate Your Flat is a community platform where renters can share honest reviews of their flats, helping others make informed housing decisions.",
    back: "Back to home",
  },
  de: {
    title: "Über uns",
    body: "Bewerte deine Wohnung ist eine Community-Plattform, auf der Mieter ehrliche Bewertungen ihrer Wohnungen teilen können, damit andere fundierte Entscheidungen bei der Wohnungssuche treffen können.",
    back: "Zurück zur Startseite",
  },
};

export default function AboutPage() {
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
