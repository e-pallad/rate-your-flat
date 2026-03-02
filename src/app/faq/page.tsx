// Living FAQ — update this file and re-run `npm run faq:screenshots` whenever
// new features are added that have a notable UI (e.g. a new form or page).
// Each FAQ entry that has a visual flow should have a corresponding screenshot.

import Image from "next/image";
import Link from "next/link";
import { existsSync } from "fs";
import { join } from "path";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const translations: Record<string, Record<string, string>> = {
  en: {
    "faq.title": "FAQ",
    "faq.subtitle": "Answers to common questions about Rate Your Flat",
    "faq.search.q": "How do I find a flat?",
    "faq.search.a":
      "Use the search bar on the homepage to search by address, city, or postal code. Results update as you type. All flats are shown - verified, unverified, and unclaimed.",
    "faq.review.q": "How do I submit a review?",
    "faq.review.a":
      "Open any flat's detail page and click \"Write a Review\". You need a free account to submit. You can rate 6 dimensions (overall, location, price, condition, noise, landlord) on a scale of 1-5, leave a written comment, and optionally post anonymously.",
    "faq.addFlat.q": "Can I add a flat as a renter?",
    "faq.addFlat.a":
      "Yes - any logged-in user (landlord or renter) can add a flat via the \"Add Flat\" button. Flats added by renters appear immediately on the homepage as \"Unclaimed\" until a landlord registers and verifies them.",
    "faq.claim.q": "How do landlords claim or verify a flat?",
    "faq.claim.a":
      "Landlords can visit a flat's detail page and click \"Verify\". A verification code (provided by the renter who submitted the flat) is required to complete the claim. Once claimed, the flat displays a Verified badge and the landlord can respond to reviews.",
    "faq.privacy.q": "Is my data private? Are anonymous reviews truly anonymous?",
    "faq.privacy.a":
      "You must have an account to submit a review, but checking \"Post anonymously\" hides your name from all public views - other users and landlords cannot see who wrote the review. Only platform administrators have access to the account behind an anonymous review, and only when investigating reported abuse.",
    "faq.trust.q": "How do you prevent fake or biased reviews?",
  },
  de: {
    "faq.title": "H\u00e4ufige Fragen",
    "faq.subtitle": "Antworten auf h\u00e4ufige Fragen zu Bewerte deine Wohnung",
    "faq.search.q": "Wie finde ich eine Wohnung?",
    "faq.search.a":
      "Nutze die Suchleiste auf der Startseite, um nach Adresse, Stadt oder Postleitzahl zu suchen. Die Ergebnisse aktualisieren sich w\u00e4hrend der Eingabe. Es werden alle Wohnungen angezeigt - verifizierte, nicht verifizierte und nicht beanspruchte.",
    "faq.review.q": "Wie schreibe ich eine Bewertung?",
    "faq.review.a":
      "Oeffne die Detailseite einer Wohnung und klicke auf \"Bewertung schreiben\". Du ben\u00f6tigst ein kostenloses Konto. Du kannst 6 Kategorien (Gesamt, Lage, Preis, Zustand, L\u00e4rm, Vermieter) auf einer Skala von 1-5 bewerten, einen Kommentar hinterlassen und optional anonym posten.",
    "faq.addFlat.q": "Kann ich als Mieter eine Wohnung hinzuf\u00fcgen?",
    "faq.addFlat.a":
      "Ja - jeder angemeldete Nutzer (Vermieter oder Mieter) kann \u00fcber den Button \"Wohnung hinzuf\u00fcgen\" eine Wohnung eintragen. Von Mietern eingetragene Wohnungen erscheinen sofort auf der Startseite als \"Nicht beansprucht\", bis ein Vermieter sie verifiziert.",
    "faq.claim.q": "Wie beanspruchen oder verifizieren Vermieter eine Wohnung?",
    "faq.claim.a":
      "Vermieter k\u00f6nnen die Detailseite einer Wohnung aufrufen und auf \"Verifizieren\" klicken. Ein Verifizierungscode (vom Mieter bereitgestellt, der die Wohnung eingetragen hat) ist erforderlich. Nach der Beanspruchung zeigt die Wohnung ein Verifiziert-Badge und der Vermieter kann auf Bewertungen antworten.",
    "faq.privacy.q": "Sind meine Daten sicher? Sind anonyme Bewertungen wirklich anonym?",
    "faq.privacy.a":
      "Du ben\u00f6tigst ein Konto, um eine Bewertung abzugeben, aber wenn du \"Anonym ver\u00f6ffentlichen\" aktivierst, wird dein Name in allen \u00f6ffentlichen Ansichten ausgeblendet - andere Nutzer und Vermieter k\u00f6nnen nicht sehen, wer die Bewertung geschrieben hat. Nur Plattformadministratoren haben Zugang zum Konto hinter einer anonymen Bewertung, und nur bei der Untersuchung gemeldeter Missbrauchsf\u00e4lle.",
    "faq.trust.q": "Wie werden gef\u00e4lschte oder voreingenommene Bewertungen verhindert?",
  },
};

