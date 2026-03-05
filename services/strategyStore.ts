/**
 * Strategy Store — Prisma-backed persistence
 *
 * Stores user strategies in PostgreSQL via Prisma.
 * Falls back to file-based storage when DATABASE_URL is not configured
 * so the server still works in development without a database.
 *
 * Public API is unchanged — server.ts requires no modifications.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// TYPES (identical to before — no breaking changes)
// ============================================================================

export interface Strategy {
    id: string;
    userId: string;
    companyName: string;
    companyId?: string;
    type: 'gtm' | 'competitor' | 'market';
    title?: string;
    description?: string;
    data: any;
    status: 'draft' | 'saved' | 'shared' | 'archived';
    version: number;
    createdAt: string;
    updatedAt: string;
}

export interface StrategyVersion {
    id: string;
    strategyId: string;
    version: number;
    data: any;
    changeLog?: string;
    createdAt: string;
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
// FILE-BASED FALLBACK (dev mode without DB)
// ============================================================================

const STRATEGIES_DIR = path.join(__dirname, '..', 'data', 'db', 'strategies');

function ensureDir(dir: string) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function safeUserId(userId: string) {
    return userId.replace(/[^a-zA-Z0-9_-]/g, '_');
}

function getUserDir(userId: string): string {
    const dir = path.join(STRATEGIES_DIR, safeUserId(userId));
    ensureDir(dir);
    return dir;
}

function getVersionsDir(userId: string, strategyId: string): string {
    const dir = path.join(getUserDir(userId), `${strategyId}_versions`);
    ensureDir(dir);
    return dir;
}

function generateId(): string {
    return `str_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// File-based helpers
function fileReadStrategies(userId: string): Strategy[] {
    ensureDir(STRATEGIES_DIR);
    const dir = getUserDir(userId);
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json') && !f.includes('_versions'));
    const strategies: Strategy[] = [];
    for (const file of files) {
        try { strategies.push(JSON.parse(fs.readFileSync(path.join(dir, file), 'utf-8'))); } catch { /**/ }
    }
    return strategies.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

function fileReadStrategy(userId: string, strategyId: string): Strategy | null {
    const fp = path.join(getUserDir(userId), `${strategyId}.json`);
    if (!fs.existsSync(fp)) return null;
    try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { return null; }
}

function fileWriteStrategy(strategy: Strategy) {
    const fp = path.join(getUserDir(strategy.userId), `${strategy.id}.json`);
    fs.writeFileSync(fp, JSON.stringify(strategy, null, 2), 'utf-8');
}

function fileSaveVersion(userId: string, strategyId: string, version: number, data: any, changeLog?: string) {
    const dir = getVersionsDir(userId, strategyId);
    const entry: StrategyVersion = { id: generateId(), strategyId, version, data, changeLog, createdAt: new Date().toISOString() };
    fs.writeFileSync(path.join(dir, `v${version}.json`), JSON.stringify(entry, null, 2), 'utf-8');
}

function fileReadVersions(userId: string, strategyId: string): StrategyVersion[] {
    const dir = getVersionsDir(userId, strategyId);
    if (!fs.existsSync(dir)) return [];
    const versions: StrategyVersion[] = [];
    for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.json'))) {
        try { versions.push(JSON.parse(fs.readFileSync(path.join(dir, file), 'utf-8'))); } catch { /**/ }
    }
    return versions.sort((a, b) => b.version - a.version);
}

// ============================================================================
// DB → TS MAPPER
// ============================================================================

function dbToStrategy(row: any): Strategy {
    return {
        id: row.id,
        userId: row.userId,
        companyName: row.companyName,
        companyId: row.companyId ?? undefined,
        type: (row.type || 'gtm') as Strategy['type'],
        title: row.title ?? undefined,
        description: row.description ?? undefined,
        data: row.data,
        status: (row.status || 'saved') as Strategy['status'],
        version: row.version,
        createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
        updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : row.updatedAt,
    };
}

function dbToVersion(row: any): StrategyVersion {
    return {
        id: row.id,
        strategyId: row.strategyId,
        version: row.version,
        data: row.data,
        changeLog: row.changeLog ?? undefined,
        createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
    };
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Get all strategies for a user (sorted newest first)
 */
export async function getUserStrategies(userId: string): Promise<Strategy[]> {
    const prisma = await getPrisma();
    if (!prisma) {
        return fileReadStrategies(userId);
    }
    try {
        const rows = await prisma.strategy.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
        });
        return rows.map(dbToStrategy);
    } catch (e) {
        console.warn('[strategyStore] Prisma error, falling back to file:', e);
        return fileReadStrategies(userId);
    }
}

/**
 * Get a single strategy by ID
 */
export async function getStrategy(userId: string, strategyId: string): Promise<Strategy | null> {
    const prisma = await getPrisma();
    if (!prisma) return fileReadStrategy(userId, strategyId);
    try {
        const row = await prisma.strategy.findFirst({ where: { id: strategyId, userId } });
        return row ? dbToStrategy(row) : null;
    } catch {
        return fileReadStrategy(userId, strategyId);
    }
}

/**
 * Save or update a strategy (upsert by userId + companyName + type)
 */
