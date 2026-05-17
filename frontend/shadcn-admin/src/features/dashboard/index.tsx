import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { Button } from '@/components/ui/button'
import { api, taskAPI } from '@/lib/api'
import { useAuthStore } from '@/stores/auth-store'
import { Link } from '@tanstack/react-router'
import {
  AlertTriangle,
  Bot,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Circle,
  ClipboardCheck,
  Clock,
  FileImage,
  FileText,
  FileType,
  FolderOpen,
  ListTodo,
  Plus,
  Sparkles,
  TriangleAlert,
} from 'lucide-react'
import { useEffect, useState } from 'react'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface Task {
  id: number
  title: string
  start_time: string
  end_time: string
  priority: string
  category: string
  completed: boolean
  all_day: boolean
}

interface Document {
  id: number
  title: string
  original_filename: string
  file_type: string
  extracted_data?: {
    deadline?: string
    document_type?: string
    amount?: string
  }
  created_at: string
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function isToday(dateStr: string) {
  const date = new Date(dateStr)
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

function isUpcoming(dateStr: string | undefined, days = 7) {
  if (!dateStr) return false
  try {
    const parts = dateStr.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/)
    if (!parts) return false
    const date = new Date(
      `${parts[3]}-${parts[2].padStart(2, '0')}-${parts[1].padStart(2, '0')}`
    )
    const today = new Date()
    const diff = (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    return diff >= 0 && diff <= days
  } catch {
    return false
  }
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getPriorityColor(priority: string) {
  if (priority === 'important') return '#FF6B6B'
  if (priority === 'normal') return '#A855F7'
  return '#6b7280'
}

function FileIcon({ type }: { type: string }) {
  if (type === 'image') return <FileImage style={{ width: 16, height: 16 }} />
  if (type === 'docx') return <FileType style={{ width: 16, height: 16 }} />
  return <FileText style={{ width: 16, height: 16 }} />
}

// ─────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────
export function Dashboard() {
  const user = useAuthStore((state) => state.user)
  const [tasks, setTasks] = useState<Task[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

  const today = new Date()
  const dateLabel = today.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const [tasksRes, docsRes] = await Promise.all([
          taskAPI.getAll(),
          api.get('/documents/'),
        ])
        setTasks(tasksRes.data)
        setDocuments(docsRes.data)
      } catch (err) {
        console.error('Dashboard fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const todayTasks = tasks.filter((t) => isToday(t.start_time))
  const completedToday = todayTasks.filter((t) => t.completed).length
  const pendingToday = todayTasks.filter((t) => !t.completed).length
  const upcomingDeadlines = documents.filter((d) =>
    isUpcoming(d.extracted_data?.deadline)
  )

  async function toggleTask(id: number) {
    const res = await api.patch(`/tasks/${id}/complete`)
    setTasks((prev) => prev.map((t) => (t.id === id ? res.data : t)))
  }

  const statCards = [
    {
      label: 'Tasks today',
      value: pendingToday,
      icon: <ListTodo style={{ width: 18, height: 18 }} />,
      bg: '#fff8f0',
      color: '#e65100',
    },
    {
      label: 'Completed',
      value: completedToday,
      icon: <ClipboardCheck style={{ width: 18, height: 18 }} />,
      bg: '#f0fdf4',
      color: '#166534',
    },
    {
      label: 'Documents',
      value: documents.length,
      icon: <FolderOpen style={{ width: 18, height: 18 }} />,
      bg: '#f0f4ff',
      color: '#3730a3',
    },
    {
      label: 'Deadlines soon',
      value: upcomingDeadlines.length,
      icon: <TriangleAlert style={{ width: 18, height: 18 }} />,
      bg: '#fdf4ff',
      color: '#7e22ce',
    },
  ]

  return (
    <>
      <Header>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Sora:wght@400;600;700&display=swap');
          .db-root { font-family: 'Nunito', sans-serif; }
          .db-greeting { font-family: 'Sora', sans-serif; }
          .db-gradient { background: linear-gradient(135deg, #FF6B6B, #A855F7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
          .db-card { background: var(--background); border: 1px solid var(--border); border-radius: 16px; padding: 1.25rem; }
          .db-task-item { display: flex; align-items: center; gap: 10px; padding: 0.6rem 0; border-bottom: 1px solid var(--border); cursor: pointer; transition: opacity 0.15s; }
          .db-task-item:last-child { border-bottom: none; }
          .db-task-item:hover { opacity: 0.75; }
          .db-badge { font-size: 11px; padding: 2px 8px; border-radius: 99px; font-weight: 700; }
          .db-section-title { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.07em; color: #A855F7; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 6px; }
          .db-empty { text-align: center; padding: 1.5rem; color: var(--muted-foreground); font-size: 13px; }
          .db-deadline-item { display: flex; align-items: center; justify-content: space-between; padding: 0.65rem 0; border-bottom: 1px solid var(--border); }
          .db-deadline-item:last-child { border-bottom: none; }
          .db-view-link { font-size: 12px; color: #A855F7; font-weight: 700; text-decoration: none; display: flex; align-items: center; gap: 2px; }
          .db-view-link:hover { opacity: 0.75; }
          .db-icon-box { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        `}</style>

        <div className='db-root'>
          {/* Greeting */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div>
              <h1
                className='db-greeting'
                style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}
              >
                Bonjour,{' '}
                <span className='db-gradient'>{user?.username || 'there'}</span>
              </h1>
              <p
                style={{
                  fontSize: '13px',
                  color: 'var(--muted-foreground)',
                  textTransform: 'capitalize',
                }}
              >
                {dateLabel}
              </p>
            </div>
            <Link to='/tasks'>
              <Button
                style={{
                  background: 'linear-gradient(135deg, #FF6B6B, #A855F7)',
                  border: 'none',
                  color: '#fff',
                  borderRadius: 99,
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 800,
                  fontSize: 13,
                }}
              >
                <Plus style={{ width: 15, height: 15, marginRight: 5 }} />
                New Task
              </Button>
            </Link>
          </div>

          {/* Stat cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: 12,
              marginBottom: '1.5rem',
            }}
          >
            {statCards.map((s) => (
              <div
                key={s.label}
                style={{
                  background: s.bg,
                  color: s.color,
                  borderRadius: 14,
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                <div style={{ opacity: 0.8 }}>{s.icon}</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, lineHeight: 1 }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.7 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Main grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 16,
            }}
          >
            {/* Today's Tasks */}
            <div className='db-card'>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1rem',
                }}
              >
                <div className='db-section-title' style={{ margin: 0 }}>
                  <ListTodo style={{ width: 14, height: 14 }} />
                  Today's Tasks
                </div>
                <Link to='/tasks' className='db-view-link'>
                  View all <ChevronRight style={{ width: 13, height: 13 }} />
                </Link>
              </div>

              {loading ? (
                <div className='db-empty'>Loading...</div>
              ) : todayTasks.length === 0 ? (
                <div className='db-empty'>
                  <Calendar
                    style={{ width: 28, height: 28, margin: '0 auto 8px', opacity: 0.3 }}
                  />
                  <div>No tasks for today</div>
                  <Link to='/tasks'>
                    <Button
                      variant='outline'
                      style={{ marginTop: 8, fontSize: 12, borderRadius: 99 }}
                    >
                      Add a task
                    </Button>
                  </Link>
                </div>
              ) : (
                todayTasks.map((task) => (
                  <div
                    key={task.id}
                    className='db-task-item'
                    onClick={() => toggleTask(task.id)}
                  >
                    {task.completed ? (
                      <CheckCircle2
                        style={{ width: 17, height: 17, color: '#6BCB77', flexShrink: 0 }}
                      />
                    ) : (
                      <Circle
                        style={{
                          width: 17,
                          height: 17,
                          color: getPriorityColor(task.priority),
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          textDecoration: task.completed ? 'line-through' : 'none',
                          opacity: task.completed ? 0.5 : 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {task.title}
                      </div>
                      {!task.all_day && (
                        <div
                          style={{
                            fontSize: 11,
                            color: 'var(--muted-foreground)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                            marginTop: 2,
                          }}
                        >
                          <Clock style={{ width: 10, height: 10 }} />
                          {formatTime(task.start_time)} - {formatTime(task.end_time)}
                        </div>
                      )}
                    </div>
                    <span
                      className='db-badge'
                      style={{
                        background: getPriorityColor(task.priority) + '20',
                        color: getPriorityColor(task.priority),
                      }}
                    >
                      {task.priority}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Upcoming Deadlines */}
            <div className='db-card'>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1rem',
                }}
              >
                <div className='db-section-title' style={{ margin: 0 }}>
                  <AlertTriangle style={{ width: 14, height: 14 }} />
                  Upcoming Deadlines
                </div>
                <Link to='/documents' className='db-view-link'>
                  View all <ChevronRight style={{ width: 13, height: 13 }} />
                </Link>
              </div>

              {loading ? (
                <div className='db-empty'>Loading...</div>
              ) : upcomingDeadlines.length === 0 ? (
                <div className='db-empty'>
                  <AlertTriangle
                    style={{ width: 28, height: 28, margin: '0 auto 8px', opacity: 0.3 }}
                  />
                  <div>No upcoming deadlines</div>
                </div>
              ) : (
                upcomingDeadlines.map((doc) => (
                  <div key={doc.id} className='db-deadline-item'>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div
                        className='db-icon-box'
                        style={{ background: '#fff8f0', color: '#e65100' }}
                      >
                        <FileText style={{ width: 16, height: 16 }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{doc.title}</div>
                        <div style={{ fontSize: 11, color: '#e65100', fontWeight: 700 }}>
                          Due: {doc.extracted_data?.deadline}
                        </div>
                      </div>
                    </div>
                    {doc.extracted_data?.amount && (
                      <span
                        className='db-badge'
                        style={{ background: '#f0fdf4', color: '#166534' }}
                      >
                        {doc.extracted_data.amount}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Recent Documents */}
            <div className='db-card'>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1rem',
                }}
              >
                <div className='db-section-title' style={{ margin: 0 }}>
                  <FolderOpen style={{ width: 14, height: 14 }} />
                  Recent Documents
                </div>
                <Link to='/documents' className='db-view-link'>
                  View all <ChevronRight style={{ width: 13, height: 13 }} />
                </Link>
              </div>

              {loading ? (
                <div className='db-empty'>Loading...</div>
              ) : documents.length === 0 ? (
                <div className='db-empty'>
                  <FileText
                    style={{ width: 28, height: 28, margin: '0 auto 8px', opacity: 0.3 }}
                  />
                  <div>No documents yet</div>
                  <Link to='/documents'>
                    <Button
                      variant='outline'
                      style={{ marginTop: 8, fontSize: 12, borderRadius: 99 }}
                    >
                      Upload document
                    </Button>
                  </Link>
                </div>
              ) : (
                documents.slice(0, 4).map((doc) => (
                  <div key={doc.id} className='db-task-item'>
                    <div
                      className='db-icon-box'
                      style={{ background: '#f0f4ff', color: '#3730a3' }}
                    >
                      <FileIcon type={doc.file_type} />
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {doc.title}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>
                        {doc.extracted_data?.document_type || doc.file_type}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* AI Assistant */}
            <div
              className='db-card'
              style={{
                background: 'linear-gradient(135deg, #1a1a2e, #2d1b69)',
                border: 'none',
                color: '#fff',
              }}
            >
              <div className='db-section-title' style={{ color: 'rgba(255,255,255,0.45)' }}>
                <Sparkles style={{ width: 13, height: 13 }} />
                AI Assistant
              </div>
              <div
                style={{
                  fontFamily: "'Sora', sans-serif",
                  fontSize: '1rem',
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                Ask about your documents
              </div>
              <p
                style={{
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.55)',
                  lineHeight: 1.6,
                  marginBottom: '1rem',
                }}
              >
                Get summaries, find deadlines, and extract key information from your uploaded documents.
              </p>
              <div
                style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: '1rem' }}
              >
                {['What bills are due?', 'Summarize my contract', 'Show my deadlines'].map(
                  (q) => (
                    <Link key={q} to='/chats'>
                      <button
                        style={{
                          background: 'rgba(255,255,255,0.08)',
                          border: '1px solid rgba(255,255,255,0.12)',
                          borderRadius: 99,
                          padding: '3px 10px',
                          fontSize: 11,
                          color: 'rgba(255,255,255,0.75)',
                          cursor: 'pointer',
                          fontFamily: "'Nunito', sans-serif",
                          fontWeight: 600,
                        }}
                      >
                        {q}
                      </button>
                    </Link>
                  )
                )}
              </div>
              <Link to='/chats' style={{ display: 'block' }}>
                <Button
                  style={{
                    background: 'linear-gradient(135deg, #FF6B6B, #A855F7)',
                    border: 'none',
                    color: '#fff',
                    borderRadius: 99,
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: 800,
                    width: '100%',
                    fontSize: 13,
                  }}
                >
                  <Bot style={{ width: 15, height: 15, marginRight: 6 }} />
                  Open AI Assistant
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Main>
    </>
  )
}