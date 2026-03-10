import { eq, asc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { Message, CreateMessageInput } from '@domain/entities';
import { MessageRole } from '@domain/enums';
import { IMessageRepository } from '@application/ports';
import { DrizzleDB } from '../connection';
import { messages, MessageRow } from '../schema';

export class SQLiteMessageRepository implements IMessageRepository {
  constructor(private readonly db: DrizzleDB) {}

  findByConversationId(conversationId: string): Message[] {
    const rows = this.db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(asc(messages.createdAt))
      .all();
    return rows.map((r) => this.toEntity(r));
  }

  create(input: CreateMessageInput): Message {
    const id = uuidv4();
    const now = new Date().toISOString();
    this.db.insert(messages).values({
      id,
      conversationId: input.conversationId,
      role: input.role,
      content: input.content,
      createdAt: now,
    }).run();
    return {
      id,
      conversationId: input.conversationId,
      role: input.role as MessageRole,
      content: input.content,
      createdAt: new Date(now),
    };
  }

  private toEntity(row: MessageRow): Message {
    return {
      id: row.id,
      conversationId: row.conversationId,
      role: row.role as MessageRole,
      content: row.content,
      createdAt: new Date(row.createdAt),
    };
  }
}