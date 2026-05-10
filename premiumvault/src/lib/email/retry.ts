import { prisma } from "@/lib/db";
import { _attemptSend } from "./send";

export async function runEmailRetry(): Promise<{ tried: number; succeeded: number }> {
  const due = await prisma.emailLog.findMany({
    where: {
      status: "FAILED",
      nextRetry: { lte: new Date() },
    },
    orderBy: { createdAt: "asc" },
    take: 20,
  });

  let succeeded = 0;
  for (const log of due) {
    try {
      await _attemptSend({
        logId: log.id,
        to: log.to,
        subject: log.subject,
        html: log.html,
        orderId: log.orderId,
        attempt: log.attempts,
      });
      succeeded++;
    } catch {
      // already logged inside _attemptSend
    }
  }

  return { tried: due.length, succeeded };
}
