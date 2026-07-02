import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["vn", "en", "zh", "ko"],
  defaultLocale: "vn",
});
