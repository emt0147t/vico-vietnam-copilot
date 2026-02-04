/**
 * 📊 Enterprise Data Table Component
 * Interactive data table with sorting, filtering, and pagination
 * 
 * Features:
 * - Column sorting (asc/desc)
 * - Search filtering
 * - Pagination with page size options
 * - Row selection (single/multi)
 * - Skeleton loading states
 * - Responsive design
 * - Custom cell renderers
 */

import React, { useState, useMemo, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
    ChevronsLeft, ChevronsRight, Search, Filter, MoreHorizontal,
    Check, X, Download, RefreshCw
} from 'lucide-react';
import { Skeleton } from './DashboardLayout';

// ============================================================================
// TYPES
// ============================================================================

export interface Column<T> {
    id: string;
    header: string | ReactNode;
    accessor: keyof T | ((row: T) => ReactNode);
    sortable?: boolean;
    width?: string;
    align?: 'left' | 'center' | 'right';
    cell?: (value: unknown, row: T) => ReactNode;
}

export interface DataTableProps<T extends { id: string | number }> {
    columns: Column<T>[];
    data: T[];
    isLoading?: boolean;
    error?: string;
    onRetry?: () => void;
    onRowClick?: (row: T) => void;
    selectable?: boolean;
    selectedIds?: (string | number)[];
    onSelectionChange?: (ids: (string | number)[]) => void;
    searchable?: boolean;
    searchPlaceholder?: string;
    pagination?: boolean;
    pageSize?: number;
    pageSizeOptions?: number[];
    emptyMessage?: string;
    stickyHeader?: boolean;
    striped?: boolean;
    hoverable?: boolean;
    compact?: boolean;
    onExport?: () => void;
    onRefresh?: () => void;
    actions?: ReactNode;
}

type SortDirection = 'asc' | 'desc' | null;

interface SortConfig {
    column: string;
    direction: SortDirection;
}

// ============================================================================
// TABLE SKELETON
// ============================================================================

const TableSkeleton = ({ 
    columns, 
    rows = 5,
    compact = false 
}: { 
    columns: number; 
    rows?: number;
    compact?: boolean;
}) => (
    <div className="space-y-2">
        {/* Header */}
        <div className={`flex gap-4 ${compact ? 'py-2' : 'py-3'} px-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg`}>
            {Array.from({ length: columns }).map((_, i) => (
                <span key={i}>
                    <Skeleton className="h-4 flex-1" />
                </span>
            ))}
        </div>
        {/* Rows */}
        {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className={`flex gap-4 ${compact ? 'py-2' : 'py-3'} px-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800`}>
                {Array.from({ length: columns }).map((_, j) => (
                    <span key={j}>
                        <Skeleton className="h-4 flex-1" />
                    </span>
                ))}
            </div>
        ))}
    </div>
);

// ============================================================================
// MAIN DATA TABLE COMPONENT
// ============================================================================

