/**
 * 🎨 VICO Enterprise UI Components
 * 
 * Premium B2B SaaS components matching GlobalCopilot standards
 * Includes: DashboardLayout, CompanyCard, NewsCard, DataTable
 * 
 * @example
 * import { DashboardLayout, CompanyCard, DataTable } from './components/ui';
 */

// Layout Components
export { 
    DashboardLayout, 
    useDashboard,
    CommandCenter,
    Skeleton,
    CardSkeleton,
    TableSkeleton 
} from '../DashboardLayout';

// Company Components
export {
    CompanyCard,
    CompanyCardSkeleton,
    CompanyGrid,
    ErrorState,
    type CompanyCardData
} from '../CompanyCard';

// News Components
export {
    NewsCard,
    NewsCardSkeleton,
    NewsFeed,
    type NewsCardData
} from '../NewsCard';

// Data Table Components
export {
    DataTable,
    type Column,
    type DataTableProps
} from '../DataTable';

// Hooks
export {
    useQuery,
    useMutation,
    useCompanies,
    useCompany,
    useNews,
    useVectorSearch,
    apiFetch,
    queryUtils
} from '../../hooks/useQueryHooks';
