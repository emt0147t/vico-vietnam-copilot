/**
 * 📂 Workspace Service — Prisma-backed persistence
 *
 * Stores executive workspace documents (ICP, Playbook, PESTEL, etc.) in
 * PostgreSQL via Prisma. Falls back to file-based storage when DATABASE_URL
 * is not configured so dev mode still works.
 *
 * All methods are async — call sites in server.ts are unchanged.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// TYPES (identical to before — no breaking changes)
// ============================================================================

export type DocumentType =
  | 'ICP'
  | 'PLAYBOOK'
  | 'PESTEL'
  | 'MARKET_REPORT'
  | 'COMPETITOR_ANALYSIS'
  | 'GTM_STRATEGY';

export interface SavedDocument {
  id: string;
  type: DocumentType;
  title: string;
  industry: string;
  companyName: string;
  content: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  dataSource: 'ai_generated' | 'template' | 'manual';
  tags: string[];
  archived: boolean;
}

export interface SaveDocumentInput {
  type: DocumentType;
  title: string;
  industry?: string;
  companyName?: string;
  content: Record<string, unknown>;
  dataSource?: 'ai_generated' | 'template' | 'manual';
  tags?: string[];
}

export interface DocumentListItem {
  id: string;
  type: DocumentType;
  title: string;
  industry: string;
  companyName: string;
  createdAt: string;
  updatedAt: string;
  dataSource: 'ai_generated' | 'template' | 'manual';
  tags: string[];
  archived: boolean;
}

// ============================================================================
// VALID TYPES (runtime validation)
// ============================================================================

const VALID_TYPES: Set<string> = new Set<string>([
  'ICP', 'PLAYBOOK', 'PESTEL', 'MARKET_REPORT', 'COMPETITOR_ANALYSIS', 'GTM_STRATEGY',
]);

export function isValidDocumentType(t: string): t is DocumentType {
  return VALID_TYPES.has(t);
}

// ============================================================================
// PRISMA LAZY INIT
// ============================================================================

let _prisma: any = null;

async function getPrisma(): Promise<any | null> {
  if (_prisma) return _prisma;
  if (!process.env['DATABASE_URL']) return null;
  try {
    const { PrismaClient } = await import('@prisma/client');
    _prisma = new PrismaClient();
    return _prisma;
  } catch {
    return null;
  }
}

// ============================================================================
// FILE-BASED FALLBACK
// ============================================================================

const WORKSPACE_DIR = path.join(__dirname, '..', 'data', 'db', 'workspace');

function ensureWorkspaceDir() {
  if (!fs.existsSync(WORKSPACE_DIR)) fs.mkdirSync(WORKSPACE_DIR, { recursive: true });
}

function docPath(id: string): string {
  const safeId = id.replace(/[^a-zA-Z0-9_-]/g, '_');
  return path.join(WORKSPACE_DIR, `${safeId}.json`);
}

function fileReadDoc(filePath: string): SavedDocument | null {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as SavedDocument; }
  catch { return null; }
}

function fileWriteDoc(doc: SavedDocument): void {
  ensureWorkspaceDir();
  fs.writeFileSync(docPath(doc.id), JSON.stringify(doc, null, 2), 'utf-8');
}

function fileGenerateId(): string {
  return `doc_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function fileListDocs(typeFilter?: DocumentType): SavedDocument[] {
  ensureWorkspaceDir();
  return fs.readdirSync(WORKSPACE_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => fileReadDoc(path.join(WORKSPACE_DIR, f)))
    .filter((d): d is SavedDocument => d !== null && !d.archived && (!typeFilter || d.type === typeFilter));
}

// ============================================================================
// DB → TS MAPPER
// ============================================================================

function dbToDoc(row: any): SavedDocument {
  return {
    id: row.id,
    type: row.type as DocumentType,
    title: row.title,
    industry: row.industry ?? '',
    companyName: row.companyName ?? '',
    content: row.content as Record<string, unknown>,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
    updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : row.updatedAt,
    dataSource: (row.dataSource ?? 'manual') as SavedDocument['dataSource'],
    tags: row.tags ?? [],
    archived: row.archived ?? false,
  };
}

function toListItem(doc: SavedDocument): DocumentListItem {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { content: _content, ...rest } = doc;
  return rest as DocumentListItem;
}

// ============================================================================
// SERVICE CLASS
// ============================================================================

export class WorkspaceService {

  async saveDocument(input: SaveDocumentInput): Promise<SavedDocument> {
    const now = new Date().toISOString();
    const prisma = await getPrisma();

    if (!prisma) {
      // File fallback
      const doc: SavedDocument = {
        id: fileGenerateId(), type: input.type, title: input.title.trim(),
        industry: (input.industry ?? '').trim(), companyName: (input.companyName ?? '').trim(),
        content: input.content, createdAt: now, updatedAt: now,
        dataSource: input.dataSource ?? 'manual', tags: input.tags ?? [], archived: false,
      };
      fileWriteDoc(doc);
      console.log(`📂 Workspace (file): saved "${doc.title}" (${doc.type}) → ${doc.id}`);
      return doc;
    }

    try {
      const row = await prisma.workspaceDocument.create({
        data: {
          type: input.type,
          title: input.title.trim(),
          industry: input.industry?.trim() ?? null,
          companyName: input.companyName?.trim() ?? null,
          content: input.content,
          dataSource: input.dataSource ?? 'manual',
          tags: input.tags ?? [],
          archived: false,
        },
      });
      console.log(`📂 Workspace (DB): saved "${row.title}" (${row.type}) → ${row.id}`);
      return dbToDoc(row);
    } catch (e) {
      console.warn('[workspaceService] Prisma error, falling back to file:', e);
      const doc: SavedDocument = {
        id: fileGenerateId(), type: input.type, title: input.title.trim(),
        industry: (input.industry ?? '').trim(), companyName: (input.companyName ?? '').trim(),
        content: input.content, createdAt: now, updatedAt: now,
        dataSource: input.dataSource ?? 'manual', tags: input.tags ?? [], archived: false,
      };
      fileWriteDoc(doc);
      return doc;
    }
  }

  async getDocuments(typeFilter?: DocumentType): Promise<DocumentListItem[]> {
    const prisma = await getPrisma();

    if (!prisma) {
      return fileListDocs(typeFilter)
        .map(toListItem)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    try {
      const rows = await prisma.workspaceDocument.findMany({
        where: { archived: false, ...(typeFilter ? { type: typeFilter } : {}) },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, type: true, title: true, industry: true, companyName: true,
          createdAt: true, updatedAt: true, dataSource: true, tags: true, archived: true,
        },
      });
      return rows.map((r: any) => ({
        id: r.id, type: r.type as DocumentType, title: r.title,
        industry: r.industry ?? '', companyName: r.companyName ?? '',
        createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
        updatedAt: r.updatedAt instanceof Date ? r.updatedAt.toISOString() : r.updatedAt,
        dataSource: r.dataSource as SavedDocument['dataSource'], tags: r.tags ?? [], archived: r.archived,
      }));
    } catch (e) {
      console.warn('[workspaceService] Prisma list error, falling back to file:', e);
      return fileListDocs(typeFilter)
        .map(toListItem)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }

  async getDocumentById(id: string): Promise<SavedDocument | null> {
    const prisma = await getPrisma();
    if (!prisma) return fileReadDoc(docPath(id));
    try {
      const row = await prisma.workspaceDocument.findUnique({ where: { id } });
      return row ? dbToDoc(row) : null;
    } catch {
      return fileReadDoc(docPath(id));
    }
  }

  async deleteDocument(id: string): Promise<boolean> {
    const prisma = await getPrisma();
    if (!prisma) {
      const fp = docPath(id);
      if (!fs.existsSync(fp)) return false;
      fs.unlinkSync(fp);
      return true;
    }
    try {
      await prisma.workspaceDocument.delete({ where: { id } });
      console.log(`📂 Workspace (DB): deleted ${id}`);
      return true;
    } catch {
      return false;
    }
  }

  async archiveDocument(id: string): Promise<SavedDocument | null> {
    const prisma = await getPrisma();
    if (!prisma) {
      const doc = fileReadDoc(docPath(id));
      if (!doc) return null;
      doc.archived = true; doc.updatedAt = new Date().toISOString();
      fileWriteDoc(doc); return doc;
    }
    try {
      const row = await prisma.workspaceDocument.update({
        where: { id }, data: { archived: true },
      });
      return dbToDoc(row);
    } catch { return null; }
  }

  async updateDocument(
    id: string,
    updates: Partial<Pick<SavedDocument, 'title' | 'content' | 'tags' | 'industry' | 'companyName'>>,
  ): Promise<SavedDocument | null> {
    const prisma = await getPrisma();
    if (!prisma) {
      const doc = fileReadDoc(docPath(id));
      if (!doc) return null;
      if (updates.title !== undefined) doc.title = updates.title.trim();
      if (updates.content !== undefined) doc.content = updates.content;
      if (updates.tags !== undefined) doc.tags = updates.tags;
      if (updates.industry !== undefined) doc.industry = updates.industry.trim();
      if (updates.companyName !== undefined) doc.companyName = updates.companyName.trim();
      doc.updatedAt = new Date().toISOString();
      fileWriteDoc(doc); return doc;
    }
    try {
      const row = await prisma.workspaceDocument.update({
        where: { id },
        data: {
          ...(updates.title !== undefined && { title: updates.title.trim() }),
          ...(updates.content !== undefined && { content: updates.content }),
          ...(updates.tags !== undefined && { tags: updates.tags }),
          ...(updates.industry !== undefined && { industry: updates.industry.trim() }),
          ...(updates.companyName !== undefined && { companyName: updates.companyName.trim() }),
        },
      });
      return dbToDoc(row);
    } catch { return null; }
  }

  async getStats(): Promise<{ type: DocumentType; count: number }[]> {
    const docs = await this.getDocuments();
    const counts = new Map<DocumentType, number>();
    for (const doc of docs) {
      counts.set(doc.type, (counts.get(doc.type) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
  }
}

// ============================================================================
// SINGLETON
// ============================================================================

let _instance: WorkspaceService | null = null;

export function getWorkspaceService(): WorkspaceService {
  if (!_instance) _instance = new WorkspaceService();
  return _instance;
}
