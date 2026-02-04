/**
 * Background Job Queue - BullMQ-like job processing
 * 
 * Features:
 * - Priority queue with scheduling
 * - Retry with exponential backoff
 * - Concurrency control
 * - Job status tracking
 * - Cron-like scheduling
 * 
 * Note: This is a simplified in-memory implementation.
 * For production, use BullMQ with Redis.
 */

// ============================================================================
// TYPES
// ============================================================================

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'delayed';

export interface Job<T = unknown> {
  id: string;
  queue: string;
  name: string;
  data: T;
  priority: number;
  status: JobStatus;
  attempts: number;
  maxAttempts: number;
  lastError?: string;
  createdAt: Date;
  scheduledAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  result?: unknown;
}

export interface JobOptions {
  priority?: number;
  delay?: number; // ms
  maxAttempts?: number;
}

export type JobHandler<T = unknown, R = unknown> = (job: Job<T>) => Promise<R>;

export interface QueueConfig {
  name: string;
  concurrency?: number;
  defaultPriority?: number;
  defaultMaxAttempts?: number;
  retryDelayMs?: number;
}

// ============================================================================
// JOB QUEUE IMPLEMENTATION
// ============================================================================

class JobQueue<T = unknown> {
  private jobs: Map<string, Job<T>> = new Map();
  private handlers: Map<string, JobHandler<T>> = new Map();
  private processing: Set<string> = new Set();
  private intervalId?: NodeJS.Timeout;

  constructor(private config: QueueConfig) {}

  /**
   * Register a job handler
   */
  process(jobName: string, handler: JobHandler<T>): void {
    this.handlers.set(jobName, handler);
    console.log(`📝 Registered handler for job: ${this.config.name}/${jobName}`);
  }

