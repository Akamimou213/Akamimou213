import '@fontsource-variable/archivo/wdth.css';
import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/600.css';
import 'lenis/dist/lenis.css';
import './styles.css';

// Paint first, then load the motion code (GSAP, ScrollTrigger, Lenis) as its own chunk, so it never
// delays the first render. The hero headline and ledger stay hidden until it runs (2.5s CSS fallback).
requestAnimationFrame(() => setTimeout(() => import('./app'), 0));
