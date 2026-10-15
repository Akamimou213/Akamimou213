// Site-wide settings. Edit these before going live.
export const config = {
  /** Public URL once the domain is live, e.g. 'https://appfound.co'. Used in the "Ask AI" prompts. */
  siteUrl: '',

  /**
   * Where Growth Plan requests are POSTed as JSON (Formspree). Each request is emailed
   * to the account owner and kept in the Formspree dashboard. If the POST fails, the form falls back to copying the
   * request and opening LinkedIn, so no lead is lost.
   */
  formEndpoint: 'https://formspree.io/f/xgaorogn',

  calendlyUrl: 'https://calendly.com/mohamed-getregular/30min',
  linkedinUrl: 'https://www.linkedin.com/in/mohamed-barkat-9b8278263/',
};
