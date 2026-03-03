/**
 * 📂 Workspace Service — Phase 14: Executive Workspace (Saved Intelligence)
 *
 * File-based persistence for user-generated reports (ICP, Playbook,
 * PESTEL, Market Reports, etc.). Each document is stored as a JSON
 * file inside data/db/workspace/.
 *
 * All methods are async to allow seamless migration to PostgreSQL /
 * Supabase / MongoDB later without changing call sites.
 *
 * Follows the same file-based pattern as services/strategyStore.ts.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WORKSPACE_DIR = path.join(__dirname, '..', 'data', 'db', 'workspace');

// Ensure base directory exists on import
if (!fs.existsSync(WORKSPACE_DIR)) {
  fs.mkdirSync(WORKSPACE_DIR, { recursive: true });
}

// ============================================================================
// TYPES
// ============================================================================

/** Accepted document categories — extend as new report types are added */
export type DocumentType =
  | 'ICP'
  | 'PLAYBOOK'
  | 'PESTEL'
  | 'MARKET_REPORT'
  | 'COMPETITOR_ANALYSIS'
  | 'GTM_STRATEGY';

/** Metadata stored alongside the raw JSON payload */
export interface SavedDocument {
  id: string;
  type: DocumentType;
  title: string;
  /** Optional industry tag for filtering */
  industry: string;
  /** Optional company name for context */
  companyName: string;
  /** The raw JSON report payload (ICP, Playbook, etc.) */
  content: Record<string, unknown>;
  /** ISO timestamp */
  createdAt: string;
  /** ISO timestamp — updated on re-save */
  updatedAt: string;
  /** Source provenance: AI-generated vs template */
  dataSource: 'ai_generated' | 'template' | 'manual';
  /** User-defined tags for search/filter */
  tags: string[];
  /** Soft-delete flag */
  archived: boolean;
}

/** Shape accepted by the save endpoint */
export interface SaveDocumentInput {
  type: DocumentType;
  title: string;
  industry?: string;
  companyName?: string;
  content: Record<string, unknown>;
  dataSource?: 'ai_generated' | 'template' | 'manual';
  tags?: string[];
}

/** Lightweight list item (excludes heavy `content` blob) */
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
// HELPERS
// ============================================================================

