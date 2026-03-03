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
        <div className={`flex gap-4 ${compact ? 'py-2' : 'py-3'} px-4 bg-[#FAFAFA] rounded-lg`}>
            {Array.from({ length: columns }).map((_, i) => (
                <span key={i}>
                    <Skeleton className="h-4 flex-1" />
                </span>
            ))}
        </div>
        {/* Rows */}
        {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className={`flex gap-4 ${compact ? 'py-2' : 'py-3'} px-4 bg-white rounded-lg border border-[#E4E4E7]`}>
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
            <div className="bg-red-50 rounded-xl border border-red-200 p-8 text-center">
                <X className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-700 font-medium mb-4">{error}</p>
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
            <div className="bg-[#FAFAFA] rounded-xl border border-[#E4E4E7] p-12 text-center">
                <Filter className="w-12 h-12 text-[#A1A1AA] mx-auto mb-4" />
                <p className="text-[#71717A] font-medium">{emptyMessage}</p>
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
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA]" />
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-white border border-[#E4E4E7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                        />
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {actions}
                    {onRefresh && (
                        <button
                            onClick={onRefresh}
                            className="p-2.5 bg-white border border-[#E4E4E7] rounded-xl hover:bg-[#FAFAFA] transition-colors"
                            title="Refresh"
                        >
                            <RefreshCw className="w-4 h-4 text-[#71717A]" />
                        </button>
                    )}
                    {onExport && (
                        <button
                            onClick={onExport}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E4E4E7] rounded-xl hover:bg-[#FAFAFA] transition-colors text-sm font-medium text-[#18181B]"
                        >
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    )}
                </div>
            </div>

            {/* Results count */}
            {searchQuery && (
                <p className="text-sm text-[#71717A]">
                    {sortedData.length} results for "{searchQuery}"
                </p>
            )}

            {/* Table */}
            <div className="bg-white rounded-xl border border-[#E4E4E7] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        {/* Header */}
                        <thead className={`bg-[#FAFAFA] ${stickyHeader ? 'sticky top-0 z-10' : ''}`}>
                            <tr>
                                {/* Checkbox column */}
                                {selectable && (
                                    <th className={`${cellPadding} w-12`}>
                                        <button
                                            onClick={handleSelectAll}
                                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                                selectedIds.length === paginatedData.length && paginatedData.length > 0
                                                    ? 'bg-red-600 border-red-600'
                                                    : 'border-[#E4E4E7] hover:border-red-400'
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
                                        className={`${cellPadding} text-left text-xs font-bold text-[#71717A] uppercase tracking-wider ${
                                            column.sortable !== false ? 'cursor-pointer select-none hover:text-[#18181B]' : ''
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
                        <tbody className="divide-y divide-[#E4E4E7]">
                            {paginatedData.map((row, rowIndex) => (
                                <motion.tr
                                    key={row.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: rowIndex * 0.02 }}
                                    onClick={() => onRowClick?.(row)}
                                    className={`
                                        ${onRowClick ? 'cursor-pointer' : ''}
                                        ${hoverable ? 'hover:bg-[#FAFAFA]' : ''}
                                        ${striped && rowIndex % 2 === 1 ? 'bg-[#FAFAFA]/50' : ''}
                                        ${selectedIds.includes(row.id) ? 'bg-red-50' : ''}
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
                                                        : 'border-[#E4E4E7] hover:border-red-400'
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
                                                className={`${cellPadding} text-sm text-[#18181B] ${
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
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-[#E4E4E7] bg-[#FAFAFA]">
                        {/* Page size */}
                        <div className="flex items-center gap-2 text-sm text-[#71717A]">
                            <span>Show</span>
                            <select
                                value={pageSize}
                                onChange={(e) => {
                                    setPageSize(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="px-2 py-1 bg-white border border-[#E4E4E7] rounded-lg text-[#18181B] focus:outline-none focus:ring-2 focus:ring-red-500"
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
                                className="p-2 rounded-lg hover:bg-[#E4E4E7] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronsLeft className="w-4 h-4 text-[#71717A]" />
                            </button>
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg hover:bg-[#E4E4E7] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4 text-[#71717A]" />
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
                                                    : 'text-[#71717A] hover:bg-[#E4E4E7]'
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
                                className="p-2 rounded-lg hover:bg-[#E4E4E7] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-4 h-4 text-[#71717A]" />
                            </button>
                            <button
                                onClick={() => handlePageChange(totalPages)}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg hover:bg-[#E4E4E7] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronsRight className="w-4 h-4 text-[#71717A]" />
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
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#FAFAFA] text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-4 z-50"
                    >
                        <span className="font-medium">{selectedIds.length} selected</span>
                        <button
                            onClick={() => onSelectionChange?.([])}
                            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
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
