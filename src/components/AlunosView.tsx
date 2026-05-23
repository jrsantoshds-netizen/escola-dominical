import React, { useState } from 'react';
import { Aluno, Turma, Presenca, normalizeText } from '../types';
import { 
  Plus, 
  Search, 
  MapPin, 
  MessageCircle, 
  Trash2, 
  Pencil, 
  LayoutGrid, 
  List, 
  GraduationCap, 
  MessageSquare,
  Bookmark,
  Check,
  X,
  UserCheck
} from 'lucide-react';
import { generateUUID } from '../db';

interface AlunosViewProps {
  alunos: Aluno[];
  turmas: Turma[];
  presencas: Presenca[];
  onSave: (aluno: Aluno) => void;
  onDelete: (id: string) => void;
}

export default function AlunosView({
  alunos,
  turmas,
  presencas,
  onSave,
  onDelete
}: AlunosViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [editingAluno, setEditingAluno] = useState<Aluno | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // New Form states
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  // Delete confirmation overlay state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Helper to find class names of student
  const getStudentClasses = (studentId: string): string[] => {
    return turmas
      .filter((t) => (t.alunoIds || []).includes(studentId))
      .map((t) => t.nome);
  };

  // Helper to find count of presences
  const getStudentPresenceCount = (studentId: string): number => {
    return presencas.filter((p) => p.alunoId === studentId).length;
  };

  // Helper to count bibles brought
  const getStudentBiblesCount = (studentId: string): number => {
    return presencas.filter((p) => p.alunoId === studentId && p.qtdBiblia > 0).length;
  };

  // Helper to count magazines brought
  const getStudentMagazinesCount = (studentId: string): number => {
    return presencas.filter((p) => p.alunoId === studentId && p.qtdRevista > 0).length;
  };

  // Avatar Initials + Color Generators
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

  const handleEditClick = (aluno?: Aluno) => {
    if (aluno) {
      setEditingAluno(aluno);
      setName(aluno.nome);
      setAddress(aluno.endereco);
      setWhatsapp(aluno.whatsapp);
    } else {
      setEditingAluno(null);
      setName('');
      setAddress('');
      setWhatsapp('');
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const saved: Aluno = {
      id: editingAluno ? editingAluno.id : generateUUID('a'),
      nome: name.trim(),
      endereco: address.trim(),
      whatsapp: whatsapp.trim()
    };

    onSave(saved);
    setIsModalOpen(false);
  };

  const filteredAlunos = alunos.filter((a) => {
    const query = normalizeText(searchTerm);
    return (
      normalizeText(a.nome).includes(query) ||
      normalizeText(a.endereco).includes(query) ||
      normalizeText(a.whatsapp).includes(query) ||
      getStudentClasses(a.id).some(cls => normalizeText(cls).includes(query))
    );
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Tab/Page Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl md:text-3xl font-bold text-white font-serif">Alunos</h2>
            <span className="inline-flex items-center justify-center bg-amber-500/10 text-amber-500 font-mono text-sm px-2.5 py-0.5 rounded-full border border-amber-500/20 font-bold min-w-[28px] h-7">
              {alunos.length}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Gerenciamento de matrículas e informações de contato</p>
        </div>

        {/* Layout Mode Toggles & Create Button */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="inline-flex rounded-lg border border-slate-800 bg-slate-900/60 p-1">
            <button
              onClick={() => setViewMode('cards')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold cursor-pointer transition-all ${
                viewMode === 'cards' 
                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
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
                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="h-3.5 w-3.5" />
              Tabela
            </button>
          </div>

          <button
            onClick={() => handleEditClick()}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-slate-950 font-serif leading-none shadow-md transition-all hover:bg-amber-400 active:scale-95 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Novo Aluno
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative max-w-md w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar alunos por nome, endereço ou turma..."
          className="w-full pl-11 pr-4 py-2.5 bg-slate-900/60 border border-slate-850 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-colors"
        />
      </div>

      {/* Main Student Listing Section */}
      {alunos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/10 p-12 text-center">
          <GraduationCap className="h-12 w-12 mx-auto text-slate-600 mb-4 opacity-40" />
          <h4 className="text-base font-bold text-slate-300">Nenhum aluno cadastrado</h4>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Cadastre os alunos que frequentam a Escola Dominical nesta congregação.
          </p>
          <button
            onClick={() => handleEditClick()}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-amber-500/10 px-4 py-2 text-xs font-bold text-amber-500 border border-amber-500/20 hover:bg-amber-500/20 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Cadastrar Primeiro Aluno
          </button>
        </div>
      ) : filteredAlunos.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/15 p-8 text-center text-slate-500 text-sm font-medium">
          Nenhum aluno correspondente à sua busca.
        </div>
      ) : viewMode === 'cards' ? (
        /* CARDS VIEW MODE */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAlunos.map((a) => {
            const linkedClasses = getStudentClasses(a.id);
            const totalPre = getStudentPresenceCount(a.id);
            const biblesPre = getStudentBiblesCount(a.id);
            const magsPre = getStudentMagazinesCount(a.id);
            const initials = getInitials(a.nome);
            const badgeStyle = getAvatarColor(a.nome);
            const cleanPhone = a.whatsapp.replace(/\D/g, '');
            const waLink = cleanPhone ? `https://wa.me/55${cleanPhone}` : '';

            return (
              <div 
                key={a.id} 
                className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 p-5 transition-all duration-300 hover:border-amber-500/35 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20"
              >
                {/* Visual Top Highlight Accent */}
                <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-amber-500/80 via-amber-500/20 to-transparent"></div>
                
                {/* Header Information (Avatar, Name, Address) */}
                <div className="flex items-start gap-4 mb-4">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-base font-bold font-serif border ${badgeStyle} shrink-0 relative`}>
                    {initials}
                    <div className="absolute -bottom-1.5 -right-1.5 h-4 w-4 rounded-full bg-slate-950 flex items-center justify-center">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors truncate font-sans">
                      {a.nome}
                    </h4>
                    <p className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 truncate" title={a.endereco}>
                      <MapPin className="h-3 w-3 shrink-0 text-slate-500" />
                      <span>{a.endereco || 'Endereço não informado'}</span>
                    </p>
                  </div>
                </div>

                {/* Assigned Classes */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {linkedClasses.length === 0 ? (
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-slate-500 bg-slate-950/40 border border-slate-800/40 px-2 py-0.5 rounded-full">
                      Sem classe vinculada
                    </span>
                  ) : (
                    linkedClasses.map((clsName, idx) => (
                      <span 
                        key={idx} 
                        className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-amber-500/90 bg-amber-500/5 border border-amber-500/20 px-2.5 py-0.5 rounded-full shadow-inner"
                      >
                        <UserCheck className="h-2.5 w-2.5 font-bold" />
                        {clsName}
                      </span>
                    ))
                  )}
                </div>

                {/* Mini Statistics (Presence counts, bibles, journals) */}
                <div className="flex items-center gap-2.5 bg-slate-950/20 border border-slate-850/50 rounded-xl p-3 mb-4 text-xs font-medium text-slate-400">
                  <div className="flex items-center gap-1 pr-1.5 border-r border-slate-805">
                    <Bookmark className="h-3.5 w-3.5 text-emerald-400" />
                    <span>{totalPre} presença{totalPre !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-1 pr-1.5 border-r border-slate-805">
                    <span className="text-blue-400 text-[10px] font-bold py-0.5 px-1 bg-blue-500/10 rounded">B</span>
                    <span>{biblesPre}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-violet-400 text-[10px] font-bold py-0.5 px-1 bg-violet-500/10 rounded">R</span>
                    <span>{magsPre}</span>
                  </div>
                </div>

                {/* Footer Controls (WhatsApp Button, Update Controls) */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800/50">
                  {waLink ? (
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 hover:border-emerald-500/30 hover:bg-emerald-500/15 py-1.5 px-3 rounded-lg transition-all"
                    >
                      <MessageCircle className="h-3.5 w-3.5 text-emerald-450 shrink-0" />
                      {a.whatsapp}
                    </a>
                  ) : (
                    <span className="text-[11px] text-slate-500 italic block py-1">Sem telefone</span>
                  )}

                  <div className="flex items-center gap-1 font-mono">
                    <button
                      onClick={() => handleEditClick(a)}
                      title="Editar Aluno"
                      className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-amber-500 hover:border-amber-500/30 hover:bg-amber-500/5 cursor-pointer transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingId(a.id)}
                      title="Excluir Aluno"
                      className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-rose-550 hover:border-rose-500/30 hover:bg-rose-500/5 cursor-pointer transition-colors"
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
        /* TABLE VIEW MODE */
        <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/20 shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/60 border-b border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-4 font-semibold">Nome</th>
                  <th className="py-3.5 px-4 font-semibold">Endereço</th>
                  <th className="py-3.5 px-4 font-semibold">WhatsApp</th>
                  <th className="py-3.5 px-4 font-semibold">Classes Vinculadas</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Frequência</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-sm text-slate-300">
                {filteredAlunos.map((a) => {
                  const linkedClasses = getStudentClasses(a.id);
                  const totalPre = getStudentPresenceCount(a.id);
                  const cleanPhone = a.whatsapp.replace(/\D/g, '');
                  const waLink = cleanPhone ? `https://wa.me/55${cleanPhone}` : '';

                  return (
                    <tr key={a.id} className="hover:bg-slate-800/10 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white leading-none whitespace-nowrap">{a.nome}</td>
                      <td className="py-3.5 px-4 text-slate-400 max-w-[200px] truncate" title={a.endereco}>
                        {a.endereco || '—'}
                      </td>
                      <td className="py-3.5 px-4 leading-none">
                        {waLink ? (
                          <a 
                            href={waLink} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center gap-1 hover:text-emerald-400 hover:underline transition"
                          >
                            <MessageCircle className="h-3.5 w-3.5 shrink-0 text-emerald-450" />
                            {a.whatsapp}
                          </a>
                        ) : '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {linkedClasses.length === 0 ? (
                            <span className="text-xs text-slate-500">—</span>
                          ) : (
                            linkedClasses.map((cls, j) => (
                              <span key={j} className="inline-flex items-center rounded-md bg-amber-400/5 border border-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-500 uppercase tracking-wide">
                                {cls}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-semibold text-emerald-400">
                        {totalPre} presenças
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleEditClick(a)}
                            className="bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-400 hover:text-amber-500 hover:border-amber-550 cursor-pointer"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingId(a.id)}
                            className="bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-400 hover:text-rose-500 hover:border-rose-550 cursor-pointer"
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

      {/* DETAILED DIALOG MODAL: ADD / EDIT STUDENT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay mask */}
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          
          {/* Modal Container */}
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl animate-scaleIn">
            <h3 className="text-lg font-bold font-serif text-white mb-5">
              {editingAluno ? 'Editar Aluno' : 'Novo Aluno'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome completo do aluno"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Endereço Residencial
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ex: Rua, Bairro, Número"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  WhatsApp / Celular
                </label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="Ex: 11999999999"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* CTAs */}
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 font-serif hover:bg-amber-400 active:scale-95 transition-all cursor-pointer"
                >
                  {editingAluno ? 'Salvar Alterações' : 'Cadastrar Aluno'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL DUSTMASK */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setDeletingId(null)}></div>
          <div className="relative w-full max-w-sm overflow-hidden rounded-xl border border-slate-800 bg-slate-900 p-6 text-center shadow-xl animate-scaleIn">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-6 w-6" />
            </div>
            <h4 className="text-base font-bold text-white font-serif">Excluir Aluno?</h4>
            <p className="text-sm text-slate-400 mt-2">
              Você tem certeza? O aluno será removido de todas as turmas, chamadas e frequências associadas. Esta ação é definitiva.
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
