/**
 * File-based Strategy Store for VICO
 * 
 * Persists user strategies as JSON files on disk.
 * Each user gets a folder: data/db/strategies/{userId}/
 * Each strategy is a JSON file: {strategyId}.json
 * 
 * When Supabase/PostgreSQL becomes available, migrate to Prisma ORM.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STRATEGIES_DIR = path.join(__dirname, '..', 'data', 'db', 'strategies');

// Ensure base directory exists
if (!fs.existsSync(STRATEGIES_DIR)) {
    fs.mkdirSync(STRATEGIES_DIR, { recursive: true });
}

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

function generateId(): string {
    return `str_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function getUserDir(userId: string): string {
    // Sanitize userId for safe filesystem use
    const safeId = userId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const dir = path.join(STRATEGIES_DIR, safeId);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
}

function getVersionsDir(userId: string, strategyId: string): string {
    const dir = path.join(getUserDir(userId), `${strategyId}_versions`);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
}

/**
 * Get all strategies for a user
 */
export function getUserStrategies(userId: string): Strategy[] {
    const dir = getUserDir(userId);
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json') && !f.includes('_versions'));
    
    const strategies: Strategy[] = [];
    for (const file of files) {
        try {
            const data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf-8'));
            strategies.push(data);
        } catch {
            // Skip corrupted files
        }
    }
    
    // Sort by updatedAt descending
    strategies.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return strategies;
}

/**
 * Get a single strategy by ID
 */
export function getStrategy(userId: string, strategyId: string): Strategy | null {
    const filePath = path.join(getUserDir(userId), `${strategyId}.json`);
    if (!fs.existsSync(filePath)) return null;
    
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch {
        return null;
    }
}

/**
 * Save or update a strategy (upsert by userId + companyName + type)
 */
export function saveStrategy(
    userId: string,
    companyName: string,
    type: string,
    strategyData: any,
    options?: { title?: string; description?: string; companyId?: string }
): { strategy: Strategy; isNew: boolean } {
    // Check if strategy already exists for this user + company + type
    const existing = getUserStrategies(userId).find(
        s => s.companyName === companyName && s.type === type
    );
    
    const now = new Date().toISOString();
    
    if (existing) {
        // Save current version before updating
        saveVersion(userId, existing.id, existing.version, existing.data, 'Auto-save before update');
        
        // Update existing
        const updated: Strategy = {
            ...existing,
            data: strategyData,
            title: options?.title || existing.title,
            description: options?.description || existing.description,
            version: existing.version + 1,
            status: 'saved',
            updatedAt: now,
        };
        
        const filePath = path.join(getUserDir(userId), `${existing.id}.json`);
        fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), 'utf-8');
        
        return { strategy: updated, isNew: false };
    }
    
    // Create new strategy
    const id = generateId();
    const strategy: Strategy = {
        id,
        userId,
        companyName,
        companyId: options?.companyId,
        type: type as Strategy['type'],
        title: options?.title || `${type.toUpperCase()} - ${companyName}`,
        description: options?.description,
        data: strategyData,
        status: 'saved',
        version: 1,
        createdAt: now,
        updatedAt: now,
    };
    
    const filePath = path.join(getUserDir(userId), `${id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(strategy, null, 2), 'utf-8');
    
    return { strategy, isNew: true };
}

/**
 * Delete a strategy
 */
export function deleteStrategy(userId: string, strategyId: string): boolean {
    const filePath = path.join(getUserDir(userId), `${strategyId}.json`);
    if (!fs.existsSync(filePath)) return false;
    
    // Also delete versions
    const versionsDir = path.join(getUserDir(userId), `${strategyId}_versions`);
    if (fs.existsSync(versionsDir)) {
        fs.rmSync(versionsDir, { recursive: true, force: true });
    }
    
    fs.unlinkSync(filePath);
    return true;
}

/**
 * Save a version snapshot
 */
function saveVersion(userId: string, strategyId: string, version: number, data: any, changeLog?: string): void {
    const dir = getVersionsDir(userId, strategyId);
    const versionEntry: StrategyVersion = {
        id: generateId(),
        strategyId,
        version,
        data,
        changeLog,
        createdAt: new Date().toISOString(),
    };
    
    fs.writeFileSync(
        path.join(dir, `v${version}.json`),
        JSON.stringify(versionEntry, null, 2),
        'utf-8'
    );
}

/**
 * Get version history for a strategy
 */
export function getStrategyVersions(userId: string, strategyId: string): StrategyVersion[] {
    const dir = getVersionsDir(userId, strategyId);
    if (!fs.existsSync(dir)) return [];
    
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
    const versions: StrategyVersion[] = [];
    
    for (const file of files) {
        try {
            const data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf-8'));
            versions.push(data);
        } catch {
            // Skip corrupted files
        }
    }
    
    // Sort by version descending
    versions.sort((a, b) => b.version - a.version);
    return versions;
}

/**
 * Restore a strategy to a specific version
 */
export function restoreVersion(userId: string, strategyId: string, version: number): Strategy | null {
    const strategy = getStrategy(userId, strategyId);
    if (!strategy) return null;
    
    const versions = getStrategyVersions(userId, strategyId);
    const targetVersion = versions.find(v => v.version === version);
    if (!targetVersion) return null;
    
    // Save current version first
    saveVersion(userId, strategyId, strategy.version, strategy.data, `Before restore to v${version}`);
    
    // Restore
    const now = new Date().toISOString();
    const restored: Strategy = {
        ...strategy,
        data: targetVersion.data,
        version: strategy.version + 1,
        status: 'saved',
        updatedAt: now,
    };
    
    const filePath = path.join(getUserDir(userId), `${strategyId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(restored, null, 2), 'utf-8');
    
    return restored;
}
