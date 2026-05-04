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
} from 'lucide-react'
import '../../../../app/index.css'

const Dashboard = () => {
  const chat = useChat()
  const auth = useAuth()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [chatInput, setChatInput] = useState('')
  const chats = useSelector((state) => state.chat.chats)
  const currentChatId = useSelector((state) => state.chat.currentChatId)
  const user = useSelector((state) => state.auth.user)

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  const [profileOpen, setProfileOpen] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
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

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chats, currentChatId])

  // Close profile popup on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
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

  const hasMessages = currentChatMessages.length > 0

  const handleSubmitMessage = useCallback(
    (event) => {
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
    },
    [chatInput, currentChatId, chat, isStreaming]
  )

  const openChat = useCallback(
    (chatId) => {
      chat.handleOpenChat(chatId, chats)
      setSidebarOpen(false)
    },
    [chat, chats]
  )

  const handleNewChat = useCallback(() => {
    dispatch(setCurrentChatId(null))
    setSidebarOpen(false)
  }, [dispatch])

  const handleLogout = useCallback(async () => {
    await auth.handleLogout(navigate)
  }, [auth, navigate])

  // --- Theme tokens ---
  const theme = darkMode
    ? {
        bg: '#0a0a0a',
        surface: '#141414',
        surfaceHover: '#1e1e1e',
        border: '#222',
        borderLight: '#2a2a2a',
        text: '#e5e5e5',
        textSecondary: '#888',
        textMuted: '#555',
        inputBg: '#141414',
        userBubble: '#1e1e1e',
        accent: '#e5e5e5',
        shadow: '0 1px 3px rgba(0,0,0,0.3)',
      }
    : {
        bg: '#fafafa',
        surface: '#ffffff',
        surfaceHover: '#f5f5f5',
        border: '#e5e5e5',
        borderLight: '#eee',
        text: '#1a1a1a',
        textSecondary: '#666',
        textMuted: '#999',
        inputBg: '#ffffff',
        userBubble: '#f0f0f0',
        accent: '#1a1a1a',
        shadow: '0 1px 3px rgba(0,0,0,0.06)',
      }

  return (
    <>
      {/* Google Font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');

        .dashboard-root * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .dashboard-root ::-webkit-scrollbar {
          width: 4px;
        }
        .dashboard-root ::-webkit-scrollbar-track {
          background: transparent;
        }
        .dashboard-root ::-webkit-scrollbar-thumb {
          background: ${theme.borderLight};
          border-radius: 4px;
        }

        .fade-in {
          animation: fadeIn 250ms ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .slide-in-left {
          animation: slideLeft 250ms ease-out;
        }
        @keyframes slideLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>

      <div
        className="dashboard-root"
        style={{
          display: 'flex',
          height: '100vh',
          width: '100%',
          background: theme.bg,
          color: theme.text,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* ─── SIDEBAR OVERLAY (mobile) ─── */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.4)',
              zIndex: 40,
              transition: 'opacity 250ms',
            }}
          />
        )}

        {/* ─── SIDEBAR ─── */}
        <aside
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            width: 260,
            background: theme.surface,
            borderRight: `1px solid ${theme.border}`,
            display: 'flex',
            flexDirection: 'column',
            zIndex: 50,
            transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 250ms ease',
            boxShadow: sidebarOpen ? '4px 0 12px rgba(0,0,0,0.1)' : 'none',
          }}
        >
          {/* Sidebar header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 16px 12px',
              borderBottom: `1px solid ${theme.border}`,
            }}
          >
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: '0.5px',
                color: theme.text,
              }}
            >
              INQORA AI
            </span>
            <button
              onClick={() => setSidebarOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: theme.textSecondary,
                cursor: 'pointer',
                padding: 4,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* New Chat button */}
          <div style={{ padding: '12px 12px 8px' }}>
            <button
              onClick={handleNewChat}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 12px',
                background: 'none',
                border: `1px solid ${theme.border}`,
                borderRadius: 8,
                color: theme.text,
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background 200ms',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = theme.surfaceHover)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = 'none')
              }
            >
              <Plus size={16} />
              New Chat
            </button>
          </div>

          {/* Chat list */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '4px 12px',
            }}
          >
            {chatList.map((c) => (
              <button
                onClick={() => openChat(c.id)}
                key={c.id}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 10px',
                  background:
                    currentChatId === c.id ? theme.surfaceHover : 'none',
                  border: 'none',
                  borderRadius: 6,
                  color:
                    currentChatId === c.id
                      ? theme.text
                      : theme.textSecondary,
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'background 200ms, color 200ms',
                  marginBottom: 2,
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = theme.surfaceHover)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background =
                    currentChatId === c.id ? theme.surfaceHover : 'transparent')
                }
              >
                <MessageSquare
                  size={14}
                  style={{ flexShrink: 0, opacity: 0.5 }}
                />
                <span
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {c.title}
                </span>
              </button>
            ))}
          </div>

          {/* Profile section */}
          <div
            ref={profileRef}
            style={{
              position: 'relative',
              borderTop: `1px solid ${theme.border}`,
              padding: '8px 12px',
            }}
          >
            {/* Profile popup */}
            {profileOpen && (
              <div
                className="fade-in"
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: 12,
                  right: 12,
                  marginBottom: 4,
                  background: theme.surface,
                  border: `1px solid ${theme.border}`,
                  borderRadius: 8,
                  boxShadow: theme.shadow,
                  overflow: 'hidden',
                }}
              >
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 12px',
                    background: 'none',
                    border: 'none',
                    color: '#e55',
                    fontSize: 13,
                    cursor: 'pointer',
                    transition: 'background 200ms',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = theme.surfaceHover)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = 'transparent')
                  }
                >
                  <LogOut size={14} />
                  Log out
                </button>
              </div>
            )}

            <button
              onClick={() => setProfileOpen(!profileOpen)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 10px',
                background: 'none',
                border: 'none',
                borderRadius: 6,
                color: theme.text,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'background 200ms',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = theme.surfaceHover)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = 'transparent')
              }
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: theme.surfaceHover,
                  border: `1px solid ${theme.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <User size={14} style={{ opacity: 0.6 }} />
              </div>
              <span
                style={{
                  flex: 1,
                  textAlign: 'left',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontWeight: 500,
                }}
              >
                {user?.fullname || user?.username || 'User'}
              </span>
              <ChevronUp
                size={14}
                style={{
                  opacity: 0.4,
                  transform: profileOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 200ms',
                }}
              />
            </button>
          </div>
        </aside>

        {/* ─── MAIN AREA ─── */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            minWidth: 0,
          }}
        >
          {/* ─── TOP BAR ─── */}
          <header
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 16px',
              height: 48,
              borderBottom: `1px solid ${theme.border}`,
              background: theme.surface,
              flexShrink: 0,
            }}
          >
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                color: theme.textSecondary,
                cursor: 'pointer',
                padding: 6,
                display: 'flex',
                alignItems: 'center',
                borderRadius: 6,
                transition: 'color 200ms',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = theme.text)}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = theme.textSecondary)
              }
            >
              <Menu size={20} />
            </button>

            <button
              onClick={() => setDarkMode(!darkMode)}
              style={{
                background: 'none',
                border: 'none',
                color: theme.textSecondary,
                cursor: 'pointer',
                padding: 6,
                display: 'flex',
                alignItems: 'center',
                borderRadius: 6,
                transition: 'color 200ms',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = theme.text)}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = theme.textSecondary)
              }
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </header>

          {/* ─── CHAT CONTENT ─── */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {!hasMessages ? (
              /* ─── INITIAL STATE: centered input ─── */
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 24px',
                  transition: 'opacity 300ms',
                }}
              >
                <h2
                  style={{
                    fontSize: 22,
                    fontWeight: 400,
                    color: theme.text,
                    marginBottom: 32,
                    textAlign: 'center',
                    letterSpacing: '-0.3px',
                  }}
                >
                  How can INQORA AI assist you?
                </h2>

                <form
                  onSubmit={handleSubmitMessage}
                  style={{
                    width: '100%',
                    maxWidth: 580,
                    position: 'relative',
                  }}
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    disabled={isStreaming}
                    placeholder="Ask anything..."
                    style={{
                      width: '100%',
                      padding: '14px 48px 14px 16px',
                      background: theme.inputBg,
                      border: `1px solid ${theme.border}`,
                      borderRadius: 12,
                      fontSize: 15,
                      color: theme.text,
                      outline: 'none',
                      transition: 'border-color 200ms, box-shadow 200ms',
                      boxShadow: theme.shadow,
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = theme.textMuted
                      e.currentTarget.style.boxShadow = `0 0 0 3px ${darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = theme.border
                      e.currentTarget.style.boxShadow = theme.shadow
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim() || isStreaming}
                    style={{
                      position: 'absolute',
                      right: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: chatInput.trim() && !isStreaming
                        ? theme.text
                        : theme.textMuted,
                      cursor: chatInput.trim() && !isStreaming ? 'pointer' : 'not-allowed',
                      padding: 6,
                      display: 'flex',
                      alignItems: 'center',
                      borderRadius: 6,
                      transition: 'color 200ms, opacity 200ms',
                      opacity: chatInput.trim() && !isStreaming ? 1 : 0.4,
                    }}
                  >
                    <Send size={18} />
                  </button>
                </form>
              </div>
            ) : (
              /* ─── CHAT STATE: messages + bottom input ─── */
              <>
                {/* Messages */}
                <div
                  className="messages"
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '24px 16px 24px',
                  }}
                >
                  <div
                    style={{
                      maxWidth: 680,
                      margin: '0 auto',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                    }}
                  >
                    {currentChatMessages.map((message, idx) => (
                      <div
                        key={idx}
                        className="fade-in"
                        style={{
                          display: 'flex',
                          justifyContent:
                            message.role === 'user' ? 'flex-end' : 'flex-start',
                          marginBottom: message.role === 'user' ? 4 : 12,
                        }}
                      >
                        <div
                          style={{
                            maxWidth: '80%',
                            padding:
                              message.role === 'user'
                                ? '10px 14px'
                                : '10px 2px',
                            borderRadius:
                              message.role === 'user' ? '12px 12px 4px 12px' : 0,
                            background:
                              message.role === 'user'
                                ? theme.userBubble
                                : 'transparent',
                            color:
                              message.role === 'user'
                                ? theme.text
                                : theme.text,
                            fontSize: 14,
                            lineHeight: 1.65,
                            letterSpacing: '-0.1px',
                          }}
                        >
                          {message.role === 'user' ? (
                            <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                              {message.content}
                            </p>
                          ) : (
                            <ReactMarkdown
                              components={{
                                p: ({ children }) => (
                                  <p
                                    style={{
                                      marginBottom: 10,
                                      marginTop: 0,
                                      lineHeight: 1.7,
                                    }}
                                  >
                                    {children}
                                  </p>
                                ),
                                ul: ({ children }) => (
                                  <ul
                                    style={{
                                      marginBottom: 10,
                                      paddingLeft: 20,
                                      listStyleType: 'disc',
                                    }}
                                  >
                                    {children}
                                  </ul>
                                ),
                                ol: ({ children }) => (
                                  <ol
                                    style={{
                                      marginBottom: 10,
                                      paddingLeft: 20,
                                      listStyleType: 'decimal',
                                    }}
                                  >
                                    {children}
                                  </ol>
                                ),
                                code: ({ children }) => (
                                  <code
                                    style={{
                                      background: darkMode
                                        ? 'rgba(255,255,255,0.08)'
                                        : 'rgba(0,0,0,0.06)',
                                      padding: '2px 5px',
                                      borderRadius: 4,
                                      fontSize: 13,
                                    }}
                                  >
                                    {children}
                                  </code>
                                ),
                                pre: ({ children }) => (
                                  <pre
                                    style={{
                                      marginBottom: 10,
                                      overflowX: 'auto',
                                      borderRadius: 8,
                                      background: darkMode
                                        ? 'rgba(255,255,255,0.05)'
                                        : 'rgba(0,0,0,0.04)',
                                      padding: 14,
                                      fontSize: 13,
                                    }}
                                  >
                                    {children}
                                  </pre>
                                ),
                              }}
                              remarkPlugins={[remarkGfm]}
                            >
                              {message.content}
                            </ReactMarkdown>
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Bottom input */}
                <div
                  style={{
                    borderTop: `1px solid ${theme.border}`,
                    padding: '12px 16px',
                    background: theme.surface,
                    flexShrink: 0,
                  }}
                >
                  <form
                    onSubmit={handleSubmitMessage}
                    style={{
                      maxWidth: 680,
                      margin: '0 auto',
                      position: 'relative',
                    }}
                  >
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      disabled={isStreaming}
                      placeholder="Type a message..."
                      style={{
                        width: '100%',
                        padding: '12px 48px 12px 16px',
                        background: theme.inputBg,
                        border: `1px solid ${theme.border}`,
                        borderRadius: 10,
                        fontSize: 14,
                        color: theme.text,
                        outline: 'none',
                        transition: 'border-color 200ms',
                      }}
                      onFocus={(e) =>
                        (e.currentTarget.style.borderColor = theme.textMuted)
                      }
                      onBlur={(e) =>
                        (e.currentTarget.style.borderColor = theme.border)
                      }
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim() || isStreaming}
                      style={{
                        position: 'absolute',
                        right: 6,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: chatInput.trim() && !isStreaming
                          ? theme.text
                          : theme.textMuted,
                        cursor: chatInput.trim() && !isStreaming ? 'pointer' : 'not-allowed',
                        padding: 6,
                        display: 'flex',
                        alignItems: 'center',
                        borderRadius: 6,
                        transition: 'color 200ms, opacity 200ms',
                        opacity: chatInput.trim() && !isStreaming ? 1 : 0.4,
                      }}
                    >
                      <Send size={16} />
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default Dashboard
