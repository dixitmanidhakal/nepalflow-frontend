import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, Title, Tooltip, Legend, ArcElement, Filler,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { analyticsAPI } from '../../utils/api';
import { formatShort, platformIcon, truncate } from '../../utils/helpers';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, Title, Tooltip, Legend, ArcElement, Filler
);

const PERIODS = [
  { value: '7', label: '7D' },
  { value: '14', label: '14D' },
  { value: '30', label: '30D' },
];

interface InsightCardProps {
  icon: string;
  value?: number;
  label: string;
  gradient: string;
  sublabel?: string;
}

function InsightCard({ icon, value, label, gradient, sublabel }: InsightCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all duration-200">
      <div
        className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-10 blur-xl"
        style={{ background: gradient }}
      />
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-4"
        style={{ background: gradient }}
      >
        {icon}
      </div>
      <div className="text-3xl font-black text-gray-900 tracking-tight">
        {(value || 0).toLocaleString()}
      </div>
      <div className="text-sm font-medium text-gray-500 mt-1">{label}</div>
      {sublabel && <div className="text-xs text-gray-400 mt-0.5">{sublabel}</div>}
    </div>
  );
}

interface OverviewData {
  total_posts?: number;
  total_reach?: number;
  total_likes?: number;
  total_comments?: number;
  total_shares?: number;
}

interface DailyData {
  date: string;
  engagement?: number;
  likes?: number;
  comments?: number;
  shares?: number;
}

interface PlatformBreakdown {
  platform: string;
  post_count: number;
}

interface ChartDataType {
  daily: DailyData[];
  platformBreakdown?: PlatformBreakdown[];
}

interface TopPost {
  id: string | number;
  platform: string;
  content?: string;
  account_name?: string;
  likes?: number;
  comments?: number;
  shares?: number;
}

