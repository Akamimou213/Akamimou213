# Structured data for getregular.com

Ahrefs tracked 1,885 pages that added schema and found no measurable lift in AI citations ([May 2026](https://ahrefs.com/blog/schema-ai-citations/)). Google says no special markup is needed for AI features ([AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)). So treat this as hygiene, not a growth lever. It takes about an hour, it makes the entity unambiguous (who the company is, who reviews the content, which app it is), and Google still uses Article, Breadcrumb and Organization markup. Drop these into the Next.js layouts as `<script type="application/ld+json">`.

Rules:
- Use one canonical host everywhere (see the technical fixes in `../STRATEGY.md`). The examples use `https://getregular.com`.
- Never add `aggregateRating` by hand. Only add it if it is pulled live from the App Store and matches what users see there.
- Only list `sameAs` profiles that exist and that the company controls.

## 1. Home page: Organization + MobileApplication + WebSite

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://getregular.com/#org",
      "name": "Get Regular",
      "legalName": "Get Regular Health, Inc.",
      "url": "https://getregular.com/",
      "logo": "https://getregular.com/icon.png",
      "email": "hello@getregular.com",
      "sameAs": [
        "https://apps.apple.com/us/app/get-regular/id6749188690",
        "https://www.instagram.com/get.regular",
        "https://www.tiktok.com/@getregular",
        "https://www.linkedin.com/company/get-regular/"
      ]
    },
    {
      "@type": "MobileApplication",
      "@id": "https://getregular.com/#app",
      "name": "Get Regular",
      "operatingSystem": "iOS",
      "applicationCategory": "HealthApplication",
      "description": "Get Regular is an AI gut health tracker that analyzes stool photos on the Bristol Stool Scale, meals and symptoms to help people with constipation, bloating and IBS find their triggers. Built with a board-certified gastroenterologist.",
      "downloadUrl": "https://apps.apple.com/us/app/get-regular/id6749188690",
      "publisher": { "@id": "https://getregular.com/#org" },
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
    },
    {
      "@type": "WebSite",
      "@id": "https://getregular.com/#website",
      "url": "https://getregular.com/",
      "name": "Get Regular",
      "publisher": { "@id": "https://getregular.com/#org" }
    }
  ]
}
```

`offers.price` assumes the download is free, with in-app purchases. Confirm this against the App Store listing before shipping.

## 2. Medical reviewer: Person (on /about/medical-review and on every article)

```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": "https://getregular.com/about/medical-review#schopis",
  "name": "Michael Schopis, MD",
  "jobTitle": "Board-Certified Gastroenterologist",
  "affiliation": [
    { "@type": "Organization", "name": "Manhattan Gastroenterology" }
  ],
  "worksFor": { "@id": "https://getregular.com/#org" },
  "url": "https://getregular.com/about/medical-review"
}
```

Before shipping, add `sameAs` entries for Dr. Schopis's own public profiles (practice bio page, Doximity, LinkedIn), and confirm the affiliations with him. The home page lists NY Presbyterian, Weill Cornell and Manhattan Gastroenterology.

## 3. Articles: MedicalWebPage / BlogPosting with a named author and reviewer

Today the article schema says `"author": {"@type": "Organization", "name": "Get Regular Team"}` and has no reviewer. For a health topic (YMYL), use a named author plus `reviewedBy` and `lastReviewed`:

```json
{
  "@context": "https://schema.org",
  "@type": ["BlogPosting", "MedicalWebPage"],
  "headline": "Bristol Stool Chart: The 7 Poop Types and What They Mean",
  "datePublished": "2026-10-20",
  "dateModified": "2026-11-05",
  "lastReviewed": "2026-11-05",
  "author": { "@type": "Person", "name": "<writer name>", "url": "https://getregular.com/about/team#<writer>" },
  "reviewedBy": { "@id": "https://getregular.com/about/medical-review#schopis" },
  "publisher": { "@id": "https://getregular.com/#org" },
  "about": { "@type": "MedicalCondition", "name": "Constipation" },
  "mainEntityOfPage": "https://getregular.com/blog/bristol-stool-chart"
}
```

Show the same facts on the page itself ("Medically reviewed by Michael Schopis, MD · Updated Nov 5, 2026"). Schema that describes something the page doesn't show earns nothing.

## 4. FAQ blocks

Google retired FAQ rich results on May 7, 2026 ([Search Central updates](https://developers.google.com/search/updates)), so `FAQPage` markup no longer earns a SERP feature. Keep the Q&A anyway, as real `<h2>`/`<h3>` question headings with a 40–60-word answer directly underneath, because readers skim pages that way and other engines (Bing, ChatGPT search) still read them. Whether to keep `FAQPage` JSON-LD is optional and low priority.

## 5. BreadcrumbList on articles, compare pages and programmatic pages

Use the standard form, with Home › Journal › Article.
