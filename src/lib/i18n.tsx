"use client";

import { createContext, useContext, useState } from "react";

type TranslationContextType = {
  t: (key: string) => string;
  changeLanguage: (lang: string) => void;
  language: string;
};

export const translations: Record<string, Record<string, string>> = {
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
    "flat.flatCreated": "Flat Added Successfully",
    "flat.flatCreatedSubtitle":
      "Your flat has been listed. Save the verification code below — you will need it to claim and verify this flat.",
    "flat.verificationCodeLabel": "Your Verification Code",
    "flat.verificationCodeHint":
      "Share this code with the landlord so they can claim the flat, or use it yourself via the Verify button on the flat page.",
    "flat.yourCode": "Verification code:",
    "flat.verifySuccess": "Flat verified successfully",
    "flat.searchAddress": "Search address",
    "flat.searchPlaceholder": "e.g. Musterstraße 42, Berlin",
    "flat.mapPickerHint":
      "Search for an address above, or drag the pin on the map to set the location.",
    "flat.locationSelected": "Location selected",
    "flat.noLocationSelected": "No location selected yet",
    "flat.addFlatAndReview": "Submit a Flat & Review",
    "flat.addFlatAndReviewSubtitle":
      "No account needed — fill in the flat details and your experience below.",
    "flat.guestSubmitterName": "Your name (optional)",
    "flat.guestSubmitterNamePlaceholder": "e.g. Jane",
    "flat.flatCreatedWithReview": "Flat & Review Submitted",
    "flat.flatCreatedWithReviewSubtitle":
      "Your flat listing and review have been submitted. Save the verification code below — a landlord can use it to claim and verify this flat.",
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
    "review.responsePlaceholder": "Write your response to this review...",
    "review.responseSubmitted": "Response submitted successfully",
    "review.reviewSubmitted": "Review submitted successfully",
    "review.submitReviewSubtitle": "Rate your flat experience",
    "review.commentPlaceholder": "Share your experience with this flat...",
    "review.images": "Images",
    "review.addImages": "Add Images",
    "review.imagesHint":
      "JPEG, PNG, WebP or GIF — max 5 MB each, up to 5 images",
    "review.overallRating": "Overall Rating",
    "review.submitReview": "Submit Review",
    "review.updateReview": "Update Review",
    "review.editReview": "Edit Review",
    "review.alreadyReviewed": "You have already reviewed this flat",
    "review.guestReview": "Guest review",
    "review.guestName": "Your name (optional)",
    "review.guestNamePlaceholder": "e.g. Jane",
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
    // analytics
    "analytics.title": "Analytics",
    "analytics.back": "Back to Dashboard",
    "analytics.selectFlat": "Select flat",
    "analytics.noFlats": "You have no flats yet.",
    "analytics.ratingTrend": "Rating Trend Over Time",
    "analytics.dimensionBreakdown": "Dimension Breakdown",
    "analytics.avgRating": "Avg Rating",
    "analytics.basedOn": "Based on",
    "analytics.reviewsCount": "reviews",
    "analytics.viewAnalytics": "View Analytics",
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
    "footer.version": "Version",
    // home
    "home.heroTitle": "Real reviews from real tenants",
    "home.heroSubtitle":
      "Find honest ratings for flats across Germany — written by people who actually lived there.",
    "home.heroSearchCta": "Browse flats",
    "home.heroReviewCta": "Share your experience",
    "home.socialProof": "reviews from real tenants",
    "home.ctaTitle": "Lived somewhere worth rating?",
    "home.ctaDesc":
      "Help the next tenant make a better decision. It takes less than 3 minutes.",
    "home.ctaButton": "Write a review",
    "home.ctaButtonGuest": "Submit as guest — no account needed",
    "home.ctaLoggedIn": "Add a flat & write a review",
    // faq
    "faq.title": "FAQ",
    "faq.subtitle": "Answers to common questions about Rate Your Flat",
    "faq.viewAll": "View all questions",
    "faq.search.q": "How do I find a flat?",
    "faq.search.a":
      "Use the search bar on the homepage to search by address, city, or postal code. Results update as you type. All flats are shown - verified, unverified, and unclaimed.",
    "faq.review.q": "How do I submit a review?",
    "faq.review.a":
      'Open any flat\'s detail page and click "Write a Review". No account needed — you can submit as a guest with just your name. If you have an account, log in to keep track of all your reviews. You can rate 6 dimensions (overall, location, price, condition, noise, landlord) on a scale of 1-5, leave a written comment, and optionally post anonymously.',
    "faq.addFlat.q": "Can I add a flat as a renter?",
    "faq.addFlat.a":
      'Yes - anyone can add a flat, including guests without an account. Logged-in users can use the "Add Flat" button; guests can use the dedicated guest submission form at /flat/new/guest. Flats added by renters or guests appear immediately on the homepage as "Unclaimed" until a landlord registers and verifies them.',
    "faq.claim.q": "How do landlords claim or verify a flat?",
    "faq.claim.a":
      'Landlords can visit a flat\'s detail page and click "Verify". A verification code (provided by the renter who submitted the flat) is required to complete the claim. Once claimed, the flat displays a Verified badge and the landlord can respond to reviews.',
    "faq.privacy.q":
      "Is my data private? Are anonymous reviews truly anonymous?",
    "faq.privacy.a":
      'Logged-in users who check "Post anonymously" have their name hidden from all public views — other users and landlords cannot see who wrote the review. Guest reviews are submitted with a display name you choose and are not linked to any account. Only platform administrators can investigate the account or IP address behind a review when responding to reported abuse.',
    "faq.trust.q": "How do you prevent fake or biased reviews?",
    "faq.trust.a":
      "We use several layers of protection to keep reviews trustworthy.",
    // admin
    "admin.dashboard": "Admin Dashboard",
    "admin.overview": "Overview",
    "admin.users": "User Management",
    "admin.content": "Content Moderation",
    "admin.totalUsers": "Total Users",
    "admin.totalFlats": "Total Flats",
    "admin.totalReviews": "Total Reviews",
    "admin.totalModerators": "Total Moderators",
    "admin.userName": "Name",
    "admin.userEmail": "Email",
    "admin.userRole": "Role",
    "admin.userJoined": "Joined",
    "admin.userFlats": "Flats",
    "admin.userReviews": "Reviews",
    "admin.changeRole": "Change Role",
    "admin.deleteUser": "Delete User",
    "admin.confirmDeleteUser": "Are you sure you want to delete this user?",
    "admin.flats": "Flats",
    "admin.reviews": "Reviews",
    "admin.deleteFlat": "Delete Flat",
    "admin.deleteReview": "Delete Review",
    "admin.confirmDeleteFlat": "Are you sure you want to delete this flat?",
    "admin.confirmDeleteReview": "Are you sure you want to delete this review?",
    // moderator
    "moderator.dashboard": "Moderator Dashboard",
    "moderator.content": "Content Moderation",
    "moderator.flats": "Flats",
    "moderator.reviews": "Reviews",
    "moderator.deleteFlat": "Delete Flat",
    "moderator.deleteReview": "Delete Review",
    "moderator.confirmDeleteFlat": "Are you sure you want to delete this flat?",
    "moderator.confirmDeleteReview":
      "Are you sure you want to delete this review?",
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
    "flat.flatCreated": "Wohnung erfolgreich eingetragen",
    "flat.flatCreatedSubtitle":
      "Deine Wohnung wurde eingetragen. Speichere den Verifizierungscode unten — du brauchst ihn, um die Wohnung zu beanspruchen und zu verifizieren.",
    "flat.verificationCodeLabel": "Dein Verifizierungscode",
    "flat.verificationCodeHint":
      "Teile diesen Code mit dem Vermieter, damit er die Wohnung beanspruchen kann, oder nutze ihn selbst über den Verifizieren-Button auf der Wohnungsseite.",
    "flat.yourCode": "Verifizierungscode:",
    "flat.verifySuccess": "Wohnung erfolgreich verifiziert",
    "flat.searchAddress": "Adresse suchen",
    "flat.searchPlaceholder": "z.B. Musterstraße 42, Berlin",
    "flat.mapPickerHint":
      "Suche oben nach einer Adresse oder ziehe die Markierung auf der Karte an die gewünschte Position.",
    "flat.locationSelected": "Standort ausgewählt",
    "flat.noLocationSelected": "Noch kein Standort ausgewählt",
    "flat.addFlatAndReview": "Wohnung & Bewertung einreichen",
    "flat.addFlatAndReviewSubtitle":
      "Kein Konto erforderlich — fülle unten die Wohnungsdetails und deine Erfahrung aus.",
    "flat.guestSubmitterName": "Dein Name (optional)",
    "flat.guestSubmitterNamePlaceholder": "z.B. Max",
    "flat.flatCreatedWithReview": "Wohnung & Bewertung eingereicht",
    "flat.flatCreatedWithReviewSubtitle":
      "Deine Wohnung und Bewertung wurden eingereicht. Speichere den Verifizierungscode — ein Vermieter kann ihn nutzen, um die Wohnung zu beanspruchen.",
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
    "review.responsePlaceholder":
      "Schreibe deine Antwort auf diese Bewertung...",
    "review.responseSubmitted": "Antwort erfolgreich übermittelt",
    "review.reviewSubmitted": "Bewertung erfolgreich eingereicht",
    "review.submitReviewSubtitle": "Bewerte deine Wohnerfahrung",
    "review.commentPlaceholder": "Teile deine Erfahrung mit dieser Wohnung...",
    "review.images": "Bilder",
    "review.addImages": "Bilder hinzufügen",
    "review.imagesHint":
      "JPEG, PNG, WebP oder GIF — max. 5 MB pro Bild, bis zu 5 Bilder",
    "review.overallRating": "Gesamtbewertung",
    "review.submitReview": "Bewertung absenden",
    "review.updateReview": "Bewertung aktualisieren",
    "review.editReview": "Bewertung bearbeiten",
    "review.alreadyReviewed": "Du hast diese Wohnung bereits bewertet",
    "review.guestReview": "Gast-Bewertung",
    "review.guestName": "Dein Name (optional)",
    "review.guestNamePlaceholder": "z.B. Max",
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
    // analytics
    "analytics.title": "Analysen",
    "analytics.back": "Zurück zur Übersicht",
    "analytics.selectFlat": "Wohnung auswählen",
    "analytics.noFlats": "Du hast noch keine Wohnungen.",
    "analytics.ratingTrend": "Bewertungsverlauf",
    "analytics.dimensionBreakdown": "Dimensionen im Überblick",
    "analytics.avgRating": "Ø Bewertung",
    "analytics.basedOn": "Basierend auf",
    "analytics.reviewsCount": "Bewertungen",
    "analytics.viewAnalytics": "Analysen ansehen",
    // footer
    "footer.tagline":
      "Finde deine perfekte Wohnung mit echten Bewertungen von Mietern.",
    "footer.about": "Über uns",
    "footer.aboutUs": "Über uns",
    "footer.contact": "Kontakt",
    "footer.faq": "FAQ",
    "footer.legal": "Rechtliches",
    "footer.privacy": "Datenschutz",
    "footer.terms": "Nutzungsbedingungen",
    "footer.allRightsReserved": "Alle Rechte vorbehalten.",
    "footer.version": "Version",
    // home
    "home.heroTitle": "Echte Bewertungen von echten Mietern",
    "home.heroSubtitle":
      "Finde ehrliche Bewertungen für Wohnungen in ganz Deutschland — geschrieben von Menschen, die dort wirklich gelebt haben.",
    "home.heroSearchCta": "Wohnungen entdecken",
    "home.heroReviewCta": "Erfahrung teilen",
    "home.socialProof": "Bewertungen von echten Mietern",
    "home.ctaTitle": "Irgendwo gewohnt, das eine Bewertung verdient?",
    "home.ctaDesc":
      "Hilf dem nächsten Mieter, eine bessere Entscheidung zu treffen. Dauert weniger als 3 Minuten.",
    "home.ctaButton": "Jetzt bewerten",
    "home.ctaButtonGuest": "Als Gast einreichen — kein Konto nötig",
    "home.ctaLoggedIn": "Wohnung hinzufügen & bewerten",
    // faq
    "faq.title": "Häufige Fragen",
    "faq.subtitle": "Antworten auf häufige Fragen zu Bewerte deine Wohnung",
    "faq.viewAll": "Alle Fragen ansehen",
    "faq.search.q": "Wie finde ich eine Wohnung?",
    "faq.search.a":
      "Nutze die Suchleiste auf der Startseite, um nach Adresse, Stadt oder Postleitzahl zu suchen. Die Ergebnisse aktualisieren sich waehrend der Eingabe. Es werden alle Wohnungen angezeigt - verifizierte, nicht verifizierte und nicht beanspruchte.",
    "faq.review.q": "Wie schreibe ich eine Bewertung?",
    "faq.review.a":
      'Öffne die Detailseite einer Wohnung und klicke auf "Bewertung schreiben". Kein Konto erforderlich — du kannst als Gast mit nur deinem Namen eine Bewertung abgeben. Mit einem Konto kannst du alle deine Bewertungen im Überblick behalten. Du kannst 6 Kategorien (Gesamt, Lage, Preis, Zustand, Lärm, Vermieter) auf einer Skala von 1–5 bewerten, einen Kommentar hinterlassen und optional anonym posten.',
    "faq.addFlat.q": "Kann ich als Mieter eine Wohnung hinzufuegen?",
    "faq.addFlat.a":
      'Ja — jeder kann eine Wohnung eintragen, auch Gäste ohne Konto. Angemeldete Nutzer verwenden den Button "Wohnung hinzufügen"; Gäste nutzen das Gast-Formular unter /flat/new/guest. Von Mietern oder Gästen eingetragene Wohnungen erscheinen sofort auf der Startseite als "Nicht beansprucht", bis ein Vermieter sie verifiziert.',
    "faq.claim.q": "Wie beanspruchen oder verifizieren Vermieter eine Wohnung?",
    "faq.claim.a":
      'Vermieter koennen die Detailseite einer Wohnung aufrufen und auf "Verifizieren" klicken. Ein Verifizierungscode (vom Mieter bereitgestellt, der die Wohnung eingetragen hat) ist erforderlich. Nach der Beanspruchung zeigt die Wohnung ein Verifiziert-Badge und der Vermieter kann auf Bewertungen antworten.',
    "faq.privacy.q":
      "Sind meine Daten sicher? Sind anonyme Bewertungen wirklich anonym?",
    "faq.privacy.a":
      'Angemeldete Nutzer, die "Anonym veröffentlichen" aktivieren, haben ihren Namen in allen öffentlichen Ansichten ausgeblendet — andere Nutzer und Vermieter können nicht sehen, wer die Bewertung geschrieben hat. Gastbewertungen werden mit einem selbst gewählten Anzeigenamen eingereicht und sind nicht mit einem Konto verknüpft. Nur Plattformadministratoren können bei gemeldeten Missbrauchsfällen das Konto oder die IP-Adresse hinter einer Bewertung einsehen.',
    "faq.trust.q":
      "Wie werden gefaelschte oder voreingenommene Bewertungen verhindert?",
    "faq.trust.a":
      "Wir nutzen mehrere Schutzebenen, um die Vertrauenswuerdigkeit der Bewertungen sicherzustellen.",
    // admin
    "admin.dashboard": "Admin-Übersicht",
    "admin.overview": "Übersicht",
    "admin.users": "Nutzerverwaltung",
    "admin.content": "Inhaltsmoderation",
    "admin.totalUsers": "Nutzer gesamt",
    "admin.totalFlats": "Wohnungen gesamt",
    "admin.totalReviews": "Bewertungen gesamt",
    "admin.totalModerators": "Moderatoren gesamt",
    "admin.userName": "Name",
    "admin.userEmail": "E-Mail",
    "admin.userRole": "Rolle",
    "admin.userJoined": "Beigetreten",
    "admin.userFlats": "Wohnungen",
    "admin.userReviews": "Bewertungen",
    "admin.changeRole": "Rolle ändern",
    "admin.deleteUser": "Nutzer löschen",
    "admin.confirmDeleteUser": "Nutzer wirklich löschen?",
    "admin.flats": "Wohnungen",
    "admin.reviews": "Bewertungen",
    "admin.deleteFlat": "Wohnung löschen",
    "admin.deleteReview": "Bewertung löschen",
    "admin.confirmDeleteFlat": "Wohnung wirklich löschen?",
    "admin.confirmDeleteReview": "Bewertung wirklich löschen?",
    // moderator
    "moderator.dashboard": "Moderator-Übersicht",
    "moderator.content": "Inhaltsmoderation",
    "moderator.flats": "Wohnungen",
    "moderator.reviews": "Bewertungen",
    "moderator.deleteFlat": "Wohnung löschen",
    "moderator.deleteReview": "Bewertung löschen",
    "moderator.confirmDeleteFlat": "Wohnung wirklich löschen?",
    "moderator.confirmDeleteReview": "Bewertung wirklich löschen?",
  },
};

const TranslationContext = createContext<TranslationContextType | null>(null);

export function TranslationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [language, setLanguage] = useState(() => {
    if (typeof window === "undefined") return "de";
    return localStorage.getItem("language") ?? "de";
  });

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
  if (!context)
    throw new Error("useTranslation must be used within TranslationProvider");
  return context;
}
