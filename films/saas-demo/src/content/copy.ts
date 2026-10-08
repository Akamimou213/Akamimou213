// Every word on screen, per language. Edit copy here only; components never hard-code strings.
// "\n" is a forced line break. Amounts and unit numbers are illustrative (see brief.md).

export type Lang = "en" | "fr";

// Chip kinds map to colours in theme.ts → chips.
export type ChipKind = "neutral" | "attention" | "resolved";

export type Row = {
  readonly name: string;
  readonly amount: string;
  readonly before: { readonly text: string; readonly kind: ChipKind };
  readonly after: { readonly text: string; readonly kind: ChipKind };
};

export type CardCopy = {
  readonly label: string;
  readonly badge: string;
  readonly rows: readonly Row[];
};

export type Copy = {
  readonly label: string;
  readonly labelNote: string;
  readonly headline1: string;
  readonly cards: readonly [CardCopy, CardCopy, CardCopy];
  readonly selectedCount: string;
  readonly combine: string;
  readonly overviewTitle: string;
  readonly overviewMeta: string;
  readonly headline2: string;
  readonly support2: string;
  readonly attention: string;
  readonly followUp: string;
  readonly headline3: string;
  // Set to "" to remove the company name from the end card.
  readonly brandLine: string;
};

const en: Copy = {
  label: "Concept demo",
  labelNote: "Unofficial · illustrative data",
  headline1: "Too many\ntabs.",
  cards: [
    {
      label: "Rent roll",
      badge: "4",
      rows: [
        { name: "Unit 204", amount: "$1,450", before: { text: "Due", kind: "neutral" }, after: { text: "Collected", kind: "resolved" } },
        { name: "Unit 311", amount: "$1,620", before: { text: "Due", kind: "neutral" }, after: { text: "Collected", kind: "resolved" } },
        { name: "Unit 118", amount: "$1,380", before: { text: "NSF", kind: "attention" }, after: { text: "NSF", kind: "attention" } },
        { name: "Unit 207", amount: "$1,540", before: { text: "Due", kind: "neutral" }, after: { text: "Collected", kind: "resolved" } },
      ],
    },
    {
      label: "Bank portal",
      badge: "3",
      rows: [
        { name: "Deposit", amount: "$1,450", before: { text: "Unmatched", kind: "neutral" }, after: { text: "Matched", kind: "resolved" } },
        { name: "Deposit", amount: "$1,620", before: { text: "Unmatched", kind: "neutral" }, after: { text: "Matched", kind: "resolved" } },
        { name: "Payment", amount: "−$2,300", before: { text: "Unmatched", kind: "neutral" }, after: { text: "Matched", kind: "resolved" } },
        { name: "Deposit", amount: "$1,540", before: { text: "Cleared", kind: "neutral" }, after: { text: "Matched", kind: "resolved" } },
      ],
    },
    {
      label: "Supplier bills",
      badge: "4",
      rows: [
        { name: "Snow removal", amount: "$2,300", before: { text: "To approve", kind: "neutral" }, after: { text: "Paid", kind: "resolved" } },
        { name: "Plumbing", amount: "$640", before: { text: "To approve", kind: "neutral" }, after: { text: "Paid", kind: "resolved" } },
        { name: "Elevator service", amount: "$1,150", before: { text: "Overdue", kind: "attention" }, after: { text: "Paid", kind: "resolved" } },
        { name: "Cleaning", amount: "$890", before: { text: "Scheduled", kind: "neutral" }, after: { text: "Paid", kind: "resolved" } },
      ],
    },
  ],
  selectedCount: "3 selected",
  combine: "Combine into one view",
  overviewTitle: "All payments",
  overviewMeta: "October · Up to date",
  headline2: "One clear\nview.",
  support2: "Incoming and outgoing payments, in one place.",
  attention: "1 item needs attention · Unit 118 · NSF",
  followUp: "Follow up",
  headline3: "Explore\nthe demo.",
  brandLine: "An unofficial concept\nfor TOMSO",
};

const fr: Copy = {
  label: "Démo conceptuelle",
  labelNote: "Non officiel · données illustratives",
  headline1: "Trop\nd’onglets.",
  cards: [
    {
      label: "Loyers",
      badge: "4",
      rows: [
        { name: "Logement 204", amount: "1 450 $", before: { text: "À percevoir", kind: "neutral" }, after: { text: "Encaissé", kind: "resolved" } },
        { name: "Logement 311", amount: "1 620 $", before: { text: "À percevoir", kind: "neutral" }, after: { text: "Encaissé", kind: "resolved" } },
        { name: "Logement 118", amount: "1 380 $", before: { text: "NSF", kind: "attention" }, after: { text: "NSF", kind: "attention" } },
        { name: "Logement 207", amount: "1 540 $", before: { text: "À percevoir", kind: "neutral" }, after: { text: "Encaissé", kind: "resolved" } },
      ],
    },
    {
      label: "Portail bancaire",
      badge: "3",
      rows: [
        { name: "Dépôt", amount: "1 450 $", before: { text: "Non rapproché", kind: "neutral" }, after: { text: "Rapproché", kind: "resolved" } },
        { name: "Dépôt", amount: "1 620 $", before: { text: "Non rapproché", kind: "neutral" }, after: { text: "Rapproché", kind: "resolved" } },
        { name: "Paiement", amount: "−2 300 $", before: { text: "Non rapproché", kind: "neutral" }, after: { text: "Rapproché", kind: "resolved" } },
        { name: "Dépôt", amount: "1 540 $", before: { text: "Compensé", kind: "neutral" }, after: { text: "Rapproché", kind: "resolved" } },
      ],
    },
    {
      label: "Factures",
      badge: "4",
      rows: [
        { name: "Déneigement", amount: "2 300 $", before: { text: "À approuver", kind: "neutral" }, after: { text: "Payée", kind: "resolved" } },
        { name: "Plomberie", amount: "640 $", before: { text: "À approuver", kind: "neutral" }, after: { text: "Payée", kind: "resolved" } },
        { name: "Ascenseur", amount: "1 150 $", before: { text: "En retard", kind: "attention" }, after: { text: "Payée", kind: "resolved" } },
        { name: "Entretien", amount: "890 $", before: { text: "Planifiée", kind: "neutral" }, after: { text: "Payée", kind: "resolved" } },
      ],
    },
  ],
  selectedCount: "3 sélectionnés",
  combine: "Regrouper en une vue",
  overviewTitle: "Tous les paiements",
  overviewMeta: "Octobre · À jour",
  headline2: "Une vue\nclaire.",
  support2: "Tous vos paiements,\nau même endroit.",
  attention: "1 élément à traiter · Logement 118 · NSF",
  followUp: "À suivre",
  headline3: "Explorez\nla démo.",
  brandLine: "Un concept non officiel\npour TOMSO",
};

export const COPY: Record<Lang, Copy> = { en, fr };
