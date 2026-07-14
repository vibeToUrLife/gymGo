"use client";

import { useI18n } from "@/lib/i18n";

export function FooterNote() {
  const { t } = useI18n();
  return <p>{t("builtWith")}</p>;
}
