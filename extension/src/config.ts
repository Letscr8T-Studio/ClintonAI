import { appRoutes } from "@/config/routes";

/** https://tryclinton.com in the store build, http://localhost:3000 with `npm run ext:dev`. */
export const CLINTON_URL = __CLINTON_URL__;

export const links = {
  login: `${CLINTON_URL}${appRoutes.login}`,
  home: `${CLINTON_URL}${appRoutes.home}`,
  settings: `${CLINTON_URL}${appRoutes.settings}`,
  gmail: "https://mail.google.com/",
} as const;