  /**
   * Add a job to the queue
   */
  async add(jobName: string, data: T, options: JobOptions = {}): Promise<Job<T>> {
    const job: Job<T> = {
      id: `${this.config.name}_${jobName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      queue: this.config.name,
      name: jobName,
      data,
      priority: options.priority ?? this.config.defaultPriority ?? 0,
      status: options.delay ? 'delayed' : 'pending',
      attempts: 0,
      maxAttempts: options.maxAttempts ?? this.config.defaultMaxAttempts ?? 3,
      createdAt: new Date(),
      scheduledAt: new Date(Date.now() + (options.delay ?? 0)),
    };

    this.jobs.set(job.id, job);
    console.log(`➕ Added job: ${job.id} (scheduled: ${job.scheduledAt.toISOString()})`);
    
    return job;
  }

  /**
   * Add multiple jobs in bulk
   */
  async addBulk(
    jobName: string,
    items: T[],
    options: JobOptions = {}
  ): Promise<Job<T>[]> {
    const jobs: Job<T>[] = [];
    
    for (let i = 0; i < items.length; i++) {
      // Stagger jobs to avoid overwhelming the system
      const delay = (options.delay ?? 0) + (i * 100);
      const job = await this.add(jobName, items[i], { ...options, delay });
      jobs.push(job);
    }

    console.log(`➕ Added ${jobs.length} bulk jobs to ${this.config.name}/${jobName}`);
    return jobs;
  }

  /**
   * Get job by ID
   */
  getJob(jobId: string): Job<T> | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Get all jobs with optional filter
   */
  getJobs(filter?: { status?: JobStatus; name?: string }): Job<T>[] {
    let jobs = Array.from(this.jobs.values());
    
    if (filter?.status) {
      jobs = jobs.filter(j => j.status === filter.status);
    }
    if (filter?.name) {
      jobs = jobs.filter(j => j.name === filter.name);
    }

    return jobs.sort((a, b) => b.priority - a.priority || a.scheduledAt.getTime() - b.scheduledAt.getTime());
  }

  /**
   * Start processing jobs
   */
  start(): void {
    if (this.intervalId) return;

    const concurrency = this.config.concurrency ?? 4;
    
    this.intervalId = setInterval(async () => {
      // Get pending jobs that are ready
      const readyJobs = this.getJobs({ status: 'pending' })
        .filter(j => j.scheduledAt <= new Date())
        .slice(0, concurrency - this.processing.size);

      // Also check delayed jobs
      const delayedJobs = this.getJobs({ status: 'delayed' })
        .filter(j => j.scheduledAt <= new Date());
      
      for (const job of delayedJobs) {
        job.status = 'pending';
      }

      // Process ready jobs
      for (const job of readyJobs) {
        if (this.processing.size >= concurrency) break;
        this.processJob(job);
      }
    }, 100);

    console.log(`▶️ Started queue: ${this.config.name} (concurrency: ${concurrency})`);
  }

  /**
   * Stop processing jobs
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
      console.log(`⏹️ Stopped queue: ${this.config.name}`);
    }
  }

  /**
   * Process a single job
   */
  private async processJob(job: Job<T>): Promise<void> {
    const handler = this.handlers.get(job.name);
    if (!handler) {
      console.error(`❌ No handler for job: ${job.name}`);
      job.status = 'failed';
      job.lastError = `No handler registered for job: ${job.name}`;
      return;
    }

    this.processing.add(job.id);
    job.status = 'processing';
    job.startedAt = new Date();
    job.attempts++;

    console.log(`🔄 Processing job: ${job.id} (attempt ${job.attempts}/${job.maxAttempts})`);

    try {
      const result = await handler(job);
      job.status = 'completed';
      job.completedAt = new Date();
      job.result = result;
      console.log(`✅ Job completed: ${job.id}`);
    } catch (error) {
      job.lastError = error instanceof Error ? error.message : String(error);
      
      if (job.attempts < job.maxAttempts) {
        // Retry with exponential backoff
        const retryDelay = (this.config.retryDelayMs ?? 1000) * Math.pow(2, job.attempts - 1);
        job.status = 'delayed';
        job.scheduledAt = new Date(Date.now() + retryDelay);
        console.log(`🔄 Job will retry in ${retryDelay}ms: ${job.id}`);
      } else {
        job.status = 'failed';
        job.completedAt = new Date();
        console.error(`❌ Job failed after ${job.attempts} attempts: ${job.id}`);
      }
    } finally {
      this.processing.delete(job.id);
    }
  }

  /**
   * Get queue statistics
   */
  getStats(): {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    delayed: number;
  } {
    const jobs = Array.from(this.jobs.values());
    return {
      total: jobs.length,
      pending: jobs.filter(j => j.status === 'pending').length,
      processing: jobs.filter(j => j.status === 'processing').length,
      completed: jobs.filter(j => j.status === 'completed').length,
      failed: jobs.filter(j => j.status === 'failed').length,
      delayed: jobs.filter(j => j.status === 'delayed').length,
    };
  }

  /**
   * Clean completed/failed jobs older than specified age
   */
  clean(maxAge: number = 3600000): number {
    const cutoff = Date.now() - maxAge;
    let cleaned = 0;

    for (const [id, job] of this.jobs.entries()) {
      if ((job.status === 'completed' || job.status === 'failed') &&
          job.completedAt && job.completedAt.getTime() < cutoff) {
        this.jobs.delete(id);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Cleaned ${cleaned} old jobs from ${this.config.name}`);
    }

    return cleaned;
  }
}

// ============================================================================
// QUEUE MANAGER
// ============================================================================

class QueueManager {
  private queues: Map<string, JobQueue> = new Map();

  /**
   * Create or get a queue
   */
  createQueue<T>(config: QueueConfig): JobQueue<T> {
    if (!this.queues.has(config.name)) {
      this.queues.set(config.name, new JobQueue(config));
    }
    return this.queues.get(config.name) as JobQueue<T>;
  }

  /**
   * Get existing queue
   */
  getQueue<T>(name: string): JobQueue<T> | undefined {
    return this.queues.get(name) as JobQueue<T> | undefined;
  }

  /**
   * Start all queues
   */
  startAll(): void {
    for (const queue of this.queues.values()) {
      queue.start();
    }
  }

  /**
   * Stop all queues
   */
  stopAll(): void {
    for (const queue of this.queues.values()) {
      queue.stop();
    }
  }

