import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Send, Paperclip, X, FileText, Loader2, MessageCircle, Building2 } from "lucide-react";
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
    <div className="space-y-4 sm:space-y-5 max-w-[1000px] mx-auto px-3 sm:px-6 pb-6 sm:pb-10">
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-500 flex items-center justify-center shadow-sm shadow-indigo-200 shrink-0">
          <MessageCircle className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg sm:text-xl font-black tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
            Messages
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">Échange direct avec le backoffice</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col" style={{ height: "calc(100vh - 240px)", minHeight: 420 }}>
        {/* En-tête de la conversation */}
        <div className="px-4 sm:px-5 py-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Backoffice</p>
            <p className="text-[11px] text-slate-400">Équipe Tour Shop Express</p>
          </div>
        </div>

        {/* Fil de discussion */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3 bg-slate-50/60">
          {status === "loading" && messages.length === 0 ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-indigo-500" size={28} />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-3">
                <MessageCircle className="w-7 h-7 text-indigo-300" strokeWidth={1.5} />
              </div>
              <p className="text-sm font-bold text-slate-600">Aucun message pour l'instant</p>
              <p className="text-xs text-slate-400 mt-1">Écrivez au backoffice pour démarrer la conversation</p>
            </div>
          ) : (
            messages.map((m) => {
              const isMine = m.sender?.type === "agence";
              return (
                <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[75%] px-4 py-2.5 shadow-sm ${
                      isMine
                        ? "bg-gradient-to-br from-indigo-600 to-indigo-500 text-white rounded-2xl rounded-br-md"
                        : "bg-white text-slate-900 border border-slate-200 rounded-2xl rounded-bl-md"
                    }`}
                  >
                    {m.body && <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{m.body}</p>}
                    {m.attachments?.length > 0 && (
                      <div className="mt-1.5 space-y-1.5">
                        {m.attachments.map((a) => (
                          <a
                            key={a.id}
                            href={a.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg transition-colors ${
                              isMine ? "bg-white/15 hover:bg-white/25" : "bg-slate-100 hover:bg-slate-200"
                            }`}
                          >
                            <FileText size={14} className="shrink-0" />
                            <span className="truncate">{a.original_name}</span>
                          </a>
                        ))}
                      </div>
                    )}
                    <p className={`text-[10px] mt-1.5 font-medium ${isMine ? "text-indigo-100" : "text-slate-400"}`}>
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
          <div className="px-4 sm:px-6 pt-2.5 bg-white border-t border-slate-100 flex flex-wrap gap-2">
            {attachments.map((f, i) => (
              <span key={i} className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 rounded-lg text-xs font-semibold text-indigo-700">
                <FileText size={12} />
                <span className="max-w-[140px] truncate">{f.name}</span>
                <span className="text-indigo-400 font-medium">({formatSize(f.size)})</span>
                <button onClick={() => removeAttachment(i)} className="text-indigo-400 hover:text-red-600 transition-colors">
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Zone de saisie */}
        <div className="px-4 sm:px-6 py-3 border-t border-slate-100 bg-white flex items-end gap-2">
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
            className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors shrink-0"
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
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 text-sm font-medium text-slate-900 transition-all resize-none max-h-32"
          />
          <button
            onClick={handleSend}
            disabled={isSending || (!body.trim() && attachments.length === 0)}
            className="p-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-600 active:scale-95 transition-all shadow-sm hover:shadow-md hover:shadow-indigo-200 disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed shrink-0"
          >
            {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Messages;
