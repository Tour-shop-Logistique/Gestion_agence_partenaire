import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { format, isToday, isYesterday } from "date-fns";
import { fr } from "date-fns/locale";
import { Send, Paperclip, X, FileText, Loader2, Building2, Search, MoreVertical, Pencil, Trash2, Check, CheckCheck, Phone, Mail } from "lucide-react";
import {
  fetchConversation,
  sendMessage,
  searchMessages,
  updateMessage,
  deleteMessage,
  clearSearch,
  selectMessages,
  selectMessagesStatus,
} from "../store/slices/messagesSlice";
import { showToast } from "../utils/toast";

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
};

const isImage = (mimeType) => mimeType?.startsWith("image/");

const formatDayLabel = (date) => {
  if (isToday(date)) return "Aujourd'hui";
  if (isYesterday(date)) return "Hier";
  return format(date, "EEEE d MMMM", { locale: fr });
};

/** Regroupe les messages consécutifs par jour calendaire */
const groupByDay = (messages) => {
  const groups = [];
  let currentDay = null;
  let currentGroup = null;
  for (const m of messages) {
    const day = format(new Date(m.created_at), "yyyy-MM-dd");
    if (day !== currentDay) {
      currentDay = day;
      currentGroup = { day, date: new Date(m.created_at), items: [] };
      groups.push(currentGroup);
    }
    currentGroup.items.push(m);
  }
  return groups;
};

