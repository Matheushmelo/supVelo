import { Message } from "@domain/entities";
import { TriageResult } from "@domain/value-objects/TriageResult";

export interface IAIProvider {
  processMessage(
    messages: Message[],
    onToken?: (token: string) => void
  ): Promise<TriageResult>;
}