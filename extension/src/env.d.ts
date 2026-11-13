/// <reference types="chrome" />
/// <reference types="vite/client" />

/** The Clinton AI site this build talks to, set by scripts/build-extension.mjs. */
declare const __CLINTON_URL__: string;

/** True in `npm run ext:dev` builds: shows the debug readout in Gmail. False in store builds. */
declare const __DEV__: boolean;
