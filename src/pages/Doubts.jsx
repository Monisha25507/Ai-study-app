import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { askDoubt } from '../api/gemini';
import {
  addDoubtConversation,
  getDoubtConversations,
  updateDoubtConversation,
  deleteDoubtConversation,
} from '../firebase/firestore';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import toast from 'react-hot-toast';
import { Send, Plus, Trash2, Sparkles, MessageCircle } from 'lucide-react';

const TypingIndicator = () => (
  <div className="message ai-message">
    <div className="ai-avatar"><Sparkles size={14} /></div>
    <div className="typing-indicator">
      <span /><span /><span />
    </div>
  </div>
);

const Doubts = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const loadConversations = async () => {
    try {
      const data = await getDoubtConversations(user.uid);
      setConversations(data);
    } finally {
      setLoadingHistory(false);
    }
  };

  const startNewChat = () => {
    setActiveId(null);
    setMessages([]);
  };

  const loadConversation = (conv) => {
    setActiveId(conv.id);
    setMessages(conv.messages || []);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setTyping(true);
    setLoading(true);

    try {
      const reply = await askDoubt(newMessages);
      const aiMsg = { role: 'assistant', content: reply };
      const finalMessages = [...newMessages, aiMsg];
      setMessages(finalMessages);

      // Save to Firestore
      const title = userMsg.content.slice(0, 50);
      if (activeId) {
        await updateDoubtConversation(user.uid, activeId, { messages: finalMessages, title });
        setConversations((prev) =>
          prev.map((c) => (c.id === activeId ? { ...c, messages: finalMessages, title } : c))
        );
      } else {
        const ref = await addDoubtConversation(user.uid, { title, messages: finalMessages });
        const newConv = { id: ref.id, title, messages: finalMessages };
        setActiveId(ref.id);
        setConversations((prev) => [newConv, ...prev]);
      }
    } catch (err) {
      toast.error('Failed to get AI response');
    } finally {
      setTyping(false);
      setLoading(false);
    }
  };

  const deleteConv = async (id, e) => {
    e.stopPropagation();
    await deleteDoubtConversation(user.uid, id);
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeId === id) startNewChat();
    toast.success('Conversation deleted');
  };

  return (
    <div className="doubts-layout">
      {/* Sidebar */}
      <div className="chat-sidebar">
        <button className="btn btn-primary new-chat-btn" onClick={startNewChat}>
          <Plus size={16} /> New Chat
        </button>
        <div className="chat-history">
          {loadingHistory ? (
            Array(4).fill(0).map((_, i) => <div key={i} className="chat-history-item skeleton"><div className="skeleton-line" /></div>)
          ) : conversations.length === 0 ? (
            <div className="empty-history">
              <MessageCircle size={32} />
              <p>No conversations yet</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={`chat-history-item ${activeId === conv.id ? 'active' : ''}`}
                onClick={() => loadConversation(conv)}
              >
                <span className="chat-history-title">{conv.title || 'Untitled'}</span>
                <button className="delete-chat-btn" onClick={(e) => deleteConv(conv.id, e)}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="chat-main">
        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="chat-welcome">
              <div className="chat-welcome-icon"><Sparkles size={40} /></div>
              <h3>Ask me anything!</h3>
              <p>I'm your AI study assistant. Ask doubts, get explanations, or explore any topic.</p>
              <div className="suggestion-chips">
                {['Explain photosynthesis', 'What is recursion?', 'Summarize Newton\'s laws'].map((s) => (
                  <button key={s} className="suggestion-chip" onClick={() => setInput(s)}>{s}</button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`message ${msg.role === 'user' ? 'user-message' : 'ai-message'}`}>
              {msg.role === 'assistant' && (
                <div className="ai-avatar"><Sparkles size={14} /></div>
              )}
              <div className={`message-bubble ${msg.role === 'user' ? 'user-bubble' : 'ai-bubble'}`}>
                {msg.role === 'assistant' ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                ) : (
                  <p>{msg.content}</p>
                )}
              </div>
            </div>
          ))}

          {typing && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="chat-input-area">
          <div className="chat-input-box">
            <textarea
              className="chat-input"
              placeholder="Ask your doubt..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              rows={1}
            />
            <button className="send-btn" onClick={sendMessage} disabled={loading || !input.trim()}>
              <Send size={18} />
            </button>
          </div>
          <p className="chat-hint">Press Enter to send, Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  );
};

export default Doubts;