function getTranslation(key: string): string {
  return translations.de[key] || translations.en[key] || key;
}

function screenshotExists(filename: string): boolean {
  try {
    return existsSync(join(process.cwd(), "public", "faq", filename));
  } catch {
    return false;
  }
}

function FaqScreenshot({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  if (!screenshotExists(src)) return null;
  return (
    <div className="mt-4 rounded-lg overflow-hidden border shadow-sm">
      <Image
        src={`/faq/${src}`}
        alt={alt}
        width={900}
        height={500}
        className="w-full object-cover"
      />
    </div>
  );
}

const t = getTranslation;

export default function FaqPage() {
  const items = [
    {
      value: "search",
      question: t("faq.search.q"),
      answer: t("faq.search.a"),
      screenshot: { src: "faq-search.png", alt: "Homepage search bar and flat grid" },
    },
    {
      value: "review",
      question: t("faq.review.q"),
      answer: t("faq.review.a"),
      screenshot: { src: "faq-review-form.png", alt: "Review submission form" },
    },
    {
      value: "addFlat",
      question: t("faq.addFlat.q"),
      answer: t("faq.addFlat.a"),
      screenshot: { src: "faq-add-flat.png", alt: "Add flat form" },
    },
    {
      value: "claim",
      question: t("faq.claim.q"),
      answer: t("faq.claim.a"),
      screenshot: null,
    },
    {
      value: "privacy",
      question: t("faq.privacy.q"),
      answer: t("faq.privacy.a"),
      screenshot: null,
    },
  ];

  return (
    <div className="container py-12 max-w-3xl">
      {/* Hero */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-3">{t("faq.title")}</h1>
        <p className="text-muted-foreground text-lg">{t("faq.subtitle")}</p>
      </div>

      {/* Main accordion */}
      <Accordion type="single" collapsible className="w-full mb-10">
        {items.map((item) => (
          <AccordionItem key={item.value} value={item.value}>
            <AccordionTrigger className="text-base font-medium">
              {item.question}
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-muted-foreground leading-relaxed">{item.answer}</p>
              {item.screenshot && (
                <FaqScreenshot src={item.screenshot.src} alt={item.screenshot.alt} />
              )}
            </AccordionContent>
          </AccordionItem>
        ))}

        {/* Trust & abuse — rich content item */}
        <AccordionItem value="trust">
          <AccordionTrigger className="text-base font-medium">
            {t("faq.trust.q")}
          </AccordionTrigger>
          <AccordionContent>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We use several layers of protection to keep reviews trustworthy:
            </p>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex gap-3">
                <span className="mt-0.5 shrink-0 text-foreground font-semibold">1.</span>
                <span>
                  <strong className="text-foreground">One review per user per flat</strong> —
                  enforced at the database level, not just application logic. It is technically
                  impossible to submit a second review for the same flat with the same account.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 shrink-0 text-foreground font-semibold">2.</span>
                <span>
                  <strong className="text-foreground">Account required</strong> — even anonymous
                  reviews require a registered account. This prevents bot submissions and makes
                  repeat abuse traceable by administrators.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 shrink-0 text-foreground font-semibold">3.</span>
                <span>
                  <strong className="text-foreground">Landlord right of reply</strong> — landlords
                  can post a public response to any review on their flat, giving context without
                  censoring or removing the original review.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 shrink-0 text-foreground font-semibold">4.</span>
                <span>
                  <strong className="text-foreground">Report abuse</strong> — if you spot a review
                  that seems fake or abusive, contact us via the{" "}
                  <Link href="/contact" className="underline hover:text-foreground">
                    Contact
                  </Link>{" "}
                  page. Flagged reviews are manually investigated by our team.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 shrink-0 text-foreground font-semibold">5.</span>
                <span>
                  <strong className="text-foreground">No self-reviews</strong> — the platform is
                  designed to prevent landlords from reviewing their own flats. Full automated
                  enforcement is on the roadmap.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 shrink-0 text-foreground font-semibold">6.</span>
                <span>
                  <strong className="text-foreground">Future moderation tools</strong> — we are
                  working on a moderation dashboard that will allow administrators to flag, hide,
                  or remove reviews that violate community guidelines, with a full audit trail.
                </span>
              </li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Contact prompt */}
      <div className="rounded-lg border bg-muted/40 p-6 text-center">
        <p className="text-muted-foreground">
          Didn&apos;t find what you were looking for?{" "}
          <Link href="/contact" className="font-medium text-foreground underline hover:no-underline">
            Contact us
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
