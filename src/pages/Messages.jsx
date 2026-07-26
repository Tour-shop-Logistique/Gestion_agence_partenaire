import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Send, Paperclip, X, FileText, Loader2, MessageSquare } from "lucide-react";
import {
  fetchConversation,
  sendMessage,
  selectMessages,
  selectMessagesStatus,
} from "../store/slices/messagesSlice";
import { showToast } from "../utils/toast";

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
};

const Messages = () => {
  const dispatch = useDispatch();
  const messages = useSelector(selectMessages);
  const status = useSelector(selectMessagesStatus);
  const isSending = useSelector((state) => state.messages.isSending);

  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    dispatch(fetchConversation());
  }, [dispatch]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    setAttachments((prev) => [...prev, ...files].slice(0, 5));
    e.target.value = "";
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if ((!body.trim() && attachments.length === 0) || isSending) return;
    try {
      await dispatch(sendMessage({ body: body.trim(), attachments })).unwrap();
      setBody("");
      setAttachments([]);
    } catch (err) {
      showToast(err || "Erreur lors de l'envoi du message", "error");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-[1000px] mx-auto px-3 sm:px-6 pb-6 sm:pb-10">
      <div>
        <h1 className="text-lg sm:text-2xl font-semibold text-gray-900">Messages</h1>
        <p className="mt-1 text-xs sm:text-sm text-gray-500">Échange direct avec le backoffice</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-200/60 overflow-hidden flex flex-col" style={{ height: "calc(100vh - 240px)", minHeight: 420 }}>
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3">
          {status === "loading" && messages.length === 0 ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-slate-400" size={28} />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <MessageSquare size={44} strokeWidth={1.5} className="mb-3" />
              <p className="text-sm font-medium">Aucun message pour l'instant</p>
              <p className="text-xs text-slate-400 mt-1">Écrivez au backoffice pour démarrer la conversation</p>
            </div>
          ) : (
            messages.map((m) => {
              const isMine = m.sender?.type === "agence";
              return (
                <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${isMine ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-900"}`}>
                    {m.body && <p className="text-sm whitespace-pre-wrap break-words">{m.body}</p>}
                    {m.attachments?.length > 0 && (
                      <div className="mt-1.5 space-y-1.5">
                        {m.attachments.map((a) => (
                          <a
                            key={a.id}
                            href={a.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg ${isMine ? "bg-white/10 hover:bg-white/20" : "bg-white hover:bg-slate-50"}`}
                          >
                            <FileText size={14} />
                            <span className="truncate">{a.original_name}</span>
                          </a>
                        ))}
                      </div>
                    )}
                    <p className={`text-[10px] mt-1 ${isMine ? "text-indigo-200" : "text-slate-400"}`}>
                      {format(new Date(m.created_at), "HH:mm", { locale: fr })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {attachments.length > 0 && (
          <div className="px-4 sm:px-6 pt-2 flex flex-wrap gap-2">
            {attachments.map((f, i) => (
              <span key={i} className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-700">
                <FileText size={12} />
                <span className="max-w-[140px] truncate">{f.name}</span>
                <span className="text-slate-400">({formatSize(f.size)})</span>
                <button onClick={() => removeAttachment(i)} className="text-slate-400 hover:text-red-600">
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="px-4 sm:px-6 py-3 border-t border-slate-200 flex items-end gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.xls,.xlsx"
            onChange={handleFilesChange}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
            title="Joindre un fichier"
          >
            <Paperclip size={18} />
          </button>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Écrire un message..."
            rows={1}
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-medium text-slate-900 transition-all resize-none max-h-32"
          />
          <button
            onClick={handleSend}
            disabled={isSending || (!body.trim() && attachments.length === 0)}
            className="p-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Messages;
