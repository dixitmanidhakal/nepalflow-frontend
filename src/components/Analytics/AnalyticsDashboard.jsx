import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { analyticsAPI } from '../../utils/api';
import { formatShort, platformIcon, truncate } from '../../utils/helpers';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, Title, Tooltip, Legend, ArcElement
);

const PERIODS = [
  { value: '7',  labelKey: 'last_7_days' },
  { value: '14', labelKey: 'last_14_days' },
  { value: '30', labelKey: 'last_30_days' },
];

function StatCard({ icon, value, label, trend }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        {trend !== undefined && (
          <span className={`text-xs font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900">{(value || 0).toLocaleString()}</div>
      <div className="text-sm text-gray-500 mt-1">{label}</div>
    </div>
  );
}

export default function AnalyticsDashboard() {
  const { t } = useTranslation();
  const [days, setDays] = useState('14');
  const [overview, setOverview] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [topPosts, setTopPosts] = useState([]);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [days]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await analyticsAPI.sync();
      toast.success(res.data.message);
      await fetchAll();
    } catch {
      toast.error('Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  // Chart configurations
  const barChartData = chartData ? {
    labels: chartData.daily.map(d => formatShort(d.date)),
    datasets: [
      {
        label: t('analytics.likes'),
        data: chartData.daily.map(d => d.likes || 0),
        backgroundColor: 'rgba(244, 63, 94, 0.8)',
        borderRadius: 6,
      },
      {
        label: t('analytics.comments'),
        data: chartData.daily.map(d => d.comments || 0),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderRadius: 6,
      },
      {
        label: t('analytics.shares'),
        data: chartData.daily.map(d => d.shares || 0),
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
        borderRadius: 6,
      },
    ],
  } : null;

  const lineChartData = chartData ? {
    labels: chartData.daily.map(d => formatShort(d.date)),
    datasets: [
      {
        label: t('analytics.engagement'),
        data: chartData.daily.map(d => d.engagement || 0),
        borderColor: 'rgb(244, 63, 94)',
        backgroundColor: 'rgba(244, 63, 94, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  } : null;

  const doughnutData = chartData?.platformBreakdown?.length > 0 ? {
    labels: chartData.platformBreakdown.map(p => p.platform),
    datasets: [{
      data: chartData.platformBreakdown.map(p => p.post_count),
      backgroundColor: ['rgba(24, 119, 242, 0.8)', 'rgba(168, 85, 247, 0.8)', 'rgba(244, 63, 94, 0.8)'],
      borderWidth: 0,
    }],
  } : null;

  const chartOptions = {
    responsive: true,
    plugins: { legend: { position: 'top' }, tooltip: { mode: 'index', intersect: false } },
    scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' } }, x: { grid: { display: false } } },
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full"></div>
    </div>
  );

  const isEmpty = !overview?.total_posts;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900">{t('analytics.title')}</h1>
        <div className="flex items-center gap-3">
          {/* Period selector */}
          <div className="flex rounded-xl border border-gray-200 overflow-hidden">
            {PERIODS.map(p => (
              <button
                key={p.value}
                onClick={() => setDays(p.value)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  days === p.value
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {t(`analytics.${p.labelKey}`)}
              </button>
            ))}
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
          >
            <span className={syncing ? 'animate-spin' : ''}>🔄</span>
            {t('analytics.sync_analytics')}
          </button>
        </div>
      </div>

      {isEmpty ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">📊</div>
          <p className="font-medium">{t('analytics.no_data')}</p>
        </div>
      ) : (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon="📝" label={t('analytics.reach')}       value={overview?.total_reach} />
            <StatCard icon="❤️" label={t('analytics.likes')}       value={overview?.total_likes} />
            <StatCard icon="💬" label={t('analytics.comments')}    value={overview?.total_comments} />
            <StatCard icon="🔁" label={t('analytics.shares')}      value={overview?.total_shares} />
          </div>

          {/* Engagement Line Chart */}
          {lineChartData && (
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-gray-800 mb-4">{t('analytics.daily_engagement')}</h2>
              <Line data={lineChartData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, legend: { display: false } } }} />
            </div>
          )}

          {/* Bar + Doughnut */}
          <div className="grid md:grid-cols-3 gap-4">
            {barChartData && (
              <div className="md:col-span-2 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <h2 className="font-semibold text-gray-800 mb-4">{t('analytics.engagement')}</h2>
                <Bar data={barChartData} options={chartOptions} />
              </div>
            )}
            {doughnutData && (
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <h2 className="font-semibold text-gray-800 mb-4">{t('analytics.platform_breakdown')}</h2>
                <div className="flex items-center justify-center">
                  <div className="w-48 h-48">
                    <Doughnut data={doughnutData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Top Posts */}
          {topPosts.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-5 border-b border-gray-50">
                <h2 className="font-semibold text-gray-800">{t('analytics.top_posts')}</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {topPosts.map((post, i) => (
                  <div key={post.id} className="flex items-center gap-4 p-4">
                    <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </div>
                    <span className="text-lg">{platformIcon(post.platform)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 truncate">{truncate(post.content, 50)}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{post.account_name}</p>
                    </div>
                    <div className="flex gap-4 text-xs text-gray-500 flex-shrink-0">
                      <span>❤️ {post.likes.toLocaleString()}</span>
                      <span>💬 {post.comments.toLocaleString()}</span>
                      <span>🔁 {post.shares.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
