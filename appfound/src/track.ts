// Fires conversion events into whatever tags are installed (GTM dataLayer, Meta Pixel, TikTok Pixel).
// Nothing is sent anywhere unless those tags are added to the page.
type Dict = Record<string, unknown>;
declare global {
  interface Window {
    dataLayer?: Dict[];
    fbq?: (...args: unknown[]) => void;
    ttq?: { track: (event: string, data?: Dict) => void };
  }
}

export function track(event: string, data: Dict = {}) {
  window.dataLayer?.push({ event, ...data });
  if (event === 'growth_plan_submit') {
    window.fbq?.('track', 'Lead', data);
    window.ttq?.track('SubmitForm', data);
  }
}
