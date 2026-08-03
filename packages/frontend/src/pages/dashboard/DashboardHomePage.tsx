import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  useGetDashboardStatsQuery,
  useGetContentTrendQuery,
  useGetRecentActivityQuery,
  useGetRecentContentQuery,
  useGetContentByStatusQuery,
} from '@/store/api';
import { Button } from '@/components/ui/Button';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  FileText,
  Users,
  Image,
  Tag,
  FolderTree,
  Plus,
  RefreshCw,
  Loader2,
  TrendingUp,
  Clock,
  Edit,
  Trash,
  Eye,
  Upload,
  LogIn,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const STATUS_COLORS: Record<string, string> = {
  draft: '#6B7280',
  pending_review: '#F59E0B',
  published: '#10B981',
  scheduled: '#3B82F6',
  archived: '#8B5CF6',
  trash: '#EF4444',
};

const ACTION_ICONS: Record<string, typeof Edit> = {
  create: Plus,
  update: Edit,
  delete: Trash,
  view: Eye,
  upload: Upload,
  login: LogIn,
  publish: TrendingUp,
};

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
}: {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: typeof FileText;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
    orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
    red: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={cn('p-3 rounded-lg', colorClasses[color])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function DashboardHomePage() {
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useGetDashboardStatsQuery();
  const { data: trend, isLoading: trendLoading } = useGetContentTrendQuery({ days: 30 });
  const { data: activity, isLoading: activityLoading } = useGetRecentActivityQuery({ limit: 10 });
  const { data: recentContent, isLoading: contentLoading } = useGetRecentContentQuery({ limit: 5 });
  const { data: contentByStatus } = useGetContentByStatusQuery();

  const pieData = useMemo(() => {
    if (!contentByStatus) return [];
    return contentByStatus.map((item) => ({
      name: item.status.replace('_', ' '),
      value: item.count,
      color: STATUS_COLORS[item.status] || '#6B7280',
    }));
  }, [contentByStatus]);

  const isLoading = statsLoading || trendLoading || activityLoading || contentLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back! Here is an overview of your content.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => refetchStats()} disabled={isLoading}>
            <RefreshCw className={cn('h-4 w-4 mr-2', isLoading && 'animate-spin')} />
            Refresh
          </Button>
          <Link to="/content/new">
            <Button><Plus className="h-4 w-4 mr-2" />New Content</Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      {statsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2" />
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16" />
            </div>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Content" value={stats.content.total} subtitle={`${stats.content.published} published`} icon={FileText} color="blue" />
          <StatCard title="Users" value={stats.users.total} subtitle={`${stats.users.newThisMonth} new this month`} icon={Users} color="green" />
          <StatCard title="Media Files" value={stats.media.total} subtitle={formatBytes(stats.media.totalSize)} icon={Image} color="purple" />
          <StatCard title="Taxonomy" value={stats.taxonomy.categories + stats.taxonomy.tags} subtitle={`${stats.taxonomy.categories} categories, ${stats.taxonomy.tags} tags`} icon={Tag} color="orange" />
        </div>
      ) : null}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content Trend Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Content Created (Last 30 Days)</h2>
          {trendLoading ? (
            <div className="h-64 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>
          ) : trend && trend.length > 0 ? (
            <ResponsiveContainer width="100%" height={256}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }} labelFormatter={(v) => new Date(String(v)).toLocaleDateString()} />
                <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">No data available</div>
          )}
        </div>

        {/* Content by Status Pie Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Content by Status</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={256}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                  {pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">No content yet</div>
          )}
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center gap-1 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-gray-600 dark:text-gray-400 capitalize">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Content</h2>
            <Link to="/content" className="text-sm text-blue-600 hover:text-blue-700">View all</Link>
          </div>
          {contentLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex items-center gap-3">
                  <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentContent && recentContent.length > 0 ? (
            <div className="space-y-3">
              {recentContent.map((item) => (
                <Link key={item._id} to={`/content/${item._id}`} className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="h-10 w-10 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center"><FileText className="h-5 w-5 text-gray-500" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">{item.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.contentType} &bull; {formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true })}</p>
                  </div>
                  <span className={cn('px-2 py-1 text-xs font-medium rounded', item.status === 'published' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : item.status === 'draft' ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400')}>{item.status}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No content yet. <Link to="/content/new" className="text-blue-600">Create your first article</Link></p>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
          </div>
          {activityLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex items-center gap-3">
                  <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : activity && activity.length > 0 ? (
            <div className="space-y-3">
              {activity.map((item) => {
                const ActionIcon = ACTION_ICONS[item.action] || Clock;
                return (
                  <div key={item.id} className="flex items-start gap-3 p-2 -mx-2">
                    <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0"><ActionIcon className="h-4 w-4 text-gray-500" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white">
                        <span className="font-medium">{item.userName}</span>
                        <span className="text-gray-500 dark:text-gray-400"> {item.action}d {item.resource}{item.resourceTitle && <span className="font-medium text-gray-700 dark:text-gray-300"> &quot;{item.resourceTitle}&quot;</span>}</span>
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8"><Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" /><p className="text-gray-500 dark:text-gray-400">No recent activity</p></div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link to="/content/new" className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
            <FileText className="h-6 w-6 text-blue-600" /><span className="text-sm font-medium text-gray-700 dark:text-gray-300">New Article</span>
          </Link>
          <Link to="/media" className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
            <Upload className="h-6 w-6 text-purple-600" /><span className="text-sm font-medium text-gray-700 dark:text-gray-300">Upload Media</span>
          </Link>
          <Link to="/categories" className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
            <FolderTree className="h-6 w-6 text-green-600" /><span className="text-sm font-medium text-gray-700 dark:text-gray-300">Categories</span>
          </Link>
          <Link to="/tags" className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors">
            <Tag className="h-6 w-6 text-orange-600" /><span className="text-sm font-medium text-gray-700 dark:text-gray-300">Manage Tags</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default DashboardHomePage;
