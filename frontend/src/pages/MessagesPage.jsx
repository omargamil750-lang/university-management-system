import { useEffect, useState, useRef, useCallback } from "react";
import {
  getMyThreadsApi,
  getThreadMessagesApi,
  createThreadApi,
  sendMessageApi,
  deleteThreadApi,
  getUsersForMessageApi,
} from "../api/messageApi";
import { useAuth } from "../context/AuthContext";

export default function MessagesPage() {
  const { token, user } = useAuth();

  // State
  const [threads, setThreads] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [showNewForm, setShowNewForm] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [subject, setSubject] = useState("");
  const [firstMessage, setFirstMessage] = useState("");
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState({ text: "", ok: true });

  const msgEndRef = useRef(null);
  const pollRef = useRef(null);
  const inputRef = useRef(null);

  const notify = (text, ok = true) => {
    setToast({ text, ok });
    setTimeout(() => setToast({ text: "", ok: true }), 5000);
  };

  // ── Load all threads ──────────────────────────────────
  const loadThreads = useCallback(async () => {
    try {
      const data = await getMyThreadsApi(token);
      setThreads(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("loadThreads:", err);
      notify("Failed to load conversations. Check backend connection.", false);
    } finally {
      setLoadingThreads(false);
    }
  }, [token]);

  // ── Load messages for active thread ──────────────────
  const loadMessages = useCallback(async (threadId) => {
    if (!threadId) return;
    try {
      const data = await getThreadMessagesApi(threadId, token);
      const msgs = data?.messages;
      if (Array.isArray(msgs)) {
        setMessages(msgs);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error("loadMessages:", err);
      notify("Failed to load messages.", false);
      setMessages([]);
    }
  }, [token]);

  // ── Load users for new conversation ──────────────────
  const loadUsers = useCallback(async (search = "") => {
    try {
      const data = await getUsersForMessageApi(token, search);
      const users = Array.isArray(data) ? data : [];
      if (search) {
        setFilteredUsers(users);
      } else {
        setAllUsers(users);
        setFilteredUsers(users);
      }
    } catch (err) {
      console.error("loadUsers:", err);
    }
  }, [token]);

  // ── Initial load ──────────────────────────────────────
  useEffect(() => {
    loadThreads();
    loadUsers();
  }, [loadThreads, loadUsers]);

  // ── Auto-scroll ───────────────────────────────────────
  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Polling (every 4 seconds when thread open) ────────
  useEffect(() => {
    clearInterval(pollRef.current);
    if (activeThread?._id) {
      pollRef.current = setInterval(() => {
        loadMessages(activeThread._id);
        loadThreads();
      }, 4000);
    }
    return () => clearInterval(pollRef.current);
  }, [activeThread, loadMessages, loadThreads]);

  // ── User search debounce ──────────────────────────────
  useEffect(() => {
    if (!showNewForm) return;
    const t = setTimeout(() => {
      loadUsers(userSearch);
    }, 300);
    return () => clearTimeout(t);
  }, [userSearch, showNewForm, loadUsers]);

  // ── Select a thread ───────────────────────────────────
  const handleSelectThread = async (thread) => {
    setActiveThread(thread);
    setMessages([]);
    setLoadingMessages(true);
    try {
      const data = await getThreadMessagesApi(thread._id, token);
      setMessages(Array.isArray(data?.messages) ? data.messages : []);
    } catch (err) {
      console.error("handleSelectThread:", err);
      notify("Failed to load messages", false);
    } finally {
      setLoadingMessages(false);
    }
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // ── Send a message ────────────────────────────────────
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !activeThread?._id || sending) return;

    const content = newMsg.trim();
    setSending(true);
    setNewMsg("");

    // Optimistic update
    const tempMsg = {
      _id: "temp_" + Date.now(),
      content,
      sender: { _id: user?._id, name: user?.name, role: user?.role },
      createdAt: new Date().toISOString(),
      readBy: [user?._id],
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      const res = await sendMessageApi(activeThread._id, content, token);
      // Replace temp message with real one
      setMessages((prev) =>
        prev.map((m) => (m._id === tempMsg._id ? res.msg : m))
      );
      loadThreads();
    } catch (err) {
      console.error("handleSend:", err);
      notify(err.response?.data?.message || "Failed to send message", false);
      // Remove temp message on failure
      setMessages((prev) => prev.filter((m) => m._id !== tempMsg._id));
      setNewMsg(content); // restore input
    } finally {
      setSending(false);
    }
  };

  // ── Enter key handler ─────────────────────────────────
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  // ── Create new thread ─────────────────────────────────
  const handleCreateThread = async () => {
    if (!selectedRecipient) {
      notify("Please select a recipient", false);
      return;
    }
    if (!firstMessage.trim()) {
      notify("Please write a message", false);
      return;
    }
    setCreating(true);
    try {
      const res = await createThreadApi(
        {
          recipientId: selectedRecipient._id,
          subject: subject.trim() || `Chat with ${selectedRecipient.name}`,
          firstMessage: firstMessage.trim(),
        },
        token
      );

      notify("Conversation started!");
      setShowNewForm(false);
      setSelectedRecipient(null);
      setSubject("");
      setFirstMessage("");
      setUserSearch("");
      setFilteredUsers(allUsers);

      await loadThreads();

      // Auto-open the new thread
      if (res?.thread) {
        handleSelectThread(res.thread);
      }
    } catch (err) {
      console.error("handleCreateThread:", err);
      notify(err.response?.data?.message || "Failed to create conversation", false);
    } finally {
      setCreating(false);
    }
  };

  // ── Delete thread ─────────────────────────────────────
  const handleDeleteThread = async (threadId) => {
    if (!window.confirm("Delete this conversation permanently?")) return;
    try {
      await deleteThreadApi(threadId, token);
      setActiveThread(null);
      setMessages([]);
      notify("Conversation deleted");
      loadThreads();
    } catch {
      notify("Failed to delete", false);
    }
  };

  // ── Helpers ───────────────────────────────────────────
  const getOther = (thread) =>
    thread.participants?.find((p) => String(p._id) !== String(user?._id));

  const formatTime = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return d.toLocaleDateString();
  };

  const showDateDivider = (msgs, index) => {
    if (index === 0) return true;
    const cur = new Date(msgs[index].createdAt).toDateString();
    const prev = new Date(msgs[index - 1].createdAt).toDateString();
    return cur !== prev;
  };

  const ROLE_COLOR = {
    admin: "#dc2626",
    professor: "#2563eb",
    student: "#16a34a",
    ta: "#9333ea",
  };

  const getRoleColor = (role) => ROLE_COLOR[role] || "#6b7280";

  return (
    <div style={S.page}>
      {toast.text && (
        <div style={{
          ...S.globalToast,
          background: toast.ok ? "#dcfce7" : "#fee2e2",
          color: toast.ok ? "#166534" : "#dc2626",
        }}>
          {toast.ok ? "✓" : "✕"} {toast.text}
        </div>
      )}

      <div style={S.layout}>

        {/* ══════════ SIDEBAR ══════════ */}
        <div style={S.sidebar}>

          {/* Header */}
          <div style={S.sidebarHeader}>
            <h2 style={S.sidebarTitle}>Messages</h2>
            <button
              onClick={() => {
                setShowNewForm(!showNewForm);
                if (!showNewForm) {
                  setUserSearch("");
                  setFilteredUsers(allUsers);
                  setSelectedRecipient(null);
                  setSubject("");
                  setFirstMessage("");
                }
              }}
              style={S.newBtn}
              title="New conversation"
            >
              {showNewForm ? "✕" : "✏️"}
            </button>
          </div>

          {/* New conversation form */}
          {showNewForm && (
            <div style={S.newForm}>
              <p style={S.newFormTitle}>New Conversation</p>

              {/* Recipient search */}
              <div style={{ position: "relative" }}>
                <input
                  value={userSearch}
                  onChange={(e) => {
                    setUserSearch(e.target.value);
                    if (!e.target.value) setSelectedRecipient(null);
                  }}
                  placeholder="🔍 Search people..."
                  style={S.sInput}
                  autoFocus
                />
                {selectedRecipient && (
                  <div style={S.selectedRecipient}>
                    <div style={{ ...S.roleAvatar, background: getRoleColor(selectedRecipient.role) + "20", color: getRoleColor(selectedRecipient.role) }}>
                      {selectedRecipient.name[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 13 }}>{selectedRecipient.name}</p>
                      <p style={{ margin: 0, fontSize: 11, color: getRoleColor(selectedRecipient.role), fontWeight: 600, textTransform: "capitalize" }}>{selectedRecipient.role}</p>
                    </div>
                    <button onClick={() => { setSelectedRecipient(null); setUserSearch(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", fontSize: 16 }}>✕</button>
                  </div>
                )}

                {/* User dropdown */}
                {!selectedRecipient && filteredUsers.length > 0 && (
                  <div style={S.userDropdown}>
                    {filteredUsers.map((u) => (
                      <div
                        key={u._id}
                        onClick={() => {
                          setSelectedRecipient(u);
                          setUserSearch(u.name);
                          setFilteredUsers([]);
                        }}
                        style={S.userDropdownItem}
                      >
                        <div style={{ ...S.roleAvatar, background: getRoleColor(u.role) + "20", color: getRoleColor(u.role) }}>
                          {u.name[0].toUpperCase()}
                        </div>
                        <div>
                          <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>{u.name}</p>
                          <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>{u.email} · <span style={{ color: getRoleColor(u.role), fontWeight: 600 }}>{u.role}</span></p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {!selectedRecipient && userSearch && filteredUsers.length === 0 && (
                  <div style={{ ...S.userDropdown, padding: "12px", textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
                    No users found
                  </div>
                )}
              </div>

              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject (optional)"
                style={S.sInput}
              />

              <textarea
                value={firstMessage}
                onChange={(e) => setFirstMessage(e.target.value)}
                placeholder="Write your message..."
                style={{ ...S.sInput, minHeight: 80, resize: "vertical" }}
              />

              <button
                onClick={handleCreateThread}
                disabled={creating || !selectedRecipient || !firstMessage.trim()}
                style={{
                  ...S.sendBtn,
                  opacity: creating || !selectedRecipient || !firstMessage.trim() ? 0.5 : 1,
                  cursor: creating || !selectedRecipient || !firstMessage.trim() ? "not-allowed" : "pointer",
                }}
              >
                {creating ? "Sending..." : "Send Message"}
              </button>
            </div>
          )}

          {/* Thread list */}
          <div style={S.threadList}>
            {loadingThreads ? (
              <div style={S.centerMsg}>
                <div style={S.spinner} />
                <p style={{ color: "#9ca3af", fontSize: 13, marginTop: 8 }}>Loading...</p>
              </div>
            ) : threads.length === 0 ? (
              <div style={S.centerMsg}>
                <span style={{ fontSize: 36 }}>💬</span>
                <p style={{ color: "#9ca3af", fontSize: 13, margin: "8px 0 0" }}>No conversations yet</p>
              </div>
            ) : (
              threads.map((t) => {
                const other = getOther(t);
                const isActive = activeThread?._id === t._id;
                return (
                  <div
                    key={t._id}
                    onClick={() => handleSelectThread(t)}
                    style={{
                      ...S.threadItem,
                      background: isActive ? "#1e3a5f" : "transparent",
                      borderLeft: isActive ? "3px solid #3b82f6" : "3px solid transparent",
                    }}
                  >
                    <div style={{
                      ...S.threadAvatar,
                      background: getRoleColor(other?.role) + "25",
                      color: getRoleColor(other?.role),
                    }}>
                      {other?.name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: isActive ? "white" : "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {other?.name || "Unknown User"}
                        </p>
                        <span style={{ fontSize: 10, color: isActive ? "#93c5fd" : "#9ca3af", whiteSpace: "nowrap", marginLeft: 4 }}>
                          {formatTime(t.lastMessage)}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: 12, color: isActive ? "#93c5fd" : "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {t.subject}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ══════════ CHAT AREA ══════════ */}
        <div style={S.chatArea}>
          {!activeThread ? (
            /* Empty state */
            <div style={S.emptyState}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>💬</div>
              <h3 style={{ margin: "0 0 8px", color: "#374151", fontSize: 18 }}>Your Messages</h3>
              <p style={{ color: "#9ca3af", fontSize: 14, margin: "0 0 20px" }}>
                Select a conversation from the left, or start a new one
              </p>
              <button
                onClick={() => setShowNewForm(true)}
                style={{ ...S.sendBtn, fontSize: 14, padding: "12px 24px" }}
              >
                ✏️ Start New Conversation
              </button>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div style={S.chatHeader}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    ...S.threadAvatar,
                    width: 44,
                    height: 44,
                    fontSize: 17,
                    background: getRoleColor(getOther(activeThread)?.role) + "25",
                    color: getRoleColor(getOther(activeThread)?.role),
                  }}>
                    {getOther(activeThread)?.name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 800, fontSize: 15, color: "#111827" }}>
                      {getOther(activeThread)?.name || "Unknown"}
                    </p>
                    <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>
                      <span style={{ color: getRoleColor(getOther(activeThread)?.role), fontWeight: 600, textTransform: "capitalize" }}>
                        {getOther(activeThread)?.role}
                      </span>
                      {activeThread.subject && activeThread.subject !== "No Subject" && ` · ${activeThread.subject}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteThread(activeThread._id)}
                  style={S.deleteThreadBtn}
                  title="Delete conversation"
                >
                  🗑️
                </button>
              </div>

              {/* Messages */}
              <div style={S.msgArea}>
                {loadingMessages && (
                  <div style={{ textAlign: "center", padding: 30 }}>
                    <div style={S.spinner} />
                    <p style={{ color: "#9ca3af", fontSize: 13, marginTop: 8 }}>Loading messages...</p>
                  </div>
                )}

                {!loadingMessages && messages.length === 0 && (
                  <div style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>
                    <p style={{ fontSize: 32, margin: 0 }}>👋</p>
                    <p style={{ fontSize: 14, marginTop: 8 }}>No messages yet. Say hello!</p>
                  </div>
                )}

                {messages.map((m, i) => {
                  const isMe = String(m.sender?._id) === String(user?._id);
                  const showDate = showDateDivider(messages, i);

                  return (
                    <div key={m._id}>
                      {showDate && (
                        <div style={S.dateDivider}>
                          <span style={S.dateBadge}>
                            {new Date(m.createdAt).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
                          </span>
                        </div>
                      )}

                      <div style={{
                        display: "flex",
                        justifyContent: isMe ? "flex-end" : "flex-start",
                        alignItems: "flex-end",
                        gap: 8,
                        marginBottom: 6,
                      }}>
                        {/* Other person avatar */}
                        {!isMe && (
                          <div style={{
                            ...S.msgAvatar,
                            background: getRoleColor(m.sender?.role) + "25",
                            color: getRoleColor(m.sender?.role),
                          }}>
                            {m.sender?.name?.[0]?.toUpperCase() || "?"}
                          </div>
                        )}

                        <div style={{ maxWidth: "65%", display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start" }}>
                          {/* Sender name (for group chats / first message) */}
                          {!isMe && i > 0 && String(messages[i - 1].sender?._id) !== String(m.sender?._id) && (
                            <p style={{ margin: "0 0 3px 2px", fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>
                              {m.sender?.name}
                            </p>
                          )}
                          {!isMe && i === 0 && (
                            <p style={{ margin: "0 0 3px 2px", fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>
                              {m.sender?.name}
                            </p>
                          )}

                          {/* Bubble */}
                          <div style={{
                            ...S.bubble,
                            background: isMe ? "#2563eb" : "#f3f4f6",
                            color: isMe ? "white" : "#111827",
                            borderRadius: isMe
                              ? "18px 18px 4px 18px"
                              : "18px 18px 18px 4px",
                            opacity: m._id?.startsWith("temp_") ? 0.7 : 1,
                          }}>
                            {m.content}
                          </div>

                          {/* Timestamp */}
                          <p style={{ margin: "3px 2px 0", fontSize: 10, color: "#9ca3af" }}>
                            {formatTime(m.createdAt)}
                            {m._id?.startsWith("temp_") && " · Sending..."}
                          </p>
                        </div>

                        {/* My avatar */}
                        {isMe && (
                          <div style={{
                            ...S.msgAvatar,
                            background: "#dbeafe",
                            color: "#1d4ed8",
                          }}>
                            {user?.name?.[0]?.toUpperCase() || "?"}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={msgEndRef} />
              </div>

              {/* Input bar */}
              <form onSubmit={handleSend} style={S.inputBar}>
                <textarea
                  ref={inputRef}
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
                  style={S.msgInput}
                  rows={1}
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={sending || !newMsg.trim()}
                  style={{
                    ...S.sendBtn,
                    padding: "10px 20px",
                    opacity: sending || !newMsg.trim() ? 0.5 : 1,
                    cursor: sending || !newMsg.trim() ? "not-allowed" : "pointer",
                  }}
                >
                  {sending ? "⏳" : "Send →"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Styles ─────────────────────────────────────────── */
const S = {
  page: {
    padding: "20px 32px",
    background: "#f1f5f9",
    minHeight: "100vh",
    boxSizing: "border-box",
  },
  globalToast: {
    position: "fixed",
    top: 70,
    right: 20,
    zIndex: 9999,
    padding: "10px 18px",
    borderRadius: 10,
    fontWeight: 700,
    fontSize: 13,
    boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
    maxWidth: 320,
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "310px 1fr",
    height: "calc(100vh - 100px)",
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: 18,
    overflow: "hidden",
    boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
  },

  /* Sidebar */
  sidebar: {
    display: "flex",
    flexDirection: "column",
    background: "#f8fafc",
    borderRight: "1px solid #e2e8f0",
  },
  sidebarHeader: {
    padding: "16px 14px",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sidebarTitle: {
    margin: 0,
    fontSize: 16,
    fontWeight: 800,
    color: "#0f172a",
  },
  newBtn: {
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: 8,
    width: 32,
    height: 32,
    fontSize: 15,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  newForm: {
    padding: "12px 14px",
    borderBottom: "1px solid #e2e8f0",
    background: "#f0f7ff",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  newFormTitle: {
    margin: 0,
    fontWeight: 700,
    fontSize: 12,
    color: "#374151",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  sInput: {
    width: "100%",
    padding: "8px 10px",
    border: "1px solid #d1d5db",
    borderRadius: 8,
    fontFamily: "inherit",
    fontSize: 13,
    boxSizing: "border-box",
    outline: "none",
    background: "white",
  },
  selectedRecipient: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    padding: "8px 10px",
    background: "#dbeafe",
    borderRadius: 8,
    border: "1px solid #93c5fd",
  },
  userDropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
    zIndex: 100,
    maxHeight: 220,
    overflowY: "auto",
  },
  userDropdownItem: {
    display: "flex",
    gap: 10,
    padding: "10px 12px",
    cursor: "pointer",
    alignItems: "center",
    borderBottom: "1px solid #f9fafb",
    transition: "background 0.1s",
  },
  roleAvatar: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 13,
    flexShrink: 0,
  },
  sendBtn: {
    padding: "9px 16px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 13,
    whiteSpace: "nowrap",
  },
  threadList: {
    flex: 1,
    overflowY: "auto",
    padding: "4px 0",
  },
  threadItem: {
    display: "flex",
    gap: 10,
    padding: "12px 14px",
    cursor: "pointer",
    alignItems: "center",
    transition: "background 0.15s",
    borderBottom: "1px solid #f1f5f9",
  },
  threadAvatar: {
    width: 38,
    height: 38,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 15,
    flexShrink: 0,
  },
  centerMsg: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "32px 16px",
  },
  spinner: {
    width: 24,
    height: 24,
    border: "3px solid #e5e7eb",
    borderTop: "3px solid #2563eb",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },

  /* Chat area */
  chatArea: {
    display: "flex",
    flexDirection: "column",
    background: "white",
  },
  emptyState: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  chatHeader: {
    padding: "14px 20px",
    borderBottom: "1px solid #f1f5f9",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "white",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  deleteThreadBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 18,
    color: "#9ca3af",
    padding: "4px 8px",
    borderRadius: 6,
    transition: "color 0.15s",
  },
  msgArea: {
    flex: 1,
    overflowY: "auto",
    padding: "20px 24px",
    display: "flex",
    flexDirection: "column",
    background: "#fafafa",
  },
  msgAvatar: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 700,
    flexShrink: 0,
  },
  bubble: {
    padding: "10px 14px",
    fontSize: 14,
    lineHeight: 1.55,
    wordBreak: "break-word",
    boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
  },
  dateDivider: {
    textAlign: "center",
    margin: "14px 0 10px",
  },
  dateBadge: {
    background: "#f1f5f9",
    color: "#94a3b8",
    fontSize: 11,
    padding: "4px 12px",
    borderRadius: 20,
    fontWeight: 600,
  },
  inputBar: {
    padding: "12px 16px",
    borderTop: "1px solid #e2e8f0",
    display: "flex",
    gap: 10,
    alignItems: "flex-end",
    background: "white",
  },
  msgInput: {
    flex: 1,
    padding: "10px 14px",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    fontFamily: "inherit",
    fontSize: 14,
    outline: "none",
    resize: "none",
    maxHeight: 120,
    overflowY: "auto",
    lineHeight: 1.5,
    background: "#f8fafc",
  },
};