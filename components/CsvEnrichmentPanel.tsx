import React, { useState, useEffect } from 'react';

interface EnrichmentStatus {
    status: string;
    totalEnriched: number;
    message: string;
}

/**
 * CSV Company Enrichment Panel
 * Allows users to:
 * 1. Trigger enrichment of 10,000+ companies with Vietnamese embeddings
 * 2. Search enriched companies semantically
 * 3. View similar competitors for each company
 */
export const CsvEnrichmentPanel: React.FC = () => {
    const [enrichmentStatus, setEnrichmentStatus] = useState<EnrichmentStatus | null>(null);
    const [isEnriching, setIsEnriching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [expandedCompany, setExpandedCompany] = useState<string | null>(null);

    // Check enrichment status on mount
    useEffect(() => {
        checkEnrichmentStatus();
    }, []);

    const checkEnrichmentStatus = async () => {
        try {
            const response = await fetch('/api/enrich/status');
            const data = await response.json();
            setEnrichmentStatus(data);
        } catch (error) {
            console.error('Failed to check enrichment status:', error);
        }
    };

    const handleStartEnrichment = async () => {
        try {
            setIsEnriching(true);
            const response = await fetch('/api/enrich', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await response.json();

            alert('✅ CSV Enrichment started!\n\nThis will:\n1. Generate Vietnamese embeddings for 10,000+ companies\n2. Calculate similar competitors for each company\n3. Cache results for fast retrieval\n\nEstimated time: 15-30 minutes\n\nCheck backend logs for progress.');

            // Poll status every 30 seconds
            const statusInterval = setInterval(async () => {
                await checkEnrichmentStatus();
            }, 30000);

            setIsEnriching(false);
            return () => clearInterval(statusInterval);
        } catch (error) {
            console.error('Failed to start enrichment:', error);
            alert('❌ Failed to start enrichment');
            setIsEnriching(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            alert('Please enter a search keyword');
            return;
        }

        try {
            setIsSearching(true);
            const response = await fetch(`/api/enrich/search?q=${encodeURIComponent(searchQuery)}&limit=20`);
            const data = await response.json();
            setSearchResults(data.results || []);
        } catch (error) {
            console.error('Search failed:', error);
            alert('❌ Search failed');
        } finally {
            setIsSearching(false);
        }
    };

    const handleViewCompanyDetails = async (companyName: string) => {
        try {
            const response = await fetch(`/api/enrich/company/${encodeURIComponent(companyName)}`);
            const data = await response.json();

            // Store in expandedCompany for display
            setExpandedCompany(companyName);
        } catch (error) {
            console.error('Failed to fetch company details:', error);
        }
    };

    return (
        <div style={{
            padding: '20px',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            marginBottom: '20px'
        }}>
            <h2>🚀 CSV Companies Enrichment (10,000+ companies)</h2>

            {/* Status Section */}
            <div style={{
                padding: '15px',
                backgroundColor: enrichmentStatus?.totalEnriched ? '#E8F5E9' : '#FFF3E0',
                borderRadius: '5px',
                marginBottom: '20px',
                border: '1px solid #ccc'
            }}>
                <p><strong>Status:</strong> {enrichmentStatus?.status}</p>
                <p><strong>Companies Enriched:</strong> {enrichmentStatus?.totalEnriched || 0}</p>
                <p><strong>Message:</strong> {enrichmentStatus?.message}</p>
            </div>

            {/* Enrichment Button */}
            {(!enrichmentStatus || enrichmentStatus.totalEnriched === 0) && (
                <button
                    onClick={handleStartEnrichment}
                    disabled={isEnriching}
                    style={{
                        padding: '12px 20px',
                        backgroundColor: isEnriching ? '#ccc' : '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: isEnriching ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        marginBottom: '20px'
                    }}
                >
                    {isEnriching ? '⏳ Processing...' : '🔄 Start Enrichment'}
                </button>
            )}

            {enrichmentStatus && enrichmentStatus.totalEnriched > 0 && (
                <>
                    {/* Search Section */}
                    <div style={{
                        padding: '15px',
                        backgroundColor: 'white',
                        borderRadius: '5px',
                        border: '1px solid #ddd',
                        marginBottom: '20px'
                    }}>
                        <h3>🔍 Semantic Search (Enriched Companies)</h3>
                        <p style={{ fontSize: '12px', color: '#666' }}>
                            Enter company description to find similar companies using Vietnamese embeddings
                        </p>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="E.g.: SaaS software company, e-commerce company..."
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    borderRadius: '5px',
                                    border: '1px solid #ddd'
                                }}
                            />
                            <button
                                onClick={handleSearch}
                                disabled={isSearching}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: isSearching ? '#ccc' : '#4CAF50',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: isSearching ? 'not-allowed' : 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                {isSearching ? 'Searching...' : 'Search'}
                            </button>
                        </div>

                        {/* Search Results */}
                        {searchResults.length > 0 && (
                            <div style={{
                                marginTop: '15px',
                                padding: '10px',
                                backgroundColor: '#f9f9f9',
                                borderRadius: '5px'
                            }}>
                                <h4>📊 Search results ({searchResults.length} companies)</h4>
                                {searchResults.map((result, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            padding: '10px',
                                            backgroundColor: 'white',
                                            borderRadius: '5px',
                                            marginBottom: '10px',
                                            border: '1px solid #eee',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => handleViewCompanyDetails(result.name)}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <strong>{result.name}</strong>
                                                <br />
                                                <span style={{ fontSize: '12px', color: '#666' }}>
                                                    {result.industry} • {result.competitorCount} competitors
                                                </span>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                                                    {result.similarity} similarity
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Info Section */}
                    <div style={{
                        padding: '15px',
                        backgroundColor: '#E3F2FD',
                        borderRadius: '5px',
                        border: '1px solid #90CAF9'
                    }}>
                        <h4>📌 What has been Enriched?</h4>
                        <ul style={{ fontSize: '14px' }}>
                            <li>✅ <strong>Vietnamese Embeddings:</strong> All 10,000+ companies vectorized using dangvantuan/vietnamese-embedding</li>
                            <li>✅ <strong>Strategic Context:</strong> Each company has auto-generated strategic context</li>
                            <li>✅ <strong>Similar Competitors:</strong> Top 10 similar competitors for each company based on semantic similarity</li>
                            <li>✅ <strong>Fast Search:</strong> Fast semantic search across 10,000+ companies</li>
                        </ul>
                    </div>
                </>
            )}
        </div>
    );
};

export default CsvEnrichmentPanel;
