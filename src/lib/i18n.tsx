"use client";

import { createContext, useContext, useEffect, useState } from "react";

type TranslationContextType = {
  t: (key: string) => string;
  changeLanguage: (lang: string) => void;
  language: string;
};

const translations: Record<string, Record<string, string>> = {
  en: {
    // common
    "common.appName": "Rate Your Flat",
    "common.loading": "Loading...",
    "common.error": "An error occurred",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.submit": "Submit",
    "common.search": "Search",
    "common.filter": "Filter",
    "common.noResults": "No results found",
    // nav
    "nav.home": "Home",
    "nav.login": "Login",
    "nav.register": "Register",
    "nav.logout": "Logout",
    "nav.dashboard": "Dashboard",
    "nav.flats": "Flats",
    "nav.myFlats": "My Flats",
    "nav.profile": "Profile",
    "nav.language": "Language",
    // auth
    "auth.loginTitle": "Welcome back",
    "auth.loginSubtitle": "Log in to your account",
    "auth.registerTitle": "Create an account",
    "auth.registerSubtitle": "Join our community",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.confirmPassword": "Confirm Password",
    "auth.name": "Name",
    "auth.role": "I am a",
    "auth.landlord": "Landlord",
    "auth.renter": "Renter",
    "auth.noAccount": "Don't have an account?",
    "auth.haveAccount": "Already have an account?",
    "auth.loginError": "Invalid email or password",
    "auth.registerError": "Registration failed",
    "auth.passwordsNoMatch": "Passwords do not match",
    // flat
    "flat.addFlat": "Add Flat",
    "flat.editFlat": "Edit Flat",
    "flat.address": "Address",
    "flat.city": "City",
    "flat.postalCode": "Postal Code",
    "flat.country": "Country",
    "flat.description": "Description",
    "flat.verified": "Verified",
    "flat.unverified": "Unverified",
    "flat.unclaimed": "No landlord account linked",
    "flat.verify": "Verify",
    "flat.verificationCode": "Verification Code",
    "flat.enterCode": "Enter verification code",
    "flat.reviews": "Reviews",
    "flat.noReviews": "No reviews yet",
    "flat.averageRating": "Average Rating",
    "flat.writeReview": "Write a Review",
    "flat.viewFlat": "View Flat",
    "flat.landlord": "Landlord",
    // review
    "review.title": "Review",
    "review.ratings": "Ratings",
    "review.location": "Location",
    "review.price": "Price",
    "review.condition": "Condition",
    "review.noise": "Noise",
    "review.landlordRating": "Landlord",
    "review.comment": "Comment",
    "review.anonymous": "Post anonymously",
    "review.respond": "Respond",
    "review.response": "Landlord Response",
    "review.images": "Images",
    "review.addImages": "Add Images",
    "review.overallRating": "Overall Rating",
    "review.submitReview": "Submit Review",
    "review.updateReview": "Update Review",
    "review.editReview": "Edit Review",
    "review.alreadyReviewed": "You have already reviewed this flat",
    // dashboard
    "dashboard.welcome": "Welcome",
    "dashboard.landlordDashboard": "Landlord Dashboard",
    "dashboard.renterDashboard": "Renter Dashboard",
    "dashboard.totalFlats": "Total Flats",
    "dashboard.totalReviews": "Total Reviews",
    "dashboard.pendingVerification": "Pending Verification",
    "dashboard.recentReviews": "Recent Reviews",
    "dashboard.myReviews": "My Reviews",
    "dashboard.mySubmittedFlats": "Flats I Added",
    // footer
    "footer.tagline": "Find your perfect flat with real reviews from renters.",
    "footer.about": "About",
    "footer.aboutUs": "About Us",
    "footer.contact": "Contact",
    "footer.faq": "FAQ",
    "footer.legal": "Legal",
    "footer.privacy": "Privacy Policy",
    "footer.terms": "Terms of Service",
    "footer.allRightsReserved": "All rights reserved.",
    // faq
    "faq.title": "FAQ",
    "faq.subtitle": "Answers to common questions about Rate Your Flat",
    "faq.viewAll": "View all questions",
    "faq.search.q": "How do I find a flat?",
    "faq.search.a": "Use the search bar on the homepage to search by address, city, or postal code. Results update as you type. All flats are shown - verified, unverified, and unclaimed.",
    "faq.review.q": "How do I submit a review?",
    "faq.review.a": "Open any flat's detail page and click \"Write a Review\". You need a free account to submit. You can rate 6 dimensions (overall, location, price, condition, noise, landlord) on a scale of 1-5, leave a written comment, and optionally post anonymously.",
    "faq.addFlat.q": "Can I add a flat as a renter?",
    "faq.addFlat.a": "Yes - any logged-in user (landlord or renter) can add a flat via the \"Add Flat\" button. Flats added by renters appear immediately on the homepage as \"Unclaimed\" until a landlord registers and verifies them.",
    "faq.claim.q": "How do landlords claim or verify a flat?",
    "faq.claim.a": "Landlords can visit a flat's detail page and click \"Verify\". A verification code (provided by the renter who submitted the flat) is required to complete the claim. Once claimed, the flat displays a Verified badge and the landlord can respond to reviews.",
    "faq.privacy.q": "Is my data private? Are anonymous reviews truly anonymous?",
    "faq.privacy.a": "You must have an account to submit a review, but checking \"Post anonymously\" hides your name from all public views - other users and landlords cannot see who wrote the review. Only platform administrators have access to the account behind an anonymous review, and only when investigating reported abuse.",
    "faq.trust.q": "How do you prevent fake or biased reviews?",
    "faq.trust.a": "We use several layers of protection to keep reviews trustworthy.",
  },
  de: {
    // common
    "common.appName": "Bewerte deine Wohnung",
    "common.loading": "Laden...",
    "common.error": "Ein Fehler ist aufgetreten",
    "common.save": "Speichern",
    "common.cancel": "Abbrechen",
    "common.delete": "Löschen",
    "common.edit": "Bearbeiten",
    "common.submit": "Absenden",
    "common.search": "Suchen",
    "common.filter": "Filtern",
    "common.noResults": "Keine Ergebnisse gefunden",
    // nav
    "nav.home": "Startseite",
    "nav.login": "Anmelden",
    "nav.register": "Registrieren",
    "nav.logout": "Abmelden",
    "nav.dashboard": "Übersicht",
    "nav.flats": "Wohnungen",
    "nav.myFlats": "Meine Wohnungen",
    "nav.profile": "Profil",
    "nav.language": "Sprache",
    // auth
    "auth.loginTitle": "Willkommen zurück",
    "auth.loginSubtitle": "Melde dich in deinem Konto an",
    "auth.registerTitle": "Konto erstellen",
    "auth.registerSubtitle": "Trete unserer Community bei",
    "auth.email": "E-Mail",
    "auth.password": "Passwort",
    "auth.confirmPassword": "Passwort bestätigen",
    "auth.name": "Name",
    "auth.role": "Ich bin ein",
    "auth.landlord": "Vermieter",
    "auth.renter": "Mieter",
    "auth.noAccount": "Noch kein Konto?",
    "auth.haveAccount": "Bereits ein Konto?",
    "auth.loginError": "Ungültige E-Mail oder Passwort",
    "auth.registerError": "Registrierung fehlgeschlagen",
    "auth.passwordsNoMatch": "Passwörter stimmen nicht überein",
    // flat
    "flat.addFlat": "Wohnung hinzufügen",
    "flat.editFlat": "Wohnung bearbeiten",
    "flat.address": "Adresse",
    "flat.city": "Stadt",
    "flat.postalCode": "Postleitzahl",
    "flat.country": "Land",
    "flat.description": "Beschreibung",
    "flat.verified": "Verifiziert",
    "flat.unverified": "Nicht verifiziert",
    "flat.unclaimed": "Kein Vermieter-Konto verknüpft",
    "flat.verify": "Verifizieren",
    "flat.verificationCode": "Verifizierungscode",
    "flat.enterCode": "Verifizierungscode eingeben",
    "flat.reviews": "Bewertungen",
    "flat.noReviews": "Noch keine Bewertungen",
    "flat.averageRating": "Durchschnittsbewertung",
    "flat.writeReview": "Bewertung schreiben",
    "flat.viewFlat": "Wohnung ansehen",
    "flat.landlord": "Vermieter",
    // review
    "review.title": "Bewertung",
    "review.ratings": "Bewertungen",
    "review.location": "Lage",
    "review.price": "Preis",
    "review.condition": "Zustand",
    "review.noise": "Lärm",
    "review.landlordRating": "Vermieter",
    "review.comment": "Kommentar",
    "review.anonymous": "Anonym veröffentlichen",
    "review.respond": "Antworten",
    "review.response": "Vermieter-Antwort",
    "review.images": "Bilder",
    "review.addImages": "Bilder hinzufügen",
    "review.overallRating": "Gesamtbewertung",
    "review.submitReview": "Bewertung absenden",
    "review.updateReview": "Bewertung aktualisieren",
    "review.editReview": "Bewertung bearbeiten",
    "review.alreadyReviewed": "Du hast diese Wohnung bereits bewertet",
    // dashboard
    "dashboard.welcome": "Willkommen",
    "dashboard.landlordDashboard": "Vermieter-Übersicht",
    "dashboard.renterDashboard": "Mieter-Übersicht",
    "dashboard.totalFlats": "Wohnungen gesamt",
    "dashboard.totalReviews": "Bewertungen gesamt",
    "dashboard.pendingVerification": "Ausstehende Verifizierung",
    "dashboard.recentReviews": "Neueste Bewertungen",
    "dashboard.myReviews": "Meine Bewertungen",
    "dashboard.mySubmittedFlats": "Von mir hinzugefügte Wohnungen",
    // footer
    "footer.tagline": "Finde deine perfekte Wohnung mit echten Bewertungen von Mietern.",
    "footer.about": "Über uns",
    "footer.aboutUs": "Über uns",
    "footer.contact": "Kontakt",
    "footer.faq": "FAQ",
    "footer.legal": "Rechtliches",
    "footer.privacy": "Datenschutz",
    "footer.terms": "Nutzungsbedingungen",
    "footer.allRightsReserved": "Alle Rechte vorbehalten.",
    // faq
    "faq.title": "Häufige Fragen",
    "faq.subtitle": "Antworten auf häufige Fragen zu Bewerte deine Wohnung",
    "faq.viewAll": "Alle Fragen ansehen",
    "faq.search.q": "Wie finde ich eine Wohnung?",
    "faq.search.a": "Nutze die Suchleiste auf der Startseite, um nach Adresse, Stadt oder Postleitzahl zu suchen. Die Ergebnisse aktualisieren sich waehrend der Eingabe. Es werden alle Wohnungen angezeigt - verifizierte, nicht verifizierte und nicht beanspruchte.",
    "faq.review.q": "Wie schreibe ich eine Bewertung?",
    "faq.review.a": "Oeffne die Detailseite einer Wohnung und klicke auf \"Bewertung schreiben\". Du benoeligst ein kostenloses Konto. Du kannst 6 Kategorien (Gesamt, Lage, Preis, Zustand, Laerm, Vermieter) auf einer Skala von 1-5 bewerten, einen Kommentar hinterlassen und optional anonym posten.",
    "faq.addFlat.q": "Kann ich als Mieter eine Wohnung hinzufuegen?",
    "faq.addFlat.a": "Ja - jeder angemeldete Nutzer (Vermieter oder Mieter) kann ueber den Button \"Wohnung hinzufuegen\" eine Wohnung eintragen. Von Mietern eingetragene Wohnungen erscheinen sofort auf der Startseite als \"Nicht beansprucht\", bis ein Vermieter sie verifiziert.",
    "faq.claim.q": "Wie beanspruchen oder verifizieren Vermieter eine Wohnung?",
    "faq.claim.a": "Vermieter koennen die Detailseite einer Wohnung aufrufen und auf \"Verifizieren\" klicken. Ein Verifizierungscode (vom Mieter bereitgestellt, der die Wohnung eingetragen hat) ist erforderlich. Nach der Beanspruchung zeigt die Wohnung ein Verifiziert-Badge und der Vermieter kann auf Bewertungen antworten.",
    "faq.privacy.q": "Sind meine Daten sicher? Sind anonyme Bewertungen wirklich anonym?",
    "faq.privacy.a": "Du benoeligst ein Konto, um eine Bewertung abzugeben, aber wenn du \"Anonym veroeffentlichen\" aktivierst, wird dein Name in allen oeffentlichen Ansichten ausgeblendet - andere Nutzer und Vermieter koennen nicht sehen, wer die Bewertung geschrieben hat. Nur Plattformadministratoren haben Zugang zum Konto hinter einer anonymen Bewertung, und nur bei der Untersuchung gemeldeter Missbrauchsfaelle.",
    "faq.trust.q": "Wie werden gefaelschte oder voreingenommene Bewertungen verhindert?",
    "faq.trust.a": "Wir nutzen mehrere Schutzebenen, um die Vertrauenswuerdigkeit der Bewertungen sicherzustellen.",
  },
};

const TranslationContext = createContext<TranslationContextType | null>(null);

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState("de");

  useEffect(() => {
    const saved = localStorage.getItem("language");
    if (saved) setLanguage(saved);
  }, []);

  const changeLanguage = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations["de"]?.[key] || key;
  };

  return (
    <TranslationContext.Provider value={{ t, changeLanguage, language }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) throw new Error("useTranslation must be used within TranslationProvider");
  return context;
}
