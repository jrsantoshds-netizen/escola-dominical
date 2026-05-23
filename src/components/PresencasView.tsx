import React, { useState, useEffect } from 'react';
import { Presenca, Turma, Aluno, Licao, normalizeText } from '../types';
import { 
  Plus, 
  Search, 
  Trash2, 
  Pencil, 
  ClipboardCheck, 
  Check, 
  X, 
  Calendar,
  Book,
  BookOpen,
  Filter
} from 'lucide-react';
import { generateUUID, formatDateBr } from '../db';

interface PresencasViewProps {
  presencas: Presenca[];
  turmas: Turma[];
  alunos: Aluno[];
  licoes: Licao[];
  onSave: (presenca: Presenca) => void;
  onDelete: (id: string) => void;
}

export default function PresencasView({
  presencas,
  turmas,
  alunos,
  licoes,
  onSave,
  onDelete
}: PresencasViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPresenca, setEditingPresenca] = useState<Presenca | null>(null);

  // Form States
  const [turmaId, setTurmaId] = useState('');
  const [alunoId, setAlunoId] = useState('');
  const [licaoId, setLicaoId] = useState('');
  const [qtdBiblia, setQtdBiblia] = useState(1); // 0 or 1
  const [qtdRevista, setQtdRevista] = useState(1); // 0 or 1
  const [data, setData] = useState(() => new Date().toISOString().split('T')[0]);

  // Handle cascading student matches on Class select
  const [filteredAlunosSelect, setFilteredAlunosSelect] = useState<Aluno[]>([]);

  useEffect(() => {
    if (!turmaId) {
      setFilteredAlunosSelect([]);
      setAlunoId('');
      return;
    }

    const selectedTurma = turmas.find((t) => t.id === turmaId);
    if (selectedTurma) {
      const classAlunoIds = selectedTurma.alunoIds || [];
      const matchedAlunos = classAlunoIds
        .map((aid) => alunos.find((a) => a.id === aid))
        .filter(Boolean) as Aluno[];
      
      setFilteredAlunosSelect(matchedAlunos);

      // Auto-assign lesson associated with this class
      if (selectedTurma.licaoId) {
        setLicaoId(selectedTurma.licaoId);
      }

      // Keep student selection if editing and already matches, else clear
      if (editingPresenca && editingPresenca.turmaId === turmaId) {
        setAlunoId(editingPresenca.alunoId);
      } else {
        setAlunoId('');
      }
    }
  }, [turmaId, turmas, alunos, editingPresenca]);


  const handleEditClick = (p?: Presenca) => {
    if (p) {
      setEditingPresenca(p);
      setTurmaId(p.turmaId);
      setAlunoId(p.alunoId);
      setLicaoId(p.licaoId);
      setQtdBiblia(p.qtdBiblia);
      setQtdRevista(p.qtdRevista);
      setData(p.data);
    } else {
      setEditingPresenca(null);
      setTurmaId('');
      setAlunoId('');
      setLicaoId('');
      setQtdBiblia(1);
      setQtdRevista(1);
      setData(new Date().toISOString().split('T')[0]);
    }
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!turmaId || !alunoId || !licaoId || !data) return;

    onSave({
      id: editingPresenca ? editingPresenca.id : generateUUID('pr'),
      turmaId,
      alunoId,
      licaoId,
      qtdBiblia,
      qtdRevista,
      data
    });

    setIsModalOpen(false);
  };

  const findAlunoName = (id: string) => {
    return alunos.find((a) => a.id === id)?.nome || '—';
  };

  const findTurmaName = (id: string) => {
    return turmas.find((t) => t.id === id)?.nome || '—';
  };

  const findLicaoName = (id: string) => {
    return licoes.find((l) => l.id === id)?.nome || '—';
  };

  const filteredLogs = presencas.filter((p) => {
    const studentName = normalizeText(findAlunoName(p.alunoId));
    const className = normalizeText(findTurmaName(p.turmaId));
    const query = normalizeText(searchTerm);
    
    const matchesSearch = studentName.includes(query) || className.includes(query);
    const matchesDate = !filterDate || p.data === filterDate;

    return matchesSearch && matchesDate;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Tab/Page Title Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl md:text-3xl font-bold text-white font-serif">Livro de Presença</h2>
            <span className="inline-flex items-center justify-center bg-amber-500/10 text-amber-500 font-mono text-sm px-2.5 py-0.5 rounded-full border border-amber-500/20 font-bold min-w-[28px] h-7">
              {presencas.length}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Lançamento de frequências Dominicais, Revistas e Bíblias</p>
        </div>

        <button
          onClick={() => handleEditClick()}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-slate-950 font-serif leading-none shadow-md transition-all hover:bg-amber-400 active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Registrar Presença
        </button>
      </div>

      {/* Filter and Searching Inputs */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Input Bar */}
        <div className="relative max-w-md w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome do aluno ou classe..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-900/60 border border-slate-850 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {/* Date Filter Bar */}
        <div className="relative max-w-[240px] w-full">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4" />
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-900/60 border border-slate-850 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 cursor-pointer text-slate-350"
          />
          {filterDate && (
            <button 
              onClick={() => setFilterDate('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded bg-slate-850 px-1 py-0.5 text-[9px] font-bold text-slate-400 hover:text-white"
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Logs Table Area */}
      {presencas.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/10 p-12 text-center">
          <ClipboardCheck className="h-12 w-12 mx-auto text-slate-600 mb-4 opacity-40" />
          <h4 className="text-base font-bold text-slate-300">Nenhuma chamada registrada</h4>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Faça chamadas em classe para alimentar as presenças e estatísticas de participação dominicais.
          </p>
          <button
            onClick={() => handleEditClick()}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-amber-500/10 px-4 py-2 text-xs font-bold text-amber-500 border border-amber-500/20 hover:bg-amber-500/20 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Lançar Primeira Presença
          </button>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/15 p-8 text-center text-slate-500 text-sm font-medium">
          Nenhuma presença correspondente aos critérios de busca ou data informada.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/20 shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/60 border-b border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-4 font-semibold">Aluno</th>
                  <th className="py-3.5 px-4 font-semibold">Classe / Turma</th>
                  <th className="py-3.5 px-4 font-semibold">Tema da Lição</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Bíblia</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Revista</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Data EBD</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-sm text-slate-300">
                {filteredLogs.slice().reverse().map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/10 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                      {findAlunoName(p.alunoId)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center rounded bg-blue-450/10 border border-blue-500/15 px-2.5 py-0.5 text-xs font-semibold text-blue-400">
                        {findTurmaName(p.turmaId)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 truncate max-w-xs">{findLicaoName(p.licaoId)}</td>
                    <td className="py-3.5 px-4 text-center">
                      {p.qtdBiblia > 0 ? (
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                          <Check className="h-3 w-3" />
                        </span>
                      ) : (
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-500/15 text-rose-450 border border-rose-500/25">
                          <X className="h-3 w-3" />
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {p.qtdRevista > 0 ? (
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                          <Check className="h-3 w-3" />
                        </span>
                      ) : (
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-500/15 text-rose-450 border border-rose-500/25">
                          <X className="h-3 w-3" />
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-xs text-slate-400 font-semibold">{formatDateBr(p.data)}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex justify-end gap-1.5 font-mono">
                        <button
                          onClick={() => handleEditClick(p)}
                          className="bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-400 hover:text-amber-500 cursor-pointer"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(p.id)}
                          className="bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-400 hover:text-rose-500 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* COMPONENT INTERACTIVE DIALOG MODAL: CREATE / MOD RECOR */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl animate-scaleIn">
            <h3 className="text-lg font-bold font-serif text-white mb-5">
              {editingPresenca ? 'Editar Registro' : 'Lançar Frequência'}
            </h3>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Select class */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Turma / Classe
                </label>
                <select
                  required
                  value={turmaId}
                  onChange={(e) => setTurmaId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 cursor-pointer shadow-sm"
                >
                  <option value="">Selecione a turma...</option>
                  {turmas.map((t) => (
                    <option key={t.id} value={t.id}>{t.nome}</option>
                  ))}
                </select>
              </div>

              {/* Select student matching cascades list */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Aluno da Classe
                </label>
                <select
                  required
                  disabled={!turmaId}
                  value={alunoId}
                  onChange={(e) => setAlunoId(e.target.value)}
                  className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 cursor-pointer shadow-sm ${
                    !turmaId ? 'opacity-35 cursor-not-allowed' : ''
                  }`}
                >
                  <option value="">
                    {turmaId ? 'Selecione o aluno do rol...' : 'Primeiro selecione uma turma'}
                  </option>
                  {filteredAlunosSelect.map((a) => (
                    <option key={a.id} value={a.id}>{a.nome}</option>
                  ))}
                </select>
                {turmaId && filteredAlunosSelect.length === 0 && (
                  <p className="text-[10px] text-orange-400 font-bold mt-1.5">
                    * Esta classe não possui nenhum aluno matriculado no momento. Modifique o cadastro na tela de Turmas.
                  </p>
                )}
              </div>

              {/* Select Lesson studied */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Lição Ministrada
                </label>
                <select
                  required
                  value={licaoId}
                  onChange={(e) => setLicaoId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 cursor-pointer shadow-sm"
                >
                  <option value="">Qual lição foi ministrada?</option>
                  {licoes.map((l) => (
                    <option key={l.id} value={l.id}>{l.nome}</option>
                  ))}
                </select>
              </div>

              {/* Bible and Magazine toggles */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Trouxe a Bíblia?
                  </label>
                  <select
                    value={qtdBiblia}
                    onChange={(e) => setQtdBiblia(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value={0}>Não</option>
                    <option value={1}>Sim</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Trouxe a Revista EBD?
                  </label>
                  <select
                    value={qtdRevista}
                    onChange={(e) => setQtdRevista(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value={0}>Não</option>
                    <option value={1}>Sim</option>
                  </select>
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Data da Aula
                </label>
                <input
                  type="date"
                  required
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 cursor-pointer text-slate-350 font-mono"
                />
              </div>

              {/* CTAs */}
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!turmaId || !alunoId || !licaoId}
                  className={`rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 font-serif hover:bg-amber-400 cursor-pointer transition ${
                    (!turmaId || !alunoId || !licaoId) ? 'opacity-40 cursor-not-allowed bg-amber-500/20 text-slate-500' : ''
                  }`}
                >
                  {editingPresenca ? 'Salvar Lançamento' : 'Gravar Presença'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