export async function saveStrategy(
    userId: string,
    companyName: string,
    type: string,
    strategyData: any,
    options?: { title?: string; description?: string; companyId?: string }
): Promise<{ strategy: Strategy; isNew: boolean }> {
    const prisma = await getPrisma();
    const now = new Date().toISOString();

    if (!prisma) {
        // File-based fallback
        const existing = fileReadStrategies(userId).find(s => s.companyName === companyName && s.type === type);
        if (existing) {
            fileSaveVersion(userId, existing.id, existing.version, existing.data, 'Auto-save before update');
            const updated: Strategy = {
                ...existing, data: strategyData, title: options?.title || existing.title,
                description: options?.description || existing.description,
                version: existing.version + 1, status: 'saved', updatedAt: now,
            };
            fileWriteStrategy(updated);
            return { strategy: updated, isNew: false };
        }
        const id = generateId();
        const strategy: Strategy = {
            id, userId, companyName, companyId: options?.companyId,
            type: type as Strategy['type'],
            title: options?.title || `${type.toUpperCase()} - ${companyName}`,
            description: options?.description, data: strategyData, status: 'saved',
            version: 1, createdAt: now, updatedAt: now,
        };
        fileWriteStrategy(strategy);
        return { strategy, isNew: true };
    }

    try {
        // Check if strategy exists
        const existing = await prisma.strategy.findFirst({
            where: { userId, companyName, type },
        });

        if (existing) {
            // Save version snapshot before updating
            await prisma.strategyVersion.create({
                data: {
                    strategyId: existing.id,
                    version: existing.version,
                    data: existing.data,
                    changeLog: 'Auto-save before update',
                },
            });
            // Update strategy
            const updated = await prisma.strategy.update({
                where: { id: existing.id },
                data: {
                    data: strategyData,
                    title: options?.title || existing.title,
                    description: options?.description || existing.description,
                    version: { increment: 1 },
                    status: 'saved',
                },
            });
            return { strategy: dbToStrategy(updated), isNew: false };
        }

        // Create new
        const created = await prisma.strategy.create({
            data: {
                userId,
                companyName,
                companyId: options?.companyId ?? null,
                type: type,
                title: options?.title || `${type.toUpperCase()} - ${companyName}`,
                description: options?.description ?? null,
                data: strategyData,
                status: 'saved',
                version: 1,
            },
        });
        return { strategy: dbToStrategy(created), isNew: true };
    } catch (e) {
        console.warn('[strategyStore] Prisma save error, falling back to file:', e);
        // Fallback
        const id = generateId();
        const strategy: Strategy = {
            id, userId, companyName, companyId: options?.companyId,
            type: type as Strategy['type'],
            title: options?.title || `${type.toUpperCase()} - ${companyName}`,
            description: options?.description, data: strategyData, status: 'saved',
            version: 1, createdAt: now, updatedAt: now,
        };
        fileWriteStrategy(strategy);
        return { strategy, isNew: true };
    }
}

/**
 * Delete a strategy and all its versions
 */
export async function deleteStrategy(userId: string, strategyId: string): Promise<boolean> {
    const prisma = await getPrisma();
    if (!prisma) {
        const fp = path.join(getUserDir(userId), `${strategyId}.json`);
        if (!fs.existsSync(fp)) return false;
        const versDir = path.join(getUserDir(userId), `${strategyId}_versions`);
        if (fs.existsSync(versDir)) fs.rmSync(versDir, { recursive: true, force: true });
        fs.unlinkSync(fp);
        return true;
    }
    try {
        const existing = await prisma.strategy.findFirst({ where: { id: strategyId, userId } });
        if (!existing) return false;
        await prisma.strategy.delete({ where: { id: strategyId } }); // cascades versions
        return true;
    } catch {
        return false;
    }
}

/**
 * Get version history for a strategy
 */
export async function getStrategyVersions(userId: string, strategyId: string): Promise<StrategyVersion[]> {
    const prisma = await getPrisma();
    if (!prisma) return fileReadVersions(userId, strategyId);
    try {
        const rows = await prisma.strategyVersion.findMany({
            where: { strategyId },
            orderBy: { version: 'desc' },
        });
        return rows.map(dbToVersion);
    } catch {
        return fileReadVersions(userId, strategyId);
    }
}

/**
 * Restore a strategy to a specific version
 */
export async function restoreVersion(userId: string, strategyId: string, version: number): Promise<Strategy | null> {
    const prisma = await getPrisma();
    if (!prisma) {
        const strategy = fileReadStrategy(userId, strategyId);
        if (!strategy) return null;
        const versions = fileReadVersions(userId, strategyId);
        const target = versions.find(v => v.version === version);
        if (!target) return null;
        fileSaveVersion(userId, strategyId, strategy.version, strategy.data, `Before restore to v${version}`);
        const restored: Strategy = {
            ...strategy, data: target.data,
            version: strategy.version + 1, status: 'saved', updatedAt: new Date().toISOString(),
        };
        fileWriteStrategy(restored);
        return restored;
    }
    try {
        const strategy = await prisma.strategy.findFirst({ where: { id: strategyId, userId } });
        if (!strategy) return null;
        const target = await prisma.strategyVersion.findFirst({ where: { strategyId, version } });
        if (!target) return null;
        // Save current as version before restoring
        await prisma.strategyVersion.create({
            data: {
                strategyId,
                version: strategy.version,
                data: strategy.data,
                changeLog: `Before restore to v${version}`,
            },
        });
        const restored = await prisma.strategy.update({
            where: { id: strategyId },
            data: { data: target.data, version: { increment: 1 }, status: 'saved' },
        });
        return dbToStrategy(restored);
    } catch {
        return null;
    }
}
