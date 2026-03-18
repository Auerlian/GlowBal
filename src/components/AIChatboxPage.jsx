import React, { useMemo, useState } from 'react';
import { Bot, Upload, Sparkles, Download, Send, FileText } from 'lucide-react';
import * as mammoth from 'mammoth';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

GlobalWorkerOptions.workerSrc = pdfWorker;

const initialMessages = [
  {
    role: 'assistant',
    content: 'Hi — upload your SOP and I can suggest edits. I can also answer questions about admissions, scholarships, timelines and prep resources.'
  }
];

const buildSuggestions = (text) => {
  const suggestions = [];
  if (!text || text.trim().length < 200) {
    suggestions.push('Expand your SOP to include a stronger personal motivation story and concrete achievements.');
  }
  if (!/project|built|led|created|internship/i.test(text)) {
    suggestions.push('Add 1–2 project examples with measurable outcomes to prove readiness.');
  }
  if (!/because|therefore|goal|future/i.test(text)) {
    suggestions.push('Strengthen the career-goal section: what role you want in 3–5 years, and why this programme is the bridge.');
  }
  if (!/university|programme|course|faculty/i.test(text)) {
    suggestions.push('Include university-specific references (modules, faculty, labs, societies) to show fit.');
  }
  return suggestions.slice(0, 4);
};

const buildRewrite = (text) => {
  if (!text) return '';
  return text
    .replace(/\s+/g, ' ')
    .replace(/ i /g, ' I ')
    .replace(/\.\s+/g, '.\n\n')
    .trim();
};

const parsePdfText = async (file) => {
  const buffer = await file.arrayBuffer();
  const loadingTask = getDocument({ data: buffer });
  const pdf = await loadingTask.promise;
  const pages = [];

  for (let i = 1; i <= pdf.numPages; i += 1) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items.map((item) => item.str).join(' ');
    pages.push(text);
  }

  return pages.join('\n\n');
};

const parseDocxText = async (file) => {
  const buffer = await file.arrayBuffer();
  const { value } = await mammoth.extractRawText({ arrayBuffer: buffer });
  return value;
};

const AIChatboxPage = () => {
  const [messages, setMessages] = useState(initialMessages);
  const [chatInput, setChatInput] = useState('');
  const [documentText, setDocumentText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isParsing, setIsParsing] = useState(false);
  const [parseStatus, setParseStatus] = useState('');

  const rewrittenText = useMemo(() => buildRewrite(documentText), [documentText]);

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    setParseStatus('Parsing document...');

    try {
      let parsed = '';
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        parsed = await parsePdfText(file);
      } else if (file.name.toLowerCase().endsWith('.docx')) {
        parsed = await parseDocxText(file);
      } else {
        parsed = await file.text();
      }

      setDocumentText(parsed);
      setSuggestions(buildSuggestions(parsed));
      setParseStatus(`Loaded: ${file.name}`);
    } catch (error) {
      console.error(error);
      setParseStatus('Could not parse this file. Try PDF, DOCX or plain text.');
    } finally {
      setIsParsing(false);
    }
  };

  const sendMessage = () => {
    const trimmed = chatInput.trim();
    if (!trimmed) return;

    const next = [...messages, { role: 'user', content: trimmed }];
    const knowledgeHint = documentText ? 'Based on your SOP, tighten clarity, add metrics, and anchor to specific universities.' : 'Upload an SOP and I can give line-by-line feedback.';

    next.push({
      role: 'assistant',
      content: `Got it. ${knowledgeHint} For your question: "${trimmed}", I recommend building a 12-week plan: shortlist, SOP final draft, references, scholarship applications, and interview prep.`
    });

    setMessages(next);
    setChatInput('');
  };

  const downloadEditedText = () => {
    const blob = new Blob([rewrittenText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'updated-sop.txt';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="glass-panel ai-wrap animate-fade-in">
      <header className="ai-head">
        <h1><span className="text-gradient">AI SOP Studio</span></h1>
        <p>Upload PDF/DOCX, edit in-place, get AI suggestions, and chat for admissions strategy.</p>
      </header>

      <div className="ai-actions">
        <label className="btn-secondary" htmlFor="sop-upload">
          <Upload size={15} /> Upload SOP
        </label>
        <input id="sop-upload" type="file" accept=".pdf,.doc,.docx,.txt,.md" onChange={handleFileUpload} style={{ display: 'none' }} />
        <button className="btn-primary" onClick={downloadEditedText} disabled={!rewrittenText}>
          <Download size={15} /> Download updated file
        </button>
        <span className="ai-status">{isParsing ? 'Working…' : parseStatus}</span>
      </div>

      <div className="ai-layout">
        <article className="ai-editor glass-panel">
          <h2><FileText size={16} /> Editable SOP draft</h2>
          <textarea
            value={documentText}
            onChange={(e) => {
              setDocumentText(e.target.value);
              setSuggestions(buildSuggestions(e.target.value));
            }}
            placeholder="Upload a statement of purpose or paste your text here..."
          />
        </article>

        <aside className="ai-suggestions glass-panel">
          <h2><Sparkles size={16} /> AI suggestions</h2>
          {suggestions.length ? (
            <ul>
              {suggestions.map((suggestion) => (
                <li key={suggestion}>{suggestion}</li>
              ))}
            </ul>
          ) : (
            <p>Add your SOP to unlock targeted rewrite suggestions.</p>
          )}
        </aside>
      </div>

      <section className="ai-chat glass-panel">
        <h2><Bot size={16} /> Admissions assistant chat</h2>
        <div className="ai-chat-log">
          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={`ai-bubble ${message.role === 'assistant' ? 'is-assistant' : 'is-user'}`}>
              {message.content}
            </div>
          ))}
        </div>
        <div className="ai-chat-input">
          <input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ask about applications, essays, scholarships, interviews..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') sendMessage();
            }}
          />
          <button className="btn-primary" onClick={sendMessage}><Send size={15} /> Send</button>
        </div>
      </section>
    </section>
  );
};

export default AIChatboxPage;
