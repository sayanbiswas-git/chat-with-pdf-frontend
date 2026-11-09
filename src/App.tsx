import { useState, useRef, useEffect } from 'react';
import './App.css';

interface Message {
  role: 'user' | 'ai';
  content: string;
  sources?: string[];
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call your FastAPI backend
      const response = await fetch('http://127.0.0.1:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: input }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      
      const aiMessage: Message = { 
        role: 'ai', 
        content: data.answer, 
        sources: data.sources 
      };
      
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'ai', content: 'Error: Could not connect to the backend. Is it running?' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>📄 Chat with PDF</h1>
        <p>Ask questions about Tolstoy's "The Death of Ivan Ilyich"</p>
      </header>

      <div className="chat-window">
        {messages.length === 0 && (
          <div className="empty-state">
            <p>👋 Hello! Ask me anything about the document.</p>
          </div>
        )}
        
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            <div className="bubble">
              <p>{msg.content}</p>
              {msg.sources && msg.sources.length > 0 && (
                <details className="sources">
                  <summary>View Sources</summary>
                  {msg.sources.map((src, i) => (
                    <div key={i} className="source-chunk">
                      <p>{src}</p>
                    </div>
                  ))}
                </details>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="message ai">
            <div className="bubble loading">Thinking...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about the book..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}

export default App;