  /**
   * Get stats for all queues
   */
  getStats(): Record<string, ReturnType<JobQueue['getStats']>> {
    const stats: Record<string, ReturnType<JobQueue['getStats']>> = {};
    for (const [name, queue] of this.queues.entries()) {
      stats[name] = queue.getStats();
    }
    return stats;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const queueManager = new QueueManager();

// ============================================================================
// PRE-CONFIGURED QUEUES FOR VICO
// ============================================================================

export interface NewsIngestJobData {
  companyId: string;
  companyName: string;
  provider: string;
}

export interface EmbeddingJobData {
  newsId: string;
  text: string;
}

export interface AnalyticsJobData {
  companyId: string;
  type: 'daily' | 'weekly' | 'full';
}

// News ingestion queue
export const newsIngestQueue = queueManager.createQueue<NewsIngestJobData>({
  name: 'news-ingest',
  concurrency: 4,
  defaultMaxAttempts: 3,
  retryDelayMs: 2000,
});

// Embedding generation queue
export const embeddingQueue = queueManager.createQueue<EmbeddingJobData>({
  name: 'embedding',
  concurrency: 2,
  defaultMaxAttempts: 2,
  retryDelayMs: 1000,
});

// Analytics refresh queue
export const analyticsQueue = queueManager.createQueue<AnalyticsJobData>({
  name: 'analytics',
  concurrency: 2,
  defaultMaxAttempts: 2,
  retryDelayMs: 5000,
});

// ============================================================================
// SCHEDULED JOBS (Cron-like)
// ============================================================================

export function scheduleRecurringJob<T>(
  queue: JobQueue<T>,
  jobName: string,
  data: T,
  intervalMs: number
): void {
  const schedule = async () => {
    await queue.add(jobName, data);
    setTimeout(schedule, intervalMs);
  };

  // Start first run after a short delay
  setTimeout(schedule, 1000);
  console.log(`⏰ Scheduled recurring job: ${jobName} every ${intervalMs}ms`);
}

// ============================================================================
// INITIALIZE DEFAULT HANDLERS
// ============================================================================

export function initializeDefaultHandlers(): void {
  // News ingest handler
  newsIngestQueue.process('ingest-company-news', async (job) => {
    const { companyId, companyName, provider } = job.data;
    console.log(`📰 Processing news ingest for: ${companyName} (${provider})`);
    
    // Import dynamically to avoid circular deps
    const { runNewsIngest } = await import('./newsIngestService');
    return runNewsIngest(companyId, companyName, { provider });
  });

  // Analytics handler
  analyticsQueue.process('refresh-analytics', async (job) => {
    const { companyId, type } = job.data;
    console.log(`📊 Refreshing ${type} analytics for company: ${companyId}`);
    
    // Placeholder - implement actual analytics refresh
    return { companyId, type, refreshedAt: new Date() };
  });

  console.log('✅ Default job handlers initialized');
}

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

/*
// In your main application startup:

import { queueManager, newsIngestQueue, initializeDefaultHandlers } from './services/jobQueue';

// Initialize handlers
initializeDefaultHandlers();

// Start all queues
queueManager.startAll();

// Add jobs
await newsIngestQueue.add('ingest-company-news', {
  companyId: 'company_123',
  companyName: 'Vingroup',
  provider: 'google_news',
});

// Add bulk jobs
const companies = [
  { companyId: 'c1', companyName: 'FPT', provider: 'google_news' },
  { companyId: 'c2', companyName: 'Viettel', provider: 'google_news' },
];
await newsIngestQueue.addBulk('ingest-company-news', companies);

// Schedule recurring jobs
scheduleRecurringJob(
  analyticsQueue,
  'refresh-analytics',
  { companyId: 'all', type: 'daily' },
  24 * 60 * 60 * 1000 // Daily
);

// Get stats
console.log(queueManager.getStats());

// Cleanup old jobs periodically
setInterval(() => {
  newsIngestQueue.clean(3600000); // Clean jobs older than 1 hour
}, 600000); // Every 10 minutes
*/
