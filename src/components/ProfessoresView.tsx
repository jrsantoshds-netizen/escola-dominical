import React, { useState } from 'react';
import { Professor, Turma, Licao, Presenca, normalizeText } from '../types';
import { 
  Plus, 
  Search, 
  MapPin, 
  MessageCircle, 
  Trash2, 
  Pencil, 
  LayoutGrid, 
  List, 
  Presentation, 
  BookOpen,
  ClipboardCheck,
  Check,
  X
} from 'lucide-react';
import { generateUUID } from '../db';

interface ProfessoresViewProps {
  professores: Professor[];
  turmas: Turma[];
  licoes: Licao[];
  presencas: Presenca[];
  onSave: (prof: Professor) => void;
  onDelete: (id: string) => void;
}

export default function ProfessoresView({
  professores,
  turmas,
  licoes,
  presencas,
  onSave,
  onDelete
}: ProfessoresViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [editingProf, setEditingProf] = useState<Professor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // New Form states
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  // Delete confirmation overlay state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Helper to find class names taught by professor via dynamic association 
  // In our EBD mock, we can display the classes and associate lessons taught.
  const getProfClasses = (profId: string): string[] => {
    // We can assume each professor is active in the congregation's classes
    // and maps to classes. Let's return the congregation classes.
    return turmas.map(t => t.nome);
  };

  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return fullName.slice(0, 2).toUpperCase();
  };

  const getAvatarColor = (fullName: string) => {
    const COLORS = [
      'bg-amber-500/10 text-amber-500 border-amber-500/20',
      'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      'bg-blue-500/10 text-blue-400 border-blue-500/20',
      'bg-orange-500/10 text-orange-400 border-orange-500/20',
      'bg-violet-500/10 text-violet-400 border-violet-500/20',
      'bg-rose-500/10 text-rose-400 border-rose-500/20',
      'bg-teal-500/10 text-teal-400 border-teal-500/20',
      'bg-pink-500/10 text-pink-400 border-pink-500/20'
    ];
    let hash = 0;
    for (let i = 0; i < fullName.length; i++) {
      hash = fullName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % COLORS.length;
    return COLORS[idx];
  };

  const handleEditClick = (prof?: Professor) => {
    if (prof) {
      setEditingProf(prof);
      setName(prof.nome);
      setAddress(prof.endereco);
      setWhatsapp(prof.whatsapp);
    } else {
      setEditingProf(null);
      setName('');
      setAddress('');
      setWhatsapp('');
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const saved: Professor = {
      id: editingProf ? editingProf.id : generateUUID('p'),
      nome: name.trim(),
      endereco: address.trim(),
      whatsapp: whatsapp.trim()
    };

    onSave(saved);
    setIsModalOpen(false);
  };

  const filteredProfs = professores.filter((p) => {
    const query = normalizeText(searchTerm);
    return (
      normalizeText(p.nome).includes(query) ||
      normalizeText(p.endereco).includes(query) ||
      normalizeText(p.whatsapp).includes(query)
    );
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Title Section */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl md:text-3xl font-bold text-white font-serif">Professores</h2>
            <span className="inline-flex items-center justify-center bg-emerald-500/10 text-emerald-400 font-mono text-sm px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-bold min-w-[28px] h-7">
              {professores.length}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Cadastro e controle de ministrantes da Escola Dominical</p>
        </div>

        {/* Layout Modifiers */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="inline-flex rounded-lg border border-slate-800 bg-slate-900/60 p-1">
            <button
              onClick={() => setViewMode('cards')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold cursor-pointer transition-all ${
                viewMode === 'cards' 
                  ? 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold cursor-pointer transition-all ${
                viewMode === 'table' 
                  ? 'bg-emerald-500/10 text-emerald-455 border border-emerald-500/20' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="h-3.5 w-3.5" />
              Tabela
            </button>
          </div>

          <button
            onClick={() => handleEditClick()}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 font-serif leading-none shadow-md transition-all hover:bg-emerald-400 active:scale-95 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Novo Professor
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="relative max-w-md w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar professores por nome ou endereço..."
          className="w-full pl-11 pr-4 py-2.5 bg-slate-900/60 border border-slate-850 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-colors"
        />
      </div>

      {/* Main Panel Listing */}
      {professores.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/10 p-12 text-center">
          <Presentation className="h-12 w-12 mx-auto text-slate-600 mb-4 opacity-40" />
          <h4 className="text-base font-bold text-slate-300">Nenhum professor cadastrado</h4>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Cadastre os pregadores e professores responsáveis pelas lições Dominicais.
          </p>
          <button
            onClick={() => handleEditClick()}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Cadastrar Primeiro Professor
          </button>
        </div>
      ) : filteredProfs.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/15 p-8 text-center text-slate-500 text-sm font-medium">
          Nenhum professor correspondente à sua busca.
        </div>
      ) : viewMode === 'cards' ? (
        /* CARDS LAYOUT */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProfs.map((p) => {
            const associatedClasses = getProfClasses(p.id);
            const totalLicoesVal = licoes.length;
            const presencesCount = presencas.length;
            
            const initials = getInitials(p.nome);
            const colorClass = getAvatarColor(p.nome);
            const cleanPhone = p.whatsapp.replace(/\D/g, '');
            const waLink = cleanPhone ? `https://wa.me/55${cleanPhone}` : '';

            return (
              <div 
                key={p.id} 
                className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 p-5 transition-all duration-355 hover:border-emerald-500/35 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20"
              >
                {/* Accent band */}
                <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-emerald-500/85 via-emerald-500/20 to-transparent"></div>

                <div className="flex items-start gap-4 mb-4">
                  <div className={`h-11 w-11 rounded-lg flex items-center justify-center text-sm font-black font-serif border ${colorClass} shrink-0`}>
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
                      {p.nome}
                    </h4>
                    <p className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 truncate" title={p.endereco}>
                      <MapPin className="h-3 w-3 shrink-0 text-slate-500" />
                      <span>{p.endereco || 'Endereço não cadastrado'}</span>
                    </p>
                  </div>
                </div>

                {/* Subtext and details */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {associatedClasses.length === 0 ? (
                    <span className="text-[10px] text-slate-500 uppercase px-2 py-0.5 border border-slate-800 rounded bg-slate-950/25">
                      Sem vínculos
                    </span>
                  ) : (
                    associatedClasses.map((cls, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-2 py-0.5 rounded shadow-sm">
                        {cls}
                      </span>
                    ))
                  )}
                </div>

                {/* Statistics Pills */}
                <div className="flex flex-wrap gap-2 mb-4 text-xs">
                  <div className="inline-flex items-center gap-1.5 bg-slate-950/30 border border-slate-850 px-2.5 py-1 rounded-lg text-slate-400">
                    <Presentation className="h-3.5 w-3.5 text-blue-400" />
                    <span>{associatedClasses.length} classe{associatedClasses.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 bg-slate-950/30 border border-slate-850 px-2.5 py-1 rounded-lg text-slate-400">
                    <BookOpen className="h-3.5 w-3.5 text-amber-500" />
                    <span>{totalLicoesVal} li{totalLicoesVal !== 1 ? 'ções' : 'ção'}</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 bg-slate-950/30 border border-slate-850 px-2.5 py-1 rounded-lg text-slate-400">
                    <ClipboardCheck className="h-3.5 w-3.5 text-emerald-400" />
                    <span>{presencesCount} presenças</span>
                  </div>
                </div>

                {/* Card controls */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800/50">
                  {waLink ? (
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/5 border border-emerald-500/15 p-1.5 rounded-lg hover:bg-emerald-500/10 transition-all cursor-pointer"
                    >
                      <MessageCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      {p.whatsapp}
                    </a>
                  ) : (
                    <span className="text-xs text-slate-550 block py-1 font-medium select-none">Sem WhatsApp</span>
                  )}

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditClick(p)}
                      title="Editar Professor"
                      className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/20 cursor-pointer transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingId(p.id)}
                      title="Excluir Professor"
                      className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-rose-500 hover:border-rose-500/20 cursor-pointer transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/20 shadow">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/50 border-b border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-4 font-semibold">Nome</th>
                  <th className="py-3.5 px-4 font-semibold">Endereço</th>
                  <th className="py-3.5 px-4 font-semibold">WhatsApp</th>
                  <th className="py-3.5 px-4 font-semibold">Classes Vinculadas</th>
                  <th className="py-3.5 px-3 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-sm text-slate-300">
                {filteredProfs.map((p) => {
                  const associated = getProfClasses(p.id);
                  const cleanPhone = p.whatsapp.replace(/\D/g, '');
                  const waLink = cleanPhone ? `https://wa.me/55${cleanPhone}` : '';

                  return (
                    <tr key={p.id} className="hover:bg-slate-800/10 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">{p.nome}</td>
                      <td className="py-3.5 px-4 text-slate-400 truncate max-w-sm">{p.endereco || '—'}</td>
                      <td className="py-3.5 px-4 font-mono text-xs">
                        {waLink ? (
                          <a 
                            href={waLink} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center gap-1.5 text-emerald-400 hover:underline"
                          >
                            <MessageCircle className="h-3.5 w-3.5 text-emerald-440 shrink-0" />
                            {p.whatsapp}
                          </a>
                        ) : '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {associated.map((cn, i) => (
                            <span key={i} className="inline-flex items-center rounded bg-emerald-400/5 border border-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                              {cn}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleEditClick(p)}
                            className="bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-400 hover:text-emerald-400 cursor-pointer"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingId(p.id)}
                            className="bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-400 hover:text-rose-500 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* COMPONENT INTERACTIVE MODAL: ADD / UPDATE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl animate-scaleIn">
            <h3 className="text-lg font-bold font-serif text-white mb-5">
              {editingProf ? 'Editar Professor' : 'Novo Professor'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Nome do Mestre / Pregador
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome completo do professor"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-650 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Endereço
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ex: Rua das Rosas, Centro"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-650 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  WhatsApp com DDD
                </label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="Ex: 11900000000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-650 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* CTAs */}
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 font-serif hover:bg-emerald-400 transition-all cursor-pointer"
                >
                  {editingProf ? 'Salvar Alterações' : 'Cadastrar Professor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE OVERLAY MODAL */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setDeletingId(null)}></div>
          <div className="relative w-full max-w-sm overflow-hidden rounded-xl border border-slate-800 bg-slate-900 p-6 text-center shadow-xl animate-scaleIn">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-5 w-5" />
            </div>
            <h4 className="text-base font-bold text-white font-serif">Excluir Professor?</h4>
            <p className="text-sm text-slate-400 mt-2">
              Você tem certeza? Esta ação removerá as informações de contato do professor no sistema. Ela não pode ser desfeita.
            </p>
            <div className="flex gap-3 justify-center mt-5">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="rounded-md border border-slate-800 py-1.5 px-3 text-xs font-semibold text-slate-400 hover:bg-slate-800 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onDelete(deletingId);
                  setDeletingId(null);
                }}
                className="rounded-md bg-rose-500 hover:bg-rose-600 py-1.5 px-3 text-xs font-bold text-white cursor-pointer"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