function generateId(): string {
  return `doc_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function docPath(id: string): string {
  // Sanitize id for safe filesystem use
  const safeId = id.replace(/[^a-zA-Z0-9_-]/g, '_');
  return path.join(WORKSPACE_DIR, `${safeId}.json`);
}

function readDoc(filePath: string): SavedDocument | null {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as SavedDocument;
  } catch {
    return null;
  }
}

function writeDOC(doc: SavedDocument): void {
  fs.writeFileSync(docPath(doc.id), JSON.stringify(doc, null, 2), 'utf-8');
}

// ============================================================================
// VALID TYPES (for runtime validation)
// ============================================================================

const VALID_TYPES: Set<string> = new Set<string>([
  'ICP',
  'PLAYBOOK',
  'PESTEL',
  'MARKET_REPORT',
  'COMPETITOR_ANALYSIS',
  'GTM_STRATEGY',
]);

export function isValidDocumentType(t: string): t is DocumentType {
  return VALID_TYPES.has(t);
}

// ============================================================================
// SERVICE CLASS
// ============================================================================

export class WorkspaceService {
  // -----------------------------------------------------------------------
  // CREATE / UPDATE
  // -----------------------------------------------------------------------

  /**
   * Save a new document to the workspace.
   * Returns the full persisted document.
   */
  async saveDocument(input: SaveDocumentInput): Promise<SavedDocument> {
    const now = new Date().toISOString();
    const doc: SavedDocument = {
      id: generateId(),
      type: input.type,
      title: input.title.trim(),
      industry: (input.industry ?? '').trim(),
      companyName: (input.companyName ?? '').trim(),
      content: input.content,
      createdAt: now,
      updatedAt: now,
      dataSource: input.dataSource ?? 'manual',
      tags: input.tags ?? [],
      archived: false,
    };

    writeDOC(doc);
    console.log(`📂 Workspace: saved "${doc.title}" (${doc.type}) → ${doc.id}`);
    return doc;
  }

  // -----------------------------------------------------------------------
  // READ — list (lightweight, sorted newest-first)
  // -----------------------------------------------------------------------

  /**
   * Returns all non-archived documents as lightweight list items
   * (content blob excluded to keep responses fast).
   *
   * @param typeFilter  Optional — only return docs of this type
   */
  async getDocuments(typeFilter?: DocumentType): Promise<DocumentListItem[]> {
    const files = fs.readdirSync(WORKSPACE_DIR).filter((f) => f.endsWith('.json'));

    const items: DocumentListItem[] = [];
    for (const file of files) {
      const doc = readDoc(path.join(WORKSPACE_DIR, file));
      if (!doc) continue;
      if (doc.archived) continue;
      if (typeFilter && doc.type !== typeFilter) continue;

      items.push({
        id: doc.id,
        type: doc.type,
        title: doc.title,
        industry: doc.industry,
        companyName: doc.companyName,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        dataSource: doc.dataSource,
        tags: doc.tags,
        archived: doc.archived,
      });
    }

    // Newest first
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return items;
  }

  // -----------------------------------------------------------------------
  // READ — single (full content)
  // -----------------------------------------------------------------------

  /**
   * Returns a single document by ID including its full `content` payload.
   */
  async getDocumentById(id: string): Promise<SavedDocument | null> {
    const filePath = docPath(id);
    if (!fs.existsSync(filePath)) return null;
    return readDoc(filePath);
  }

  // -----------------------------------------------------------------------
  // DELETE (hard delete — removes file from disk)
  // -----------------------------------------------------------------------

  /**
   * Permanently removes a document.
   * Returns `true` if the document existed and was deleted.
   */
  async deleteDocument(id: string): Promise<boolean> {
    const filePath = docPath(id);
    if (!fs.existsSync(filePath)) return false;

    fs.unlinkSync(filePath);
    console.log(`📂 Workspace: deleted document ${id}`);
    return true;
  }

  // -----------------------------------------------------------------------
  // ARCHIVE (soft delete — sets archived flag)
  // -----------------------------------------------------------------------

  /**
   * Soft-deletes a document by setting archived = true.
   * The document remains on disk but is excluded from list queries.
   */
  async archiveDocument(id: string): Promise<SavedDocument | null> {
    const doc = await this.getDocumentById(id);
    if (!doc) return null;

    doc.archived = true;
    doc.updatedAt = new Date().toISOString();
    writeDOC(doc);
    console.log(`📂 Workspace: archived document ${id}`);
    return doc;
  }

  // -----------------------------------------------------------------------
  // UPDATE (re-save with new content)
  // -----------------------------------------------------------------------

  /**
   * Updates an existing document's content and metadata.
   * Returns the updated document or null if not found.
   */
  async updateDocument(
    id: string,
    updates: Partial<Pick<SavedDocument, 'title' | 'content' | 'tags' | 'industry' | 'companyName'>>,
  ): Promise<SavedDocument | null> {
    const doc = await this.getDocumentById(id);
    if (!doc) return null;

    if (updates.title !== undefined) doc.title = updates.title.trim();
    if (updates.content !== undefined) doc.content = updates.content;
    if (updates.tags !== undefined) doc.tags = updates.tags;
    if (updates.industry !== undefined) doc.industry = updates.industry.trim();
    if (updates.companyName !== undefined) doc.companyName = updates.companyName.trim();

    doc.updatedAt = new Date().toISOString();
    writeDOC(doc);
    console.log(`📂 Workspace: updated document ${id}`);
    return doc;
  }

  // -----------------------------------------------------------------------
  // STATS (for dashboard widgets)
  // -----------------------------------------------------------------------

  /**
   * Returns aggregate counts grouped by document type.
   */
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
// SINGLETON INSTANCE
// ============================================================================

let _instance: WorkspaceService | null = null;

export function getWorkspaceService(): WorkspaceService {
  if (!_instance) {
    _instance = new WorkspaceService();
  }
  return _instance;
}