export default function AnalyticsDashboard() {
  const { t } = useTranslation();
  const [days, setDays] = useState('14');
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [chartData, setChartData] = useState<ChartDataType | null>(null);
  const [topPosts, setTopPosts] = useState<TopPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [ovRes, chartRes, postsRes] = await Promise.all([
        analyticsAPI.overview({ days }),
        analyticsAPI.chartData({ days }),
        analyticsAPI.posts({ limit: 5 }),
      ]);
      setOverview(ovRes.data.summary);
      setChartData(chartRes.data);
      setTopPosts(postsRes.data.posts);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [days]); // eslint-disable-line

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await analyticsAPI.sync();
      toast.success(res.data.message || 'Analytics synced!');
      await fetchAll();
    } catch {
      toast.error('Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  // Chart data
  const lineChartData = chartData ? {
    labels: chartData.daily.map(d => formatShort(d.date)),
    datasets: [{
      label: t('analytics.engagement', 'Engagement'),
      data: chartData.daily.map(d => d.engagement || 0),
      borderColor: '#f43f5e',
      backgroundColor: 'rgba(244,63,94,0.08)',
      tension: 0.4,
      fill: true,
      pointRadius: 4,
      pointBackgroundColor: '#f43f5e',
      pointHoverRadius: 6,
      borderWidth: 2,
    }],
  } : null;

  const barChartData = chartData ? {
    labels: chartData.daily.map(d => formatShort(d.date)),
    datasets: [
      {
        label: t('analytics.likes', 'Likes'),
        data: chartData.daily.map(d => d.likes || 0),
        backgroundColor: 'rgba(244, 63, 94, 0.85)',
        borderRadius: 8,
      },
      {
        label: t('analytics.comments', 'Comments'),
        data: chartData.daily.map(d => d.comments || 0),
        backgroundColor: 'rgba(99, 102, 241, 0.85)',
        borderRadius: 8,
      },
      {
        label: t('analytics.shares', 'Shares'),
        data: chartData.daily.map(d => d.shares || 0),
        backgroundColor: 'rgba(16, 185, 129, 0.85)',
        borderRadius: 8,
      },
    ],
  } : null;

  const doughnutData = chartData?.platformBreakdown?.length ? {
    labels: chartData.platformBreakdown.map(p => p.platform),
    datasets: [{
      data: chartData.platformBreakdown.map(p => p.post_count),
      backgroundColor: ['rgba(24, 119, 242, 0.85)', 'rgba(225, 48, 108, 0.85)', 'rgba(238, 29, 82, 0.85)'],
      borderWidth: 3,
      borderColor: '#ffffff',
      hoverOffset: 6,
    }],
  } : null;

  const baseOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const, labels: { font: { size: 12, weight: '600' as const }, usePointStyle: true, pointStyleWidth: 8 } },
      tooltip: {
        mode: 'index' as const, intersect: false,
        backgroundColor: 'rgba(15,12,41,0.9)',
        titleColor: '#fff',
        bodyColor: 'rgba(255,255,255,0.7)',
        cornerRadius: 12,
        padding: 12,
      },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { size: 11 } } },
      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isEmpty = !overview?.total_posts;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
            {t('analytics.title', 'Analytics')}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Track your social media performance</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Period selector */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {PERIODS.map(p => (
              <button
                key={p.value}
                onClick={() => setDays(p.value)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  days === p.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #f43f5e, #8b5cf6)' }}
          >
            <svg
              className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {syncing ? 'Syncing…' : 'Sync Data'}
          </button>
        </div>
      </div>

      {isEmpty ? (
        <div className="text-center py-24">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="font-bold text-gray-700 text-lg mb-2">No analytics data yet</h3>
          <p className="text-sm text-gray-400 mb-6 max-w-sm mx-auto">
            Connect your social accounts and publish some posts to start seeing analytics
          </p>
          <button
            onClick={handleSync}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #f43f5e, #8b5cf6)' }}
          >
            Sync Analytics
          </button>
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <InsightCard
              icon="👁️" label="Total Reach" value={overview?.total_reach}
              gradient="linear-gradient(135deg, #f43f5e, #ec4899)"
              sublabel="People reached"
            />
            <InsightCard
              icon="❤️" label="Total Likes" value={overview?.total_likes}
              gradient="linear-gradient(135deg, #ec4899, #8b5cf6)"
              sublabel="Across all posts"
            />
            <InsightCard
              icon="💬" label="Comments" value={overview?.total_comments}
              gradient="linear-gradient(135deg, #6366f1, #3b82f6)"
              sublabel="Conversations"
            />
            <InsightCard
              icon="🔁" label="Shares" value={overview?.total_shares}
              gradient="linear-gradient(135deg, #10b981, #06b6d4)"
              sublabel="Content shared"
            />
          </div>

          {/* Engagement line chart */}
          {lineChartData && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-gray-900">Engagement Over Time</h2>
                <span className="text-xs text-gray-400">Last {days} days</span>
              </div>
              <Line
                data={lineChartData}
                options={{
                  ...baseOptions,
                  plugins: {
                    ...baseOptions.plugins,
                    legend: { display: false },
                  },
                }}
              />
            </div>
          )}

          {/* Bar + Doughnut */}
          <div className="grid lg:grid-cols-3 gap-4">
            {barChartData && (
              <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold text-gray-900">Engagement Breakdown</h2>
                  <span className="text-xs text-gray-400">Daily</span>
                </div>
                <Bar data={barChartData} options={baseOptions} />
              </div>
            )}
            {doughnutData ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-bold text-gray-900 mb-5">Platform Mix</h2>
                <div className="flex items-center justify-center py-2">
                  <div style={{ width: '200px', height: '200px' }}>
                    <Doughnut
                      data={doughnutData}
                      options={{
                        responsive: true,
                        cutout: '60%',
                        plugins: {
                          legend: { position: 'bottom', labels: { font: { size: 11, weight: '600' as const }, usePointStyle: true } },
                        },
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 flex flex-col justify-center">
                <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-3">Pro Tip</p>
                <p className="text-white font-bold text-lg leading-tight mb-2">
                  Post consistently to grow your audience
                </p>
                <p className="text-white/50 text-sm">
                  Businesses that post 4-7 times/week see 50% more engagement
                </p>
              </div>
            )}
          </div>

          {/* Top Posts */}
          {topPosts.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                <h2 className="font-bold text-gray-900">Top Performing Posts</h2>
                <span className="text-xs text-gray-400">By engagement</span>
              </div>
              <div className="divide-y divide-gray-50">
                {topPosts.map((post, i) => {
                  const total = (post.likes || 0) + (post.comments || 0) + (post.shares || 0);
                  const medals = ['🥇', '🥈', '🥉'];
                  return (
                    <div key={post.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors">
                      <span className="text-lg flex-shrink-0">{medals[i] || `#${i+1}`}</span>
                      <div className="text-xl flex-shrink-0">{platformIcon(post.platform)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{truncate(post.content || '', 55)}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{post.account_name}</p>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 flex-shrink-0">
                        <span className="flex items-center gap-1">❤️ {(post.likes || 0).toLocaleString()}</span>
                        <span className="hidden sm:flex items-center gap-1">💬 {(post.comments || 0).toLocaleString()}</span>
                        <span className="hidden sm:flex items-center gap-1">🔁 {(post.shares || 0).toLocaleString()}</span>
                        <span className="font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full">
                          {total.toLocaleString()} total
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