export function DataTable<T extends { id: string | number }>({
    columns,
    data,
    isLoading = false,
    error,
    onRetry,
    onRowClick,
    selectable = false,
    selectedIds = [],
    onSelectionChange,
    searchable = true,
    searchPlaceholder = 'Search...',
    pagination = true,
    pageSize: initialPageSize = 10,
    pageSizeOptions = [10, 20, 50, 100],
    emptyMessage = 'No data available',
    stickyHeader = false,
    striped = false,
    hoverable = true,
    compact = false,
    onExport,
    onRefresh,
    actions
}: DataTableProps<T>) {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfig>({ column: '', direction: null });
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(initialPageSize);

    // Get cell value
    const getCellValue = useCallback((row: T, column: Column<T>): unknown => {
        if (typeof column.accessor === 'function') {
            return column.accessor(row);
        }
        return row[column.accessor];
    }, []);

    // Filter data
    const filteredData = useMemo(() => {
        if (!searchQuery) return data;
        
        const query = searchQuery.toLowerCase();
        return data.filter(row => {
            return columns.some(column => {
                const value = getCellValue(row, column);
                return String(value).toLowerCase().includes(query);
            });
        });
    }, [data, searchQuery, columns, getCellValue]);

    // Sort data
    const sortedData = useMemo(() => {
        if (!sortConfig.column || !sortConfig.direction) return filteredData;

        const column = columns.find(c => c.id === sortConfig.column);
        if (!column) return filteredData;

        return [...filteredData].sort((a, b) => {
            const aVal = getCellValue(a, column);
            const bVal = getCellValue(b, column);

            if (aVal === bVal) return 0;
            if (aVal === null || aVal === undefined) return 1;
            if (bVal === null || bVal === undefined) return -1;

            const comparison = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
            return sortConfig.direction === 'asc' ? comparison : -comparison;
        });
    }, [filteredData, sortConfig, columns, getCellValue]);

    // Paginate data
    const paginatedData = useMemo(() => {
        if (!pagination) return sortedData;
        const start = (currentPage - 1) * pageSize;
        return sortedData.slice(start, start + pageSize);
    }, [sortedData, pagination, currentPage, pageSize]);

    const totalPages = Math.ceil(sortedData.length / pageSize);

    // Handlers
    const handleSort = (columnId: string) => {
        setSortConfig(prev => ({
            column: columnId,
            direction: prev.column === columnId
                ? prev.direction === 'asc' ? 'desc' : prev.direction === 'desc' ? null : 'asc'
                : 'asc'
        }));
    };

    const handleSelectAll = () => {
        if (selectedIds.length === paginatedData.length) {
            onSelectionChange?.([]);
        } else {
            onSelectionChange?.(paginatedData.map(row => row.id));
        }
    };

    const handleSelectRow = (id: string | number) => {
        if (selectedIds.includes(id)) {
            onSelectionChange?.(selectedIds.filter(i => i !== id));
        } else {
            onSelectionChange?.([...selectedIds, id]);
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    // Error state
    if (error) {
        return (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 p-8 text-center">
                <X className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-700 dark:text-red-400 font-medium mb-4">{error}</p>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Retry
                    </button>
                )}
            </div>
        );
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="space-y-4">
                {/* Toolbar skeleton */}
                <div className="flex items-center justify-between gap-4">
                    <Skeleton className="h-10 w-64 rounded-lg" />
                    <div className="flex gap-2">
                        <Skeleton className="h-10 w-24 rounded-lg" />
                        <Skeleton className="h-10 w-24 rounded-lg" />
                    </div>
                </div>
                <TableSkeleton columns={columns.length} rows={pageSize} compact={compact} />
            </div>
        );
    }

    // Empty state
    if (data.length === 0) {
        return (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
                <Filter className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">{emptyMessage}</p>
            </div>
        );
    }

    const cellPadding = compact ? 'py-2 px-3' : 'py-3 px-4';

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                {/* Search */}
                {searchable && (
                    <div className="relative w-full sm:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 transition-all"
                        />
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {actions}
                    {onRefresh && (
                        <button
                            onClick={onRefresh}
                            className="p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            title="Refresh"
                        >
                            <RefreshCw className="w-4 h-4 text-gray-500" />
                        </button>
                    )}
                    {onExport && (
                        <button
                            onClick={onExport}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    )}
                </div>
            </div>

            {/* Results count */}
            {searchQuery && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {sortedData.length} results for "{searchQuery}"
                </p>
            )}

            {/* Table */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        {/* Header */}
                        <thead className={`bg-gray-50 dark:bg-gray-800/50 ${stickyHeader ? 'sticky top-0 z-10' : ''}`}>
                            <tr>
                                {/* Checkbox column */}
                                {selectable && (
                                    <th className={`${cellPadding} w-12`}>
                                        <button
                                            onClick={handleSelectAll}
                                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                                selectedIds.length === paginatedData.length && paginatedData.length > 0
                                                    ? 'bg-red-600 border-red-600'
                                                    : 'border-gray-300 dark:border-gray-600 hover:border-red-400'
                                            }`}
                                        >
                                            {selectedIds.length === paginatedData.length && paginatedData.length > 0 && (
                                                <Check className="w-3 h-3 text-white" />
                                            )}
                                        </button>
                                    </th>
                                )}
                                
                                {columns.map((column) => (
                                    <th
                                        key={column.id}
                                        className={`${cellPadding} text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${
                                            column.sortable !== false ? 'cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-300' : ''
                                        }`}
                                        style={{ width: column.width }}
                                        onClick={() => column.sortable !== false && handleSort(column.id)}
                                    >
                                        <div className={`flex items-center gap-2 ${
                                            column.align === 'center' ? 'justify-center' :
                                            column.align === 'right' ? 'justify-end' : ''
                                        }`}>
                                            {column.header}
                                            {column.sortable !== false && sortConfig.column === column.id && (
                                                <span className="text-red-500">
                                                    {sortConfig.direction === 'asc' ? (
                                                        <ChevronUp className="w-4 h-4" />
                                                    ) : sortConfig.direction === 'desc' ? (
                                                        <ChevronDown className="w-4 h-4" />
                                                    ) : null}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        {/* Body */}
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {paginatedData.map((row, rowIndex) => (
                                <motion.tr
                                    key={row.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: rowIndex * 0.02 }}
                                    onClick={() => onRowClick?.(row)}
                                    className={`
                                        ${onRowClick ? 'cursor-pointer' : ''}
                                        ${hoverable ? 'hover:bg-gray-50 dark:hover:bg-gray-800/50' : ''}
                                        ${striped && rowIndex % 2 === 1 ? 'bg-gray-50/50 dark:bg-gray-800/20' : ''}
                                        ${selectedIds.includes(row.id) ? 'bg-red-50 dark:bg-red-900/10' : ''}
                                        transition-colors
                                    `}
                                >
                                    {/* Checkbox */}
                                    {selectable && (
                                        <td className={cellPadding} onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => handleSelectRow(row.id)}
                                                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                                    selectedIds.includes(row.id)
                                                        ? 'bg-red-600 border-red-600'
                                                        : 'border-gray-300 dark:border-gray-600 hover:border-red-400'
                                                }`}
                                            >
                                                {selectedIds.includes(row.id) && (
                                                    <Check className="w-3 h-3 text-white" />
                                                )}
                                            </button>
                                        </td>
                                    )}
                                    
                                    {columns.map((column) => {
                                        const value = getCellValue(row, column);
                                        return (
                                            <td
                                                key={column.id}
                                                className={`${cellPadding} text-sm text-gray-900 dark:text-white ${
                                                    column.align === 'center' ? 'text-center' :
                                                    column.align === 'right' ? 'text-right' : ''
                                                }`}
                                            >
                                                {column.cell ? column.cell(value, row) : String(value ?? '')}
                                            </td>
                                        );
                                    })}
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination && totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
                        {/* Page size */}
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>Show</span>
                            <select
                                value={pageSize}
                                onChange={(e) => {
                                    setPageSize(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                {pageSizeOptions.map(size => (
                                    <option key={size} value={size}>{size}</option>
                                ))}
                            </select>
                            <span>of {sortedData.length}</span>
                        </div>

                        {/* Page controls */}
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => handlePageChange(1)}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronsLeft className="w-4 h-4 text-gray-500" />
                            </button>
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4 text-gray-500" />
                            </button>

                            {/* Page numbers */}
                            <div className="flex items-center gap-1 mx-2">
                                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                                    let page: number;
                                    if (totalPages <= 5) {
                                        page = i + 1;
                                    } else if (currentPage <= 3) {
                                        page = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        page = totalPages - 4 + i;
                                    } else {
                                        page = currentPage - 2 + i;
                                    }

                                    return (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                                                currentPage === page
                                                    ? 'bg-red-600 text-white'
                                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-4 h-4 text-gray-500" />
                            </button>
                            <button
                                onClick={() => handlePageChange(totalPages)}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronsRight className="w-4 h-4 text-gray-500" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Selection summary */}
            <AnimatePresence>
                {selectable && selectedIds.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-4 z-50"
                    >
                        <span className="font-medium">{selectedIds.length} selected</span>
                        <button
                            onClick={() => onSelectionChange?.([])}
                            className="px-3 py-1.5 bg-white/10 dark:bg-gray-900/10 hover:bg-white/20 dark:hover:bg-gray-900/20 rounded-lg text-sm transition-colors"
                        >
                            Clear
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default DataTable;
