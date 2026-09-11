import { requireOwner } from '@/lib/auth';

/**
 * Auth gate for every console page (dashboard, section editors, media).
 * Lives in the (console) route group so /jackal/login stays outside it.
 * Page-level, so the console cannot render for anyone but the verified
 * owner - independent of middleware or deployment configuration.
 */
export default async function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireOwner();
  return <>{children}</>;
}
