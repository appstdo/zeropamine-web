import { redirect } from "next/navigation";
import { defaultLocale } from "@/i18n/routing";

export default function Root() {
  redirect(`/${defaultLocale}`); // as-needed 철학과는 살짝 어긋나지만 실용적
}
