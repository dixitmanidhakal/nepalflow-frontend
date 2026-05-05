import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import toast from 'react-hot-toast';
import { postsAPI } from '../../utils/api';
import { platformIcon, statusBadge } from '../../utils/helpers';

const STATUS_COLORS = {
  scheduled: '#f59e0b',
  published: '#10b981',
  failed:    '#ef4444',
  draft:     '#6b7280',
};

export default function ContentCalendar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCalendarPosts = async (info) => {
    setLoading(true);
    try {
      const date = info?.start || new Date();
      const res = await postsAPI.calendar({
        month: date.getMonth() + 1,
        year: date.getFullYear(),
      });

      const calEvents = res.data.posts.map(post => ({
        id: post.id,
        title: `${platformIcon(post.platform)} ${post.content?.substring(0, 30)}${post.content?.length > 30 ? '...' : ''}`,
        start: post.scheduled_at,
        backgroundColor: STATUS_COLORS[post.status] || '#6b7280',
        borderColor: STATUS_COLORS[post.status] || '#6b7280',
        textColor: '#ffffff',
        extendedProps: { post },
      }));

      setEvents(calEvents);
    } catch (err) {
      toast.error('Failed to load calendar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCalendarPosts(); }, []);

  const handleEventClick = (info) => {
    setSelectedPost(info.event.extendedProps.post);
  };

  const handleDateClick = (info) => {
    const dateStr = info.dateStr;
    navigate(`/compose?date=${dateStr}`);
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await postsAPI.delete(postId);
      toast.success('Post deleted');
      setEvents(prev => prev.filter(e => e.id !== postId));
      setSelectedPost(null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('calendar.title')}</h1>
        <button
          onClick={() => navigate('/compose')}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-700"
        >
          + {t('calendar.add_post')}
        </button>
      </div>

      {/* Legend */}
      <div className="flex gap-4 flex-wrap">
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
          <div key={status} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
            <span className="text-xs text-gray-500 capitalize">{t(`calendar.${status}`)}</span>
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          events={events}
          eventClick={handleEventClick}
          dateClick={handleDateClick}
          datesSet={fetchCalendarPosts}
          height="auto"
          eventDisplay="block"
          dayMaxEvents={3}
          moreLinkText={(n) => `+${n} more`}
          buttonText={{
            today: t('calendar.today'),
            month: t('calendar.month'),
            week:  t('calendar.week'),
            day:   t('calendar.day'),
          }}
          eventContent={(arg) => (
            <div className="px-1.5 py-0.5 text-xs truncate cursor-pointer">
              {arg.event.title}
            </div>
          )}
        />
      </div>

      {/* Post Detail Modal */}
      {selectedPost && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
          onClick={e => e.target === e.currentTarget && setSelectedPost(null)}
        >
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-fade-in">
            {/* Modal header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">{platformIcon(selectedPost.platform)}</span>
                <div>
                  <div className="font-semibold text-sm text-gray-900">{selectedPost.account_name}</div>
                  <div className="text-xs text-gray-400 capitalize">{selectedPost.platform}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {(() => {
                  const badge = statusBadge(selectedPost.status);
                  return <span className={`text-xs px-2 py-1 rounded-full font-medium ${badge.color}`}>{badge.label}</span>;
                })()}
                <button onClick={() => setSelectedPost(null)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
              </div>
            </div>

            {/* Content */}
            <p className="text-sm text-gray-800 whitespace-pre-wrap mb-4">{selectedPost.content}</p>

            {/* Media preview */}
            {selectedPost.media_urls?.length > 0 && (
              <img
                src={selectedPost.media_urls[0]}
                alt=""
                className="w-full rounded-xl object-cover max-h-48 mb-4"
                onError={e => { e.target.style.display = 'none'; }}
              />
            )}

            {/* Time */}
            <div className="text-xs text-gray-400 mb-4">
              📅 {new Date(selectedPost.scheduled_at).toLocaleString()}
            </div>

            {/* Hashtags */}
            {selectedPost.hashtags?.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {selectedPost.hashtags.map(tag => (
                  <span key={tag} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{tag}</span>
                ))}
              </div>
            )}

            {/* Actions */}
            {(selectedPost.status === 'scheduled' || selectedPost.status === 'draft') && (
              <div className="flex gap-3">
                <button
                  onClick={() => { setSelectedPost(null); navigate(`/compose?edit=${selectedPost.id}`); }}
                  className="flex-1 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  ✏️ {t('common.edit')}
                </button>
                <button
                  onClick={() => handleDelete(selectedPost.id)}
                  className="flex-1 py-2 bg-red-50 border border-red-200 rounded-xl text-sm font-medium text-red-600 hover:bg-red-100"
                >
                  🗑️ {t('common.delete')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
