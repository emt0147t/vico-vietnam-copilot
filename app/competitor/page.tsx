'use client';

import CompetitorAnalysisDashboard from '@/components/CompetitorAnalysisDashboard';

/**
 * Competitor Analysis Page
 * 
 * URL: /competitor
 * 
 * Main entry point for competitor intelligence system
 * Displays 4-pillar analysis when user selects company & competitor
 * 
 * 4 Pillars:
 * 1. Legal & Scale (Pháp lý & Quy mô)
 * 2. Recruitment & HR (Tuyển dụng & Nhân sự)
 * 3. Digital Health (Sức khỏe kỹ thuật số)
 * 4. Media & Reputation (Truyền thông & Tin tức)
 * 
 * All data from real sources (0% AI-generated)
 */
export default function CompetitorPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <CompetitorAnalysisDashboard />
    </main>
  );
}
