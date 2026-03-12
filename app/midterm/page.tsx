import { MidtermPageClient } from "@/components/midterm/midterm-page-client";
import { loadMidtermBank } from "@/lib/midterm/load-bank";

export default function MidtermPage() {
  const bank = loadMidtermBank();

  return <MidtermPageClient bank={bank} />;
}
