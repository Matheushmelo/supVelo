import { eq, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { 
  Conversation, 
  CreateConversationInput, 
  UpdateConversationInput 
} from '@domain/entities';
import { ConversationStatus, Sector } from '@domain/enums';
import { IConversationRepository } from '@application/ports';
import { DrizzleDB } from '../connection';
import { conversations, ConversationRow } from '../schema';

export class SQLiteConversationRepository implements IConversationRepository {
  constructor(private db: DrizzleDB) {}

  findById(id: string): Conversation | null {
    const row = this.db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id))
      .get();
    return row ? this.toEntity(row) : null;
  }

  findAll(): Conversation[] {
    const rows = this.db
      .select()
      .from(conversations)
      .orderBy(desc(conversations.updatedAt))
      .all();
    return rows.map((r) => this.toEntity(r));
  }

  create(input: CreateConversationInput): Conversation {
    const id = uuidv4();
    const now = new Date().toISOString();
    this.db.insert(conversations).values({
      id,
      clientName: input.clientName,
      status: ConversationStatus.BOT,
      createdAt: now,
      updatedAt: now,
    }).run();
    return this.findById(id)!;
  }

  update(id: string, input: UpdateConversationInput): Conversation {
    const now = new Date().toISOString();
    this.db
      .update(conversations)
      .set({ ...input, updatedAt: now})
      .where(eq(conversations.id, id)) 
      .run();
    const updated = this.findById(id);
    if (!updated) throw new Error(`Conversa ${id} não encontrada`);
    return updated;
  }

  private toEntity(row: ConversationRow): Conversation {
    return {
      id: row.id,
      clientName: row.clientName,
      status: row.status as ConversationStatus,
      sector: row.sector as Sector | null,
      intent: row.intent,
      summary: row.summary,
      confidence: row.confidence,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }
}