const Messages = () => {
  const dispatch = useDispatch();
  const messages = useSelector(selectMessages);
  const status = useSelector(selectMessagesStatus);
  const isSending = useSelector((state) => state.messages.isSending);
  const searchResults = useSelector((state) => state.messages.searchResults);
  const isSearching = useSelector((state) => state.messages.isSearching);

  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editBody, setEditBody] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    dispatch(fetchConversation());
  }, [dispatch]);

  const displayedMessages = useMemo(
    () => (searchOpen && searchResults ? searchResults : messages),
    [searchOpen, searchResults, messages]
  );

  const dayGroups = useMemo(() => groupByDay(displayedMessages), [displayedMessages]);

  const lastActivity = messages.length > 0 ? messages[messages.length - 1] : null;

  useEffect(() => {
    if (!searchOpen) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, searchOpen]);

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

  const startEdit = (m) => {
    setEditingId(m.id);
    setEditBody(m.body || "");
    setOpenMenuId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditBody("");
  };

  const saveEdit = async (messageId) => {
    if (!editBody.trim()) return;
    try {
      await dispatch(updateMessage({ messageId, body: editBody.trim() })).unwrap();
      cancelEdit();
    } catch (err) {
      showToast(err || "Erreur lors de la modification", "error");
    }
  };

  const handleDelete = async (messageId) => {
    setOpenMenuId(null);
    try {
      await dispatch(deleteMessage(messageId)).unwrap();
    } catch (err) {
      showToast(err || "Erreur lors de la suppression", "error");
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    dispatch(searchMessages(searchQuery.trim()));
  };

  const toggleSearch = () => {
    setSearchOpen((prev) => !prev);
    setSearchQuery("");
    dispatch(clearSearch());
  };

  return (
    <div className="max-w-[1400px] mx-auto px-3 sm:px-6 pb-6 sm:pb-10">
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 sm:gap-6" style={{ height: "min(720px, calc(100vh - 180px))", minHeight: 420 }}>

        {/* ── Colonne latérale : fiche backoffice ── */}
        <div className="hidden lg:flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 flex flex-col items-center text-center border-b border-slate-100">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center shadow-sm mb-3">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <p className="text-sm font-bold text-slate-900">Backoffice</p>
            <p className="text-xs text-slate-400 mt-0.5">Équipe Tour Shop Express</p>
            <span className="inline-flex items-center gap-1.5 mt-3 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Support actif
            </span>
          </div>

          <div className="p-5 space-y-4 flex-1">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Contact</p>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Phone size={14} className="text-slate-300 shrink-0" />
                  <span>Support Tour Shop</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Mail size={14} className="text-slate-300 shrink-0" />
                  <span>backoffice@tourshop.com</span>
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Conversation</p>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Messages</span>
                  <span className="font-bold text-slate-800">{messages.length}</span>
                </div>
                {lastActivity && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Dernière activité</span>
                    <span className="font-bold text-slate-800">
                      {format(new Date(lastActivity.created_at), "dd/MM HH:mm")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-slate-100">
            <button
              onClick={toggleSearch}
              className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                searchOpen ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Search size={14} />
              Rechercher dans le fil
            </button>
          </div>
        </div>

        {/* ── Panneau principal : fil de discussion ── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-w-0">
          {/* En-tête mobile (fiche condensée, cachée sur desktop) */}
          <div className="lg:hidden px-4 py-3 border-b border-slate-100 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">Backoffice</p>
            </div>
            <button
              onClick={toggleSearch}
              className={`p-2 rounded-lg transition-colors shrink-0 ${searchOpen ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"}`}
            >
              <Search size={16} />
            </button>
          </div>

          {searchOpen && (
            <div className="px-4 sm:px-6 py-2.5 border-b border-slate-100 bg-slate-50/60 flex items-center gap-2">
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Rechercher un mot..."
                className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-400"
              />
              <button
                onClick={handleSearch}
                disabled={!searchQuery.trim() || isSearching}
                className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold disabled:opacity-40"
              >
                {isSearching ? <Loader2 size={14} className="animate-spin" /> : "Chercher"}
              </button>
            </div>
          )}

          {/* Fil de discussion — bulles de chat classiques, avatar + alignement gauche/droite */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 bg-slate-50/40">
            {status === "loading" && messages.length === 0 ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-slate-400" size={28} />
              </div>
            ) : displayedMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center mb-3">
                  <Mail className="w-6 h-6 text-slate-300" strokeWidth={1.5} />
                </div>
                <p className="text-sm font-bold text-slate-600">
                  {searchOpen && searchResults ? "Aucun résultat" : "Aucun message pour l'instant"}
                </p>
                {!searchOpen && (
                  <p className="text-xs text-slate-400 mt-1">Écrivez au backoffice pour démarrer la conversation</p>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {dayGroups.map((group) => (
                  <div key={group.day}>
                    <div className="flex items-center justify-center mb-4">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm">
                        {formatDayLabel(group.date)}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {group.items.map((m) => {
                        const isMine = m.sender?.type === "agence";
                        const isEditing = editingId === m.id;
                        const senderName = isMine
                          ? "Vous"
                          : [m.sender?.prenoms, m.sender?.nom].filter(Boolean).join(" ") || "Backoffice";
                        const initial = isMine ? "V" : (senderName?.[0] || "B").toUpperCase();

                        return (
                          <div key={m.id} className={`group flex items-end gap-2 ${isMine ? "flex-row-reverse" : ""}`}>
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                                isMine ? "bg-slate-900" : "bg-indigo-500"
                              }`}
                            >
                              {initial}
                            </div>

                            <div className={`flex flex-col max-w-[75%] sm:max-w-[65%] ${isMine ? "items-end" : "items-start"}`}>
                              <div className="flex items-center gap-1.5 mb-1 px-1">
                                <span className={`text-[11px] font-bold ${isMine ? "text-slate-700" : "text-indigo-600"}`}>
                                  {senderName}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {format(new Date(m.created_at), "HH:mm")}
                                </span>
                                {isMine && !isEditing && (
                                  <div className="relative">
                                    <button
                                      onClick={() => setOpenMenuId(openMenuId === m.id ? null : m.id)}
                                      className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-slate-700 transition-opacity"
                                    >
                                      <MoreVertical size={13} />
                                    </button>
                                    {openMenuId === m.id && (
                                      <div className="absolute top-5 right-0 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-10 w-32">
                                        {m.body && (
                                          <button
                                            onClick={() => startEdit(m)}
                                            className="w-full text-left px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                          >
                                            <Pencil size={12} /> Modifier
                                          </button>
                                        )}
                                        <button
                                          onClick={() => handleDelete(m.id)}
                                          className="w-full text-left px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                                        >
                                          <Trash2 size={12} /> Supprimer
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>

                              {isEditing ? (
                                <div className="space-y-2 w-full min-w-[240px]">
                                  <textarea
                                    autoFocus
                                    value={editBody}
                                    onChange={(e) => setEditBody(e.target.value)}
                                    rows={2}
                                    className="w-full px-3 py-2 rounded-lg text-sm bg-white border border-slate-200 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-400 resize-none"
                                  />
                                  <div className="flex gap-2">
                                    <button onClick={() => saveEdit(m.id)} className="text-xs font-bold text-white bg-slate-900 px-3 py-1 rounded-lg">Enregistrer</button>
                                    <button onClick={cancelEdit} className="text-xs font-bold text-slate-500 hover:text-slate-800">Annuler</button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  {m.body && (
                                    <div
                                      className={`px-3.5 py-2.5 rounded-2xl text-sm whitespace-pre-wrap break-words leading-relaxed shadow-sm ${
                                        isMine
                                          ? "bg-indigo-600 text-white rounded-br-md"
                                          : "bg-white text-slate-700 border border-slate-200 rounded-bl-md"
                                      }`}
                                    >
                                      {m.body}
                                      {m.edited_at && (
                                        <span className={`ml-1.5 text-[10px] italic ${isMine ? "text-indigo-200" : "text-slate-400"}`}>
                                          modifié
                                        </span>
                                      )}
                                    </div>
                                  )}
                                  {m.attachments?.length > 0 && (
                                    <div className="mt-1.5 space-y-1.5 w-full">
                                      {m.attachments.map((a) => isImage(a.mime_type) ? (
                                        <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer" className="block">
                                          <img src={a.url} alt={a.original_name} className="max-w-full max-h-48 rounded-xl object-cover border border-slate-200" />
                                        </a>
                                      ) : (
                                        <a
                                          key={a.id}
                                          href={a.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className={`flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg transition-colors w-fit ${
                                            isMine ? "bg-indigo-50 hover:bg-indigo-100 text-indigo-700" : "bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600"
                                          }`}
                                        >
                                          <FileText size={14} className="shrink-0" />
                                          <span className="truncate">{a.original_name}</span>
                                        </a>
                                      ))}
                                    </div>
                                  )}
                                  {isMine && (
                                    <span className="mt-0.5 px-1">
                                      {m.read_at
                                        ? <CheckCheck size={13} className="text-sky-500" />
                                        : <Check size={13} className="text-slate-300" />}
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {attachments.length > 0 && (
            <div className="px-4 sm:px-6 pt-2.5 bg-white border-t border-slate-100 flex flex-wrap gap-2">
              {attachments.map((f, i) => (
                <span key={i} className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700">
                  <FileText size={12} />
                  <span className="max-w-[140px] truncate">{f.name}</span>
                  <span className="text-slate-400 font-medium">({formatSize(f.size)})</span>
                  <button onClick={() => removeAttachment(i)} className="text-slate-400 hover:text-red-600 transition-colors">
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
              className="p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors shrink-0"
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
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-400 text-sm font-medium text-slate-900 transition-all resize-none max-h-32"
            />
            <button
              onClick={handleSend}
              disabled={isSending || (!body.trim() && attachments.length === 0)}
              className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 active:scale-95 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
