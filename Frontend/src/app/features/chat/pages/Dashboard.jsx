import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { useSelector, useDispatch } from 'react-redux'
import { useChat } from '../hooks/useChat'
import { useAuth } from '../../auth/hook/useAuth'
import { useNavigate } from 'react-router'
import remarkGfm from 'remark-gfm'
import { setCurrentChatId } from '../chat.slice'
import {
  Menu,
  X,
  Plus,
  Send,
  Sun,
  Moon,
  User,
  LogOut,
  MessageSquare,
  ChevronUp,
  Trash2,
} from 'lucide-react'
import '../../../../app/index.css'

const stripMarkdown = (text) => {
  if (!text || typeof text !== 'string') return text || 'Untitled Chat'
  return text
    .replace(/#{1,6}\s?/g, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    .replace(/~~(.+?)~~/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/!\[.*?\]\(.+?\)/g, '')
    .trim() || 'Untitled Chat'
}

const Dashboard = () => {
  const chat = useChat()
  const auth = useAuth()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [chatInput, setChatInput] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  const [profileOpen, setProfileOpen] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  // { chatId, item (snapshot for rollback), isDeleting, error }
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const chats = useSelector((state) => state.chat.chats)
  const currentChatId = useSelector((state) => state.chat.currentChatId)
  const user = useSelector((state) => state.auth.user)

  const messagesEndRef = useRef(null)
  const profileRef = useRef(null)
  const eventSourceRef = useRef(null)
  const abortRef = useRef(false)

  useEffect(() => {
    chat.initializeSocketConnection()
    chat.handleGetChats()
  }, [])

  useEffect(() => {
    return () => {
      abortRef.current = true
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [])

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('dashboard-theme')
    // Default to dark if no preference stored (matches auth page theme)
    if (savedTheme === 'light') setDarkMode(false)
    else setDarkMode(true)
  }, [])

  useEffect(() => {
    window.localStorage.setItem('dashboard-theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chats, currentChatId])

  useEffect(() => {
    const handleClick = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const currentChatMessages = useMemo(() => {
    return chats[currentChatId]?.messages || []
  }, [chats, currentChatId])

  const chatList = useMemo(() => {
    return Object.values(chats)
  }, [chats])

  const activeChat = currentChatId ? chats[currentChatId] : null
  const hasMessages = currentChatMessages.length > 0

  const suggestionPrompts = [
    'Summarize my current project status',
    'Help me plan the next sprint',
    'Review this feature idea critically',
    'Draft a professional client update',
  ]

  const handleSubmitMessage = useCallback((event) => {
    event.preventDefault()
    if (isStreaming) return

    const trimmedMessage = chatInput.trim()
    if (!trimmedMessage) return

    setIsStreaming(true)
    abortRef.current = false

    chat.handleSendMessageStream({
      message: trimmedMessage,
      chatId: currentChatId,
      controllerRef: eventSourceRef,
      onDone: () => {
        if (!abortRef.current) {
          setIsStreaming(false)
        }
      },
    })

    setChatInput('')
  }, [chat, chatInput, currentChatId, isStreaming])

  const openChat = useCallback((chatId) => {
    chat.handleOpenChat(chatId, chats)
    setSidebarOpen(false)
  }, [chat, chats])

  const handleNewChat = useCallback(() => {
    dispatch(setCurrentChatId(null))
    setChatInput('')
    setSidebarOpen(false)
  }, [dispatch])

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteConfirm || deleteConfirm.isDeleting) return
    const { chatId, item } = deleteConfirm

    // Mark as in-flight to prevent double-click
    setDeleteConfirm(prev => ({ ...prev, isDeleting: true, error: null }))

    try {
      await chat.handleDeleteChat(chatId)
      // Success — close modal (state already removed by the hook)
      setDeleteConfirm(null)
    } catch (err) {
      const status = err?.response?.status
      if (status === 404) {
        // Already deleted elsewhere — treat as success
        setDeleteConfirm(null)
        return
      }
      // Restore the item in Redux so the sidebar recovers (hook throws on non-404 errors)
      // We dispatch setChats externally; simpler: re-fetch chats to restore state
      chat.handleGetChats()
      setDeleteConfirm(prev => ({
        ...prev,
        isDeleting: false,
        error: 'Failed to delete. Please try again.',
      }))
    }
  }, [deleteConfirm, chat])

  const handleLogout = useCallback(async () => {
    await auth.handleLogout(navigate)
  }, [auth, navigate])

  const theme = darkMode
    ? {
        // ── Emerald dark theme — matches auth pages (index.css tokens) ──
        bg: '#131313',
        bgSubtle: '#1c1b1b',
        surface: 'rgba(28, 27, 27, 0.88)',
        surfaceSolid: '#1c1b1b',
        surfaceHover: '#2a2a2a',
        border: 'rgba(0, 223, 193, 0.12)',
        borderStrong: 'rgba(0, 223, 193, 0.24)',
        text: '#e5e2e1',
        textSecondary: '#b9cac4',
        textMuted: '#708099',
        accent: '#00dfc1',
        accentHover: '#26fedc',
        accentSoft: 'rgba(0, 223, 193, 0.10)',
        userBubble: 'rgba(0, 223, 193, 0.10)',
        pageGradient:
          'radial-gradient(circle at 20% 30%, rgba(0,223,193,0.06), transparent 32%), radial-gradient(circle at 80% 72%, rgba(38,254,220,0.07), transparent 36%), linear-gradient(180deg, #131313 0%, #0f1612 100%)',
      }
    : {
        bg: '#f4f7fb',
        bgSubtle: '#edf3f9',
        surface: 'rgba(255, 255, 255, 0.88)',
        surfaceSolid: '#ffffff',
        surfaceHover: '#eef4fb',
        border: 'rgba(31, 41, 55, 0.10)',
        borderStrong: 'rgba(31, 41, 55, 0.18)',
        text: '#142033',
        textSecondary: '#516177',
        textMuted: '#8796ac',
        accent: '#00a896',
        accentHover: '#00c4af',
        accentSoft: 'rgba(0, 168, 150, 0.08)',
        userBubble: 'rgba(0, 168, 150, 0.10)',
        pageGradient:
          'radial-gradient(circle at top left, rgba(0,168,150,0.06), transparent 28%), radial-gradient(circle at top right, rgba(0,223,193,0.06), transparent 22%), linear-gradient(180deg, #f7f9fc 0%, #eef3f8 100%)',
      }

  return (
    <>
      <style>{`
        .dashboard-root,
        .dashboard-root * {
          box-sizing: border-box;
        }

        .dashboard-root * {
          font-family: 'Geist', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .dashboard-root ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .dashboard-root ::-webkit-scrollbar-track {
          background: transparent;
        }

        .dashboard-root ::-webkit-scrollbar-thumb {
          background: ${theme.borderStrong};
          border-radius: 999px;
        }

        .dashboard-root {
          --bg: ${theme.bg};
          --bg-subtle: ${theme.bgSubtle};
          --surface: ${theme.surface};
          --surface-solid: ${theme.surfaceSolid};
          --surface-hover: ${theme.surfaceHover};
          --border: ${theme.border};
          --border-strong: ${theme.borderStrong};
          --text: ${theme.text};
          --text-secondary: ${theme.textSecondary};
          --text-muted: ${theme.textMuted};
          --accent: ${theme.accent};
          --accent-hover: ${theme.accentHover};
          --accent-soft: ${theme.accentSoft};
          --user-bubble: ${theme.userBubble};
        }

        .dashboard-fade {
          animation: dashboardFade 180ms ease-out;
        }

        @keyframes dashboardFade {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .dashboard-input {
          background: var(--surface-solid);
          border: 1px solid var(--border);
          color: var(--text);
          transition: border-color 140ms ease, background-color 140ms ease;
        }

        .dashboard-input:focus {
          outline: none;
          border-color: var(--accent);
        }

        .dashboard-markdown p {
          margin: 0 0 12px;
          line-height: 1.7;
        }

        .dashboard-markdown ul,
        .dashboard-markdown ol {
          margin: 0 0 12px;
          padding-left: 20px;
        }

        .dashboard-markdown pre {
          margin: 0 0 12px;
          overflow-x: auto;
          border-radius: 16px;
          background: var(--bg-subtle);
          border: 1px solid var(--border);
          padding: 14px;
        }

        .dashboard-markdown code {
          background: var(--accent-soft);
          color: var(--accent);
          border-radius: 6px;
          padding: 2px 6px;
          font-size: 0.92em;
        }

        .dashboard-markdown pre code {
          background: transparent;
          padding: 0;
        }

        /* Delete button: hidden by default, shown on row hover */
        .chat-delete-btn {
          opacity: 0;
          pointer-events: none;
        }
        .chat-row:hover .chat-delete-btn {
          opacity: 1;
          pointer-events: auto;
        }
        /* On touch devices always show it (no hover state) */
        @media (hover: none) {
          .chat-delete-btn {
            opacity: 1;
            pointer-events: auto;
          }
        }
        .chat-delete-btn:hover {
          color: #ef4444 !important;
          background: rgba(239, 68, 68, 0.12) !important;
        }
      `}</style>

      <div
        className="dashboard-root"
        style={{
          height: '100vh',
          width: '100%',
          overflow: 'hidden',
          background: theme.pageGradient,
          color: theme.text,
          position: 'relative',
        }}
      >
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 40,
              background: darkMode ? 'rgba(10, 12, 11, 0.72)' : 'rgba(15, 23, 42, 0.16)',
            }}
          />
        )}

        {sidebarOpen && (
          <aside
            className="dashboard-fade"
            style={{
              position: 'fixed',
              inset: '0 auto 0 0',
              zIndex: 50,
              width: 'min(320px, 86vw)',
              height: '100vh',
              display: 'flex',
              flexDirection: 'column',
              background: theme.surface,
              backdropFilter: 'blur(18px)',
              borderRight: `1px solid ${theme.border}`,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px',
                borderBottom: `1px solid ${theme.border}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 16,
                    display: 'grid',
                    placeItems: 'center',
                    background: theme.accentSoft,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  <img
                    src="/logo.png"
                    alt="Logo"
                    style={{ width: 22, height: 22, objectFit: 'contain' }}
                  />
                </div>
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 11,
                      textTransform: 'uppercase',
                      letterSpacing: '0.22em',
                      color: theme.textMuted,
                    }}
                  >
                    Workspace
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: 16, fontWeight: 600 }}>
                    Inqora AI
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSidebarOpen(false)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 14,
                  border: `1px solid ${theme.border}`,
                  background: theme.surfaceSolid,
                  color: theme.text,
                  display: 'grid',
                  placeItems: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '16px 16px 8px' }}>
              <button
                onClick={handleNewChat}
                style={{
                  width: '100%',
                  border: 'none',
                  borderRadius: 18,
                  background: theme.accent,
                  color: theme.bg,
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Plus size={16} />
                New Chat
              </button>
            </div>

            <div style={{ padding: '8px 18px 10px' }}>
              <p
                style={{
                  margin: 0,
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.22em',
                  color: theme.textMuted,
                }}
              >
                Recent Conversations
              </p>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px 12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {chatList.map((item) => {
                  const active = currentChatId === item.id
                  return (
                    <div
                      key={item.id}
                      className="chat-row"
                      style={{
                        position: 'relative',
                        borderRadius: 18,
                        border: `1px solid ${active ? theme.borderStrong : 'transparent'}`,
                        background: active ? theme.accentSoft : 'transparent',
                      }}
                    >
                      <button
                        onClick={() => openChat(item.id)}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '12px 44px 12px 14px',
                          borderRadius: 18,
                          border: 'none',
                          background: 'transparent',
                          color: active ? theme.text : theme.textSecondary,
                          cursor: 'pointer',
                        }}
                      >
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 14,
                            display: 'grid',
                            placeItems: 'center',
                            background: active ? theme.surfaceHover : theme.bgSubtle,
                            flexShrink: 0,
                          }}
                        >
                          <MessageSquare size={16} />
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <p
                            style={{
                              margin: 0,
                              fontSize: 14,
                              fontWeight: 500,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {stripMarkdown(item.title)}
                          </p>
                          <p
                            style={{
                              margin: '4px 0 0',
                              fontSize: 12,
                              color: theme.textMuted,
                            }}
                          >
                            {item.messages?.length || 0} messages
                          </p>
                        </div>
                      </button>

                      {/* Delete button — shown on hover via CSS class */}
                      <button
                        className="chat-delete-btn"
                        aria-label="Delete conversation"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteConfirm({ chatId: item.id, item, isDeleting: false, error: null })
                        }}
                        style={{
                          position: 'absolute',
                          right: 10,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: 30,
                          height: 30,
                          borderRadius: 10,
                          border: 'none',
                          background: 'transparent',
                          color: theme.textMuted,
                          display: 'grid',
                          placeItems: 'center',
                          cursor: 'pointer',
                          transition: 'color 140ms ease, background 140ms ease',
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>

            <div
              ref={profileRef}
              style={{
                position: 'relative',
                borderTop: `1px solid ${theme.border}`,
                padding: 16,
              }}
            >
              {profileOpen && (
                <div
                  className="dashboard-fade"
                  style={{
                    position: 'absolute',
                    left: 16,
                    right: 16,
                    bottom: 'calc(100% + 10px)',
                    background: theme.surfaceSolid,
                    border: `1px solid ${theme.border}`,
                    borderRadius: 18,
                    overflow: 'hidden',
                  }}
                >
                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      border: 'none',
                      background: 'transparent',
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      color: '#ef4444',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <LogOut size={16} />
                    Log out
                  </button>
                </div>
              )}

              <button
                onClick={() => setProfileOpen((value) => !value)}
                style={{
                  width: '100%',
                  border: `1px solid ${theme.border}`,
                  borderRadius: 18,
                  background: theme.surfaceSolid,
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  textAlign: 'left',
                  color: theme.text,
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 14,
                    display: 'grid',
                    placeItems: 'center',
                    background: theme.surfaceHover,
                    flexShrink: 0,
                  }}
                >
                  <User size={17} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 14,
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {user?.fullname || user?.username || 'User'}
                  </p>
                  <p
                    style={{
                      margin: '4px 0 0',
                      fontSize: 12,
                      color: theme.textMuted,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {user?.email || 'Active account'}
                  </p>
                </div>
                <ChevronUp
                  size={16}
                  style={{
                    transform: profileOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 140ms ease',
                    flexShrink: 0,
                  }}
                />
              </button>
            </div>
          </aside>
        )}

        <main
          style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <header
            style={{
              flexShrink: 0,
              borderBottom: `1px solid ${theme.border}`,
              background: theme.surface,
              backdropFilter: 'blur(18px)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
                padding: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                <button
                  onClick={() => setSidebarOpen(true)}
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 16,
                    border: `1px solid ${theme.border}`,
                    background: theme.surfaceSolid,
                    color: theme.text,
                    display: 'grid',
                    placeItems: 'center',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  <Menu size={18} />
                </button>

                <div style={{ minWidth: 0 }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 11,
                      textTransform: 'uppercase',
                      letterSpacing: '0.22em',
                      color: theme.textMuted,
                    }}
                  >
                    {hasMessages ? 'Conversation' : 'Dashboard'}
                  </p>
                  <h2
                    style={{
                      margin: '4px 0 0',
                      fontSize: 20,
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {hasMessages
                      ? stripMarkdown(activeChat?.title || 'Current chat')
                      : 'What do you want to work on today?'}
                  </h2>
                </div>
              </div>

              <button
                onClick={() => setDarkMode((value) => !value)}
                aria-label="Toggle theme"
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 16,
                  border: `1px solid ${theme.border}`,
                  background: theme.surfaceSolid,
                  color: theme.text,
                  display: 'grid',
                  placeItems: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </header>

          <div
            style={{
              minHeight: 0,
              flex: 1,
              overflow: 'hidden',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            {!hasMessages ? (
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div style={{ width: '100%', maxWidth: 980 }}>
                  <div style={{ maxWidth: 680, marginBottom: 28 }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 11,
                        textTransform: 'uppercase',
                        letterSpacing: '0.22em',
                        color: theme.textMuted,
                      }}
                    >
                      AI Workspace
                    </p>
                    <h3
                      style={{
                        margin: '16px 0 0',
                        fontSize: 'clamp(2rem, 4vw, 3.6rem)',
                        lineHeight: 1.05,
                        fontWeight: 700,
                      }}
                    >
                      Ask, analyze, and iterate from one workspace.
                    </h3>
                    <p
                      style={{
                        margin: '16px 0 0',
                        maxWidth: 560,
                        fontSize: 16,
                        lineHeight: 1.8,
                        color: theme.textSecondary,
                      }}
                    >
                      Start a fresh conversation, reopen earlier chats, or use a suggested prompt to move faster.
                    </p>
                  </div>

                  <div
                    style={{
                      background: theme.surface,
                      border: `1px solid ${theme.border}`,
                      borderRadius: 28,
                      padding: 18,
                      backdropFilter: 'blur(18px)',
                    }}
                  >
                    <form onSubmit={handleSubmitMessage}>
                      <div style={{ position: 'relative' }}>
                        <textarea
                          value={chatInput}
                          onChange={(event) => setChatInput(event.target.value)}
                          disabled={isStreaming}
                          placeholder="Ask anything..."
                          rows={5}
                          className="dashboard-input"
                          style={{
                            width: '100%',
                            minHeight: 170,
                            resize: 'vertical',
                            borderRadius: 24,
                            padding: '18px 64px 18px 18px',
                            fontSize: 15,
                          }}
                        />
                        <button
                          type="submit"
                          disabled={!chatInput.trim() || isStreaming}
                          style={{
                            position: 'absolute',
                            right: 14,
                            bottom: 14,
                            width: 44,
                            height: 44,
                            borderRadius: 16,
                            border: `1px solid ${chatInput.trim() && !isStreaming ? 'transparent' : theme.border}`,
                            background: chatInput.trim() && !isStreaming ? theme.accent : 'transparent',
                            color: chatInput.trim() && !isStreaming ? theme.bg : theme.textMuted,
                            display: 'grid',
                            placeItems: 'center',
                            cursor: chatInput.trim() && !isStreaming ? 'pointer' : 'not-allowed',
                          }}
                        >
                          <Send size={18} />
                        </button>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 10,
                          marginTop: 16,
                        }}
                      >
                        {suggestionPrompts.map((prompt) => (
                          <button
                            key={prompt}
                            type="button"
                            onClick={() => setChatInput(prompt)}
                            style={{
                              border: `1px solid ${theme.border}`,
                              background: theme.surfaceSolid,
                              color: theme.textSecondary,
                              borderRadius: 999,
                              padding: '10px 14px',
                              fontSize: 13,
                              cursor: 'pointer',
                            }}
                          >
                            {prompt}
                          </button>
                        ))}
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div
                  style={{
                    flexShrink: 0,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: 12,
                  }}
                >
                  {[
                    ['Active Chat', stripMarkdown(activeChat?.title || 'Current chat')],
                    ['Messages', String(currentChatMessages.length)],
                    ['Status', isStreaming ? 'Generating response' : 'Ready'],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      style={{
                        background: theme.surface,
                        border: `1px solid ${theme.border}`,
                        borderRadius: 24,
                        padding: '16px 18px',
                        backdropFilter: 'blur(18px)',
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          fontSize: 11,
                          textTransform: 'uppercase',
                          letterSpacing: '0.22em',
                          color: theme.textMuted,
                        }}
                      >
                        {label}
                      </p>
                      <p
                        style={{
                          margin: '10px 0 0',
                          fontSize: 16,
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    minHeight: 0,
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    background: theme.surface,
                    border: `1px solid ${theme.border}`,
                    borderRadius: 28,
                    backdropFilter: 'blur(18px)',
                  }}
                >
                  <div
                    className="messages"
                    style={{
                      minHeight: 0,
                      flex: 1,
                      overflowY: 'auto',
                      padding: 18,
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        maxWidth: 920,
                        margin: '0 auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 18,
                      }}
                    >
                      {currentChatMessages.map((message, index) => {
                        const isUser = message.role === 'user'
                        return (
                          <div
                            key={index}
                            className="dashboard-fade"
                            style={{
                              display: 'flex',
                              justifyContent: isUser ? 'flex-end' : 'flex-start',
                            }}
                          >
                            <div
                              style={{
                                width: 'min(100%, 760px)',
                                maxWidth: isUser ? '85%' : '100%',
                                borderRadius: 24,
                                padding: isUser ? '14px 16px' : '16px 18px',
                                background: isUser ? theme.userBubble : theme.surfaceSolid,
                                border: isUser ? 'none' : `1px solid ${theme.border}`,
                              }}
                            >
                              <p
                                style={{
                                  margin: '0 0 10px',
                                  fontSize: 11,
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.22em',
                                  color: isUser ? theme.textSecondary : theme.accent,
                                }}
                              >
                                {isUser ? 'You' : 'Inqora AI'}
                              </p>

                              {isUser ? (
                                <p
                                  style={{
                                    margin: 0,
                                    whiteSpace: 'pre-wrap',
                                    fontSize: 15,
                                    lineHeight: 1.7,
                                  }}
                                >
                                  {message.content}
                                </p>
                              ) : (
                                <div className="dashboard-markdown" style={{ fontSize: 15 }}>
                                  <ReactMarkdown
                                    components={{
                                      p: ({ children }) => <p>{children}</p>,
                                      ul: ({ children }) => <ul>{children}</ul>,
                                      ol: ({ children }) => <ol>{children}</ol>,
                                      code: ({ children }) => <code>{children}</code>,
                                      pre: ({ children }) => <pre>{children}</pre>,
                                    }}
                                    remarkPlugins={[remarkGfm]}
                                  >
                                    {message.content}
                                  </ReactMarkdown>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  </div>

                  <div
                    style={{
                      flexShrink: 0,
                      borderTop: `1px solid ${theme.border}`,
                      padding: 16,
                    }}
                  >
                    <form
                      onSubmit={handleSubmitMessage}
                      style={{
                        width: '100%',
                        maxWidth: 920,
                        margin: '0 auto',
                        position: 'relative',
                      }}
                    >
                      <textarea
                        value={chatInput}
                        onChange={(event) => setChatInput(event.target.value)}
                        disabled={isStreaming}
                        placeholder="Type your message..."
                        rows={1}
                        className="dashboard-input"
                        style={{
                          width: '100%',
                          minHeight: 64,
                          maxHeight: 180,
                          resize: 'vertical',
                          borderRadius: 22,
                          padding: '16px 58px 16px 16px',
                          fontSize: 15,
                        }}
                      />
                      <button
                        type="submit"
                        disabled={!chatInput.trim() || isStreaming}
                        style={{
                          position: 'absolute',
                          right: 12,
                          bottom: 12,
                          width: 40,
                          height: 40,
                          borderRadius: 14,
                          border: `1px solid ${chatInput.trim() && !isStreaming ? 'transparent' : theme.border}`,
                          background: chatInput.trim() && !isStreaming ? theme.accent : 'transparent',
                          color: chatInput.trim() && !isStreaming ? theme.bg : theme.textMuted,
                          display: 'grid',
                          placeItems: 'center',
                          cursor: chatInput.trim() && !isStreaming ? 'pointer' : 'not-allowed',
                        }}
                      >
                        <Send size={16} />
                      </button>
                    </form>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* ── Delete confirmation modal ── */}
      {deleteConfirm && (
        <div
          className="dashboard-fade"
          onClick={() => !deleteConfirm.isDeleting && setDeleteConfirm(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.64)',
            backdropFilter: 'blur(6px)',
            padding: '0 16px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 380,
              borderRadius: 24,
              border: `1px solid ${theme.border}`,
              background: theme.surfaceSolid,
              padding: '28px 24px 24px',
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                background: 'rgba(239,68,68,0.12)',
                border: '1px solid rgba(239,68,68,0.22)',
                display: 'grid',
                placeItems: 'center',
                marginBottom: 18,
              }}
            >
              <Trash2 size={20} style={{ color: '#ef4444' }} />
            </div>

            <p
              style={{
                margin: '0 0 6px',
                fontSize: 16,
                fontWeight: 600,
                color: theme.text,
              }}
            >
              Delete conversation?
            </p>
            <p style={{ margin: '0 0 22px', fontSize: 14, color: theme.textSecondary, lineHeight: 1.6 }}>
              This action cannot be undone. The conversation and all its messages will be permanently removed.
            </p>

            {/* Error message */}
            {deleteConfirm.error && (
              <p
                style={{
                  margin: '0 0 16px',
                  fontSize: 13,
                  color: '#ef4444',
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.18)',
                  borderRadius: 12,
                  padding: '10px 14px',
                }}
              >
                {deleteConfirm.error}
              </p>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleteConfirm.isDeleting}
                style={{
                  flex: 1,
                  padding: '12px 0',
                  borderRadius: 14,
                  border: `1px solid ${theme.border}`,
                  background: 'transparent',
                  color: theme.text,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: deleteConfirm.isDeleting ? 'not-allowed' : 'pointer',
                  opacity: deleteConfirm.isDeleting ? 0.5 : 1,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteConfirm.isDeleting}
                style={{
                  flex: 1,
                  padding: '12px 0',
                  borderRadius: 14,
                  border: 'none',
                  background: deleteConfirm.isDeleting ? 'rgba(239,68,68,0.5)' : '#ef4444',
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: deleteConfirm.isDeleting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                {deleteConfirm.isDeleting ? (
                  <>
                    <span style={{ opacity: 0.7 }}>Deleting…</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Dashboard
