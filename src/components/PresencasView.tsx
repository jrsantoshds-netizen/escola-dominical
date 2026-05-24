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

interface StudentBatchStatus {
  alunoId: string;
  nome: string;
  presente: boolean;
  qtdBiblia: number;
  qtdRevista: number;
  existingId?: string;
}

interface PresencasViewProps {
  presencas: Presenca[];
  turmas: Turma[];
  alunos: Aluno[];
  licoes: Licao[];
  onSave: (presenca: Presenca) => void;
  onSaveMultiple?: (presencas: Presenca[], idsToDelete?: string[]) => void;
  onDelete: (id: string) => void;
}

export default function PresencasView({
  presencas,
  turmas,
  alunos,
  licoes,
  onSave,
  onSaveMultiple,
  onDelete
}: PresencasViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPresenca, setEditingPresenca] = useState<Presenca | null>(null);

  // Form States
  const [isBatchMode, setIsBatchMode] = useState(true);
  const [studentStatusList, setStudentStatusList] = useState<StudentBatchStatus[]>([]);

  const [turmaId, setTurmaId] = useState('');
  const [alunoId, setAlunoId] = useState('');
  const [licaoId, setLicaoId] = useState('');
  const [qtdBiblia, setQtdBiblia] = useState(1); // 0 or 1
  const [qtdRevista, setQtdRevista] = useState(1); // 0 or 1
  const [data, setData] = useState(() => new Date().toISOString().split('T')[0]);

  // Handle cascading student matches on Class select
  const [filteredAlunosSelect, setFilteredAlunosSelect] = useState<Aluno[]>([]);

  // Handle cascading student matches on Class select for Individual entry
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

  // Load batch students on class or date select
  useEffect(() => {
    if (isBatchMode && turmaId) {
      const selectedTurma = turmas.find((t) => t.id === turmaId);
      if (selectedTurma) {
        const classAlunoIds = selectedTurma.alunoIds || [];
        const matchedAlunos = classAlunoIds
          .map((aid) => alunos.find((a) => a.id === aid))
          .filter(Boolean) as Aluno[];

        const existingForDate = presencas.filter(
          (p) => p.turmaId === turmaId && p.data === data
        );

        const list = matchedAlunos.map((a) => {
          const existing = existingForDate.find((p) => p.alunoId === a.id);
          if (existing) {
            return {
              alunoId: a.id,
              nome: a.nome,
              presente: true,
              qtdBiblia: existing.qtdBiblia,
              qtdRevista: existing.qtdRevista,
              existingId: existing.id,
            };
          }
          return {
            alunoId: a.id,
            nome: a.nome,
            presente: true, // Default to Present for quick class registry
            qtdBiblia: 1,
            qtdRevista: 1,
          };
        });
        setStudentStatusList(list);

        // Auto-assign lesson associated with this class
        if (selectedTurma.licaoId) {
          setLicaoId(selectedTurma.licaoId);
        }
      } else {
        setStudentStatusList([]);
      }
    } else {
      setStudentStatusList([]);
    }
  }, [turmaId, isBatchMode, data, turmas, alunos, presencas]);


  const handleEditClick = (p?: Presenca) => {
    if (p) {
      setEditingPresenca(p);
      setIsBatchMode(false); // edit is always single/individual
      setTurmaId(p.turmaId);
      setAlunoId(p.alunoId);
      setLicaoId(p.licaoId);
      setQtdBiblia(p.qtdBiblia);
      setQtdRevista(p.qtdRevista);
      setData(p.data);
    } else {
      setEditingPresenca(null);
      setIsBatchMode(true); // default to batch mode for super fast registry!
      setTurmaId('');
      setAlunoId('');
      setLicaoId('');
      setQtdBiblia(1);
      setQtdRevista(1);
      setData(new Date().toISOString().split('T')[0]);
      setStudentStatusList([]);
    }
    setIsModalOpen(true);
  };

  const toggleStudentPresence = (index: number) => {
    setStudentStatusList((prev) =>
      prev.map((item, idx) => {
        if (idx === index) {
          const newPresente = !item.presente;
          return {
            ...item,
            presente: newPresente,
            qtdBiblia: newPresente ? 1 : 0,
            qtdRevista: newPresente ? 1 : 0,
          };
        }
        return item;
      })
    );
  };

  const toggleStudentBible = (index: number) => {
    setStudentStatusList((prev) =>
      prev.map((item, idx) => {
        if (idx === index) {
          return { ...item, qtdBiblia: item.qtdBiblia === 1 ? 0 : 1 };
        }
        return item;
      })
    );
  };

  const toggleStudentMagazine = (index: number) => {
    setStudentStatusList((prev) =>
      prev.map((item, idx) => {
        if (idx === index) {
          return { ...item, qtdRevista: item.qtdRevista === 1 ? 0 : 1 };
        }
        return item;
      })
    );
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isBatchMode) {
      if (!turmaId || !licaoId || !data) return;

      const presencasToSave: Presenca[] = [];
      const idsToDelete: string[] = [];

      studentStatusList.forEach((st) => {
        if (st.presente) {
          presencasToSave.push({
            id: st.existingId || generateUUID('pr'),
            turmaId,
            alunoId: st.alunoId,
            licaoId,
            qtdBiblia: st.qtdBiblia,
            qtdRevista: st.qtdRevista,
            data,
          });
        } else if (st.existingId) {
          idsToDelete.push(st.existingId);
        }
      });

      if (onSaveMultiple) {
        onSaveMultiple(presencasToSave, idsToDelete);
      } else {
        presencasToSave.forEach((p) => onSave(p));
        idsToDelete.forEach((id) => onDelete(id));
      }

      setIsModalOpen(false);
      return;
    }

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          
          <div className={`relative w-full ${isBatchMode ? 'max-w-2xl' : 'max-w-md'} max-h-[94vh] overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-5 sm:p-6 shadow-[0_0_30px_rgba(0,0,0,0.6)] animate-scaleIn custom-scrollbar`}>
            <h3 className="text-xl font-bold font-serif text-white mb-4 select-none">
              {editingPresenca ? 'Editar Registro' : 'Lançar Frequência'}
            </h3>

            {/* Mode Switching Tab (Only on new additions) */}
            {!editingPresenca && (
              <div className="flex bg-slate-950 p-1 rounded-xl mb-5 border border-slate-700 select-none">
                <button
                  type="button"
                  onClick={() => setIsBatchMode(true)}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer select-none outline-none ${
                    isBatchMode
                      ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold'
                      : 'text-slate-200 hover:text-white hover:bg-slate-900/50'
                  }`}
                >
                  Chamada Coletiva (por Turma)
                </button>
                <button
                  type="button"
                  onClick={() => setIsBatchMode(false)}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer select-none outline-none ${
                    !isBatchMode
                      ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold'
                      : 'text-slate-200 hover:text-white hover:bg-slate-900/50'
                  }`}
                >
                  Lançamento Individual
                </button>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {isBatchMode ? (
                // BATCH MODE FORM
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Select class */}
                    <div className="md:col-span-1">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-1.5">
                        Turma / Classe
                      </label>
                      <select
                        required
                        value={turmaId}
                        onChange={(e) => setTurmaId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer shadow-sm"
                      >
                        <option value="">Selecione...</option>
                        {turmas.map((t) => (
                          <option key={t.id} value={t.id}>{t.nome}</option>
                        ))}
                      </select>
                    </div>

                    {/* Select Lesson studied */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-1.5">
                        Lição Ministrada
                      </label>
                      <select
                        required
                        value={licaoId}
                        onChange={(e) => setLicaoId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer shadow-sm"
                      >
                        <option value="">Qual lição?</option>
                        {licoes.map((l) => (
                          <option key={l.id} value={l.id}>{l.nome}</option>
                        ))}
                      </select>
                    </div>

                    {/* Date */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-1.5">
                        Data da Aula
                      </label>
                      <input
                        type="date"
                        required
                        value={data}
                        onChange={(e) => setData(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer text-slate-100 font-mono"
                      />
                    </div>
                  </div>

                  {/* Student Roll Call List wrapper with checkboxes & toggles */}
                  {turmaId && (
                    <div className="border border-slate-700 bg-slate-950/70 rounded-xl p-3">
                      <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-zinc-200 pb-2 mb-2 border-b border-slate-700">
                        <span>Aluno da Classe ({studentStatusList.length})</span>
                        <div className="flex items-center gap-7 pr-3">
                          <span className="w-12 text-center text-[10px]">Bíblia</span>
                          <span className="w-12 text-center text-[10px]">Revista</span>
                          <span className="w-20 text-center text-[10px]">Chamada</span>
                        </div>
                      </div>

                      {studentStatusList.length === 0 ? (
                        <p className="text-xs text-center text-slate-400 py-6">
                          Nenhum aluno cadastrado nesta turma.
                        </p>
                      ) : (
                        <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                          {studentStatusList.map((st, index) => (
                            <div key={st.alunoId} className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
                              st.presente 
                                ? 'bg-slate-900 border-slate-700' 
                                : 'bg-slate-950/30 border-slate-900/40 opacity-50'
                            }`}>
                              <span className={`text-xs font-bold truncate pr-2 max-w-[140px] sm:max-w-xs ${st.presente ? 'text-white' : 'text-slate-400 line-through'}`}>
                                {st.nome}
                              </span>
                              <div className="flex items-center gap-3">
                                {/* Biblia Toggle */}
                                <button
                                  type="button"
                                  disabled={!st.presente}
                                  onClick={() => toggleStudentBible(index)}
                                  className={`w-12 py-1.5 text-[10px] font-extrabold rounded border transition-all cursor-pointer ${
                                    !st.presente 
                                      ? 'bg-transparent text-slate-700 border-transparent cursor-not-allowed'
                                      : st.qtdBiblia > 0
                                      ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                                      : 'bg-slate-950 text-slate-300 border-slate-700 hover:bg-slate-900 hover:text-white'
                                  }`}
                                >
                                  {st.qtdBiblia > 0 ? 'Sim' : 'Não'}
                                </button>

                                {/* Revista Toggle */}
                                <button
                                  type="button"
                                  disabled={!st.presente}
                                  onClick={() => toggleStudentMagazine(index)}
                                  className={`w-12 py-1.5 text-[10px] font-extrabold rounded border transition-all cursor-pointer ${
                                    !st.presente 
                                      ? 'bg-transparent text-slate-700 border-transparent cursor-not-allowed'
                                      : st.qtdRevista > 0
                                      ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                                      : 'bg-slate-950 text-slate-300 border-slate-700 hover:bg-slate-900 hover:text-white'
                                  }`}
                                >
                                  {st.qtdRevista > 0 ? 'Sim' : 'Não'}
                                </button>

                                {/* Presence Checkbox Switch */}
                                <button
                                  type="button"
                                  onClick={() => toggleStudentPresence(index)}
                                  className={`flex items-center justify-center gap-1 w-20 py-1.5 text-[10px] font-extrabold rounded border transition-all cursor-pointer ${
                                    st.presente
                                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 hover:bg-emerald-400'
                                      : 'bg-slate-950 text-slate-300 border-slate-700 hover:text-rose-400 hover:border-rose-900'
                                  }`}
                                >
                                  {st.presente ? (
                                    <>
                                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                                      <span>Presente</span>
                                    </>
                                  ) : (
                                    <>
                                      <X className="h-2.5 w-2.5 stroke-[3]" />
                                      <span>Ausente</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {!turmaId && (
                    <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/20 p-8 text-center text-xs text-slate-300">
                      Selecione uma turma acima para carregar a lista de alunos vinculados e registrar a presença mútua rapidamente.
                    </div>
                  )}
                </div>
              ) : (
                // SINGLE MODE FORM
                <div className="space-y-4">
                  {/* Select class */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-1.5">
                      Turma / Classe
                    </label>
                    <select
                      required
                      value={turmaId}
                      onChange={(e) => setTurmaId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 cursor-pointer shadow-sm font-medium"
                    >
                      <option value="">Selecione a turma...</option>
                      {turmas.map((t) => (
                        <option key={t.id} value={t.id}>{t.nome}</option>
                      ))}
                    </select>
                  </div>

                  {/* Select student matching cascades list */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-1.5">
                      Aluno da Classe
                    </label>
                    <select
                      required
                      disabled={!turmaId}
                      value={alunoId}
                      onChange={(e) => setAlunoId(e.target.value)}
                      className={`w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 cursor-pointer shadow-sm font-medium ${
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
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-1.5">
                      Lição Ministrada
                    </label>
                    <select
                      required
                      value={licaoId}
                      onChange={(e) => setLicaoId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 cursor-pointer shadow-sm font-medium"
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
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-1.5">
                        Trouxe a Bíblia?
                      </label>
                      <select
                        value={qtdBiblia}
                        onChange={(e) => setQtdBiblia(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 cursor-pointer font-medium"
                      >
                        <option value={0}>Não</option>
                        <option value={1}>Sim</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-1.5">
                        Trouxe a Revista EBD?
                      </label>
                      <select
                        value={qtdRevista}
                        onChange={(e) => setQtdRevista(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 cursor-pointer font-medium"
                      >
                        <option value={0}>Não</option>
                        <option value={1}>Sim</option>
                      </select>
                    </div>
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-1.5">
                      Data da Aula
                    </label>
                    <input
                      type="date"
                      required
                      value={data}
                      onChange={(e) => setData(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 cursor-pointer text-slate-100 font-mono"
                    />
                  </div>
                </div>
              )}

              {/* CTAs */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 mt-6 md:mt-8">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-slate-700 px-5 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-800 hover:text-white cursor-pointer transition select-none"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={
                    isBatchMode 
                      ? (!turmaId || !licaoId || studentStatusList.length === 0)
                      : (!turmaId || !alunoId || !licaoId)
                  }
                  className={`rounded-lg px-5 py-2.5 text-xs font-bold font-serif cursor-pointer transition-all ${
                    (isBatchMode 
                      ? (!turmaId || !licaoId || studentStatusList.length === 0)
                      : (!turmaId || !alunoId || !licaoId))
                      ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed opacity-90' 
                      : 'bg-amber-500 text-slate-950 hover:bg-amber-400 font-extrabold shadow-md shadow-amber-500/10'
                  }`}
                >
                  {isBatchMode 
                    ? `Salvar Chamada (${studentStatusList.filter(s => s.presente).length})` 
                    : (editingPresenca ? 'Salvar Lançamento' : 'Gravar Presença')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
