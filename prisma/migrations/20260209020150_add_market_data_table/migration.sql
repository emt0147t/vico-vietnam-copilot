-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "legalName" TEXT,
    "ticker" TEXT,
    "domain" TEXT,
    "industry" TEXT,
    "description" TEXT,
    "hqCountry" VARCHAR(64),
    "hqCity" VARCHAR(64),
    "employeeCount" INTEGER,
    "fundingStage" TEXT,
    "foundedYear" INTEGER,
    "logoUrl" TEXT,
    "website" TEXT,
    "latestNewsSentiment" DOUBLE PRECISION,
    "latestNewsAt" TIMESTAMP(3),
    "headlineSnapshot" VARCHAR(280),
    "newsCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyAlias" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompanyAlias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "News" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "source" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "content" TEXT,
    "summary" TEXT,
    "sentiment" DOUBLE PRECISION,
    "category" TEXT,
    "isBreaking" BOOLEAN NOT NULL DEFAULT false,
    "type" TEXT NOT NULL DEFAULT 'live',
    "language" VARCHAR(8),
    "imageUrl" TEXT,
    "author" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "News_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VectorEmbedding" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "newsId" TEXT,
    "source" TEXT NOT NULL,
    "text" TEXT,
    "dimension" INTEGER NOT NULL DEFAULT 1536,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VectorEmbedding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyAnalytics" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "dailySentiment" JSONB,
    "weeklySentiment" JSONB,
    "articleCounts" JSONB,
    "sourceBreakdown" JSONB,
    "competitorScores" JSONB,
    "marketShare" DOUBLE PRECISION,
    "growthRate" DOUBLE PRECISION,
    "visibility" DOUBLE PRECISION,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IngestRun" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "companyId" TEXT,
    "companyName" TEXT,
    "itemsFound" INTEGER NOT NULL DEFAULT 0,
    "itemsInserted" INTEGER NOT NULL DEFAULT 0,
    "itemsSkipped" INTEGER NOT NULL DEFAULT 0,
    "itemsFailed" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "errorStack" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "durationMs" INTEGER,

    CONSTRAINT "IngestRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnrichmentQueue" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "lastError" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "EnrichmentQueue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketData" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "unit" TEXT,
    "source" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_ticker_key" ON "Company"("ticker");

-- CreateIndex
CREATE UNIQUE INDEX "Company_domain_key" ON "Company"("domain");

-- CreateIndex
CREATE INDEX "idx_company_name" ON "Company"("name");

-- CreateIndex
CREATE INDEX "idx_company_industry" ON "Company"("industry");

-- CreateIndex
CREATE INDEX "idx_company_city" ON "Company"("hqCity");

-- CreateIndex
CREATE INDEX "idx_company_sentiment" ON "Company"("latestNewsSentiment");

-- CreateIndex
CREATE INDEX "idx_company_news_count" ON "Company"("newsCount");

-- CreateIndex
CREATE INDEX "idx_company_updated" ON "Company"("updatedAt");

-- CreateIndex
CREATE INDEX "idx_alias_name" ON "CompanyAlias"("alias");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyAlias_companyId_alias_key" ON "CompanyAlias"("companyId", "alias");

-- CreateIndex
CREATE UNIQUE INDEX "News_url_key" ON "News"("url");

-- CreateIndex
CREATE INDEX "idx_news_company_date" ON "News"("companyId", "publishedAt");

-- CreateIndex
CREATE INDEX "idx_news_company_sentiment" ON "News"("companyId", "sentiment");

-- CreateIndex
CREATE INDEX "idx_news_company_category" ON "News"("companyId", "category");

-- CreateIndex
CREATE INDEX "idx_news_date" ON "News"("publishedAt");

-- CreateIndex
CREATE INDEX "idx_news_category" ON "News"("category");

-- CreateIndex
CREATE INDEX "idx_news_sentiment" ON "News"("sentiment");

-- CreateIndex
CREATE INDEX "idx_news_breaking" ON "News"("isBreaking", "publishedAt");

-- CreateIndex
CREATE INDEX "idx_vec_company" ON "VectorEmbedding"("companyId");

-- CreateIndex
CREATE INDEX "idx_vec_news" ON "VectorEmbedding"("newsId");

-- CreateIndex
CREATE INDEX "idx_vec_source" ON "VectorEmbedding"("source");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyAnalytics_companyId_key" ON "CompanyAnalytics"("companyId");

-- CreateIndex
CREATE INDEX "idx_analytics_calculated" ON "CompanyAnalytics"("calculatedAt");

-- CreateIndex
CREATE INDEX "idx_ingest_provider_status" ON "IngestRun"("provider", "status");

-- CreateIndex
CREATE INDEX "idx_ingest_company" ON "IngestRun"("companyId");

-- CreateIndex
CREATE INDEX "idx_ingest_started" ON "IngestRun"("startedAt");

-- CreateIndex
CREATE INDEX "idx_queue_processing" ON "EnrichmentQueue"("status", "priority", "scheduledAt");

-- CreateIndex
CREATE INDEX "idx_queue_company" ON "EnrichmentQueue"("companyId");

-- AddForeignKey
ALTER TABLE "CompanyAlias" ADD CONSTRAINT "CompanyAlias_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "News" ADD CONSTRAINT "News_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VectorEmbedding" ADD CONSTRAINT "VectorEmbedding_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VectorEmbedding" ADD CONSTRAINT "VectorEmbedding_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES "News"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyAnalytics" ADD CONSTRAINT "CompanyAnalytics_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
