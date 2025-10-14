import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";

export default async function Root() {
  const locale = await getLocale();
  redirect(`/${locale}`); // as-needed 철학과는 살짝 어긋나지만 실용적
}
