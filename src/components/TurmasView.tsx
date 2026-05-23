import React, { useState } from 'react';
import { Turma, Aluno, Licao } from '../types';
import { 
  Plus, 
  Trash2, 
  Pencil, 
  BookOpen, 
  Users, 
  Lock, 
  CheckCircle, 
  Layers,
  HelpCircle,
  HelpCircle as QuestionIcon
} from 'lucide-react';
import { generateUUID } from '../db';

interface TurmasViewProps {
  turmas: Turma[];
  alunos: Aluno[];
  licoes: Licao[];
  onSave: (turma: Turma) => void;
  onDelete: (id: string) => void;
}

export default function TurmasView({
  turmas,
  alunos,
  licoes,
  onSave,
  onDelete
}: TurmasViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTurma, setEditingTurma] = useState<Turma | null>(null);

  // Form States
  const [nome, setNome] = useState('');
  const [licaoId, setLicaoId] = useState('');
  const [selectedAlunoIds, setSelectedAlunoIds] = useState<string[]>([]);
  
  // Exclude state confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Helper: Find which students are occupied in other classes (excluding the current one being edited)
  const getOccupiedStudentsMap = (currentTurmaId?: string): Record<string, string> => {
    const map: Record<string, string> = {};
    turmas.forEach((t) => {
      if (t.id === currentTurmaId) return; // Skip current editing class
      (t.alunoIds || []).forEach((aid) => {
        map[aid] = t.nome; // Student is occupied in class t.nome
      });
    });
    return map;
  };

  const handleEditClick = (turma?: Turma) => {
    if (turma) {
      setEditingTurma(turma);
      setNome(turma.nome);
      setLicaoId(turma.licaoId);
      setSelectedAlunoIds(turma.alunoIds || []);
    } else {
      setEditingTurma(null);
      setNome('');
      setLicaoId('');
      setSelectedAlunoIds([]);
    }
    setIsModalOpen(true);
  };

  const handleCheckboxToggle = (alunoId: string) => {
    setSelectedAlunoIds((prev) => {
      if (prev.includes(alunoId)) {
        return prev.filter((id) => id !== alunoId);
      } else {
        return [...prev, alunoId];
      }
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    onSave({
      id: editingTurma ? editingTurma.id : generateUUID('t'),
      nome: nome.trim(),
      licaoId: licaoId,
      alunoIds: selectedAlunoIds
    });

    setIsModalOpen(false);
  };

  const occupiedMap = getOccupiedStudentsMap(editingTurma?.id);

  // Separate list into available students (either in this class right now, or unlinked) and occupied students (linked elsewhere)
  const availableStudents = alunos.filter((a) => !occupiedMap[a.id]);
  const lockedStudents = alunos.filter((a) => !!occupiedMap[a.id]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Tab/Page Title Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl md:text-3xl font-bold text-white font-serif">Turmas</h2>
            <span className="inline-flex items-center justify-center bg-amber-500/10 text-amber-500 font-mono text-sm px-2.5 py-0.5 rounded-full border border-amber-500/20 font-bold min-w-[28px] h-7">
              {turmas.length}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Gestão de turmas, matrículas e lições aplicadas</p>
        </div>

        <button
          onClick={() => handleEditClick()}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-slate-950 font-serif leading-none shadow-md transition-all hover:bg-amber-400 active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Nova Turma
        </button>
      </div>

      {/* Main Grid Checklist List Layout */}
      {turmas.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/10 p-12 text-center">
          <Users className="h-12 w-12 mx-auto text-slate-600 mb-4 opacity-40" />
          <h4 className="text-base font-bold text-slate-300">Nenhuma turma cadastrada</h4>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Abra classes dedicadas (como Jovens, Adultos, Crianças) para organizar as presenças.
          </p>
          <button
            onClick={() => handleEditClick()}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-amber-500/10 px-4 py-2 text-xs font-bold text-amber-500 border border-amber-500/20 hover:bg-amber-500/20 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Cadastrar Primeira Turma
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {turmas.map((t) => {
            const currentLicao = licoes.find((l) => l.id === t.licaoId);
            
            // Map student objects
            const linkedAlunList = (t.alunoIds || [])
              .map((id) => alunos.find((a) => a.id === id))
              .filter(Boolean) as Aluno[];

            return (
              <div 
                key={t.id} 
                className="rounded-2xl border border-slate-850 bg-slate-900/40 p-5 shrink-0 flex flex-col justify-between hover:border-amber-500/20 transition-all shadow hover:shadow-lg hover:shadow-black/10"
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-white leading-none">{t.nome}</h3>
                      <p className="inline-flex items-center gap-1 text-xs text-amber-500 font-semibold mt-2.5">
                        <BookOpen className="h-3.5 w-3.5" />
                        {currentLicao ? currentLicao.nome : 'Sem lição curricular'}
                      </p>
                    </div>
                    {/* Control edits */}
                    <div className="flex items-center gap-1 font-mono">
                      <button
                        onClick={() => handleEditClick(t)}
                        className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-amber-500 hover:border-amber-500/10 transition-colors cursor-pointer"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingId(t.id)}
                        className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-rose-500 hover:border-rose-500/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Student Lists for Class */}
                  <div className="border-t border-slate-800/80 pt-4 mt-3">
                    <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-slate-500" />
                      Alunos Matriculados ({linkedAlunList.length})
                    </h5>
                    
                    {linkedAlunList.length === 0 ? (
                      <em className="text-xs text-slate-500 block py-1.5 font-normal">Nenhum aluno cadastrado nesta turma</em>
                    ) : (
                      <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
                        {linkedAlunList.map((alno) => (
                          <div 
                            key={alno.id} 
                            className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg bg-slate-950/40 border border-slate-850/30 text-xs text-slate-300 font-medium"
                          >
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-[10px] font-bold text-amber-500">
                              {alno.nome.charAt(0).toUpperCase()}
                            </span>
                            <span className="truncate">{alno.nome}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* COMPONENT INTERACTIVE DIALOG MODAL: ADD / OUTLINE EDIT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl animate-scaleIn">
            <h3 className="text-lg font-bold font-serif text-white mb-4">
              {editingTurma ? 'Editar Turma' : 'Nova Turma'}
            </h3>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Nome da Classe / Turma
                </label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Classe de Jovens Filadélfia"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-650 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Lição Curricular Aplicada
                </label>
                <select
                  required
                  value={licaoId}
                  onChange={(e) => setLicaoId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="">Selecione a lição principal</option>
                  {licoes.map((l) => (
                    <option key={l.id} value={l.id}>{l.nome}</option>
                  ))}
                </select>
              </div>

              {/* STU checklist with interactive locking */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Relação de Alunos
                </label>
                
                <div className="text-[11px] text-emerald-400 font-medium mb-2 leading-none">
                  {availableStudents.length} alunos livres ou nesta turma — {lockedStudents.length} vinculados em outras classes.
                </div>

                <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 p-2 space-y-1">
                  {alunos.length === 0 ? (
                    <div className="text-center text-xs text-slate-650 py-6">
                      Nenhum aluno cadastrado no sistema EBD.
                    </div>
                  ) : (
                    <>
                      {/* Available section */}
                      {availableStudents.map((a) => {
                        const isChecked = selectedAlunoIds.includes(a.id);
                        return (
                          <label 
                            key={a.id} 
                            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition ${
                              isChecked ? 'bg-amber-500/10 border border-amber-500/20' : 'hover:bg-slate-900 border border-transparent'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleCheckboxToggle(a.id)}
                              className="h-4 w-4 accent-amber-500 cursor-pointer"
                            />
                            <span className={`text-xs ${isChecked ? 'text-amber-400 font-semibold' : 'text-slate-350'}`}>
                              {a.nome}
                            </span>
                          </label>
                        );
                      })}

                      {/* Locked section */}
                      {lockedStudents.map((a) => {
                        const assignedClasses = occupiedMap[a.id];
                        return (
                          <div 
                            key={a.id} 
                            className="flex items-center justify-between p-2 rounded-lg bg-slate-900/50 border border-slate-900/90 select-none opacity-40 cursor-not-allowed"
                            title={`Aluno matriculado na turma: ${assignedClasses}`}
                          >
                            <div className="flex items-center gap-3">
                              <Lock className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                              <span className="text-xs text-slate-400 line-through">
                                {a.nome}
                              </span>
                            </div>
                            <span className="text-[10px] uppercase font-bold text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded leading-none flex items-center gap-1 border border-orange-500/15">
                              <Lock className="h-2.5 w-2.5" />
                              {assignedClasses}
                            </span>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              </div>

              {/* CTAs */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800/60">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 font-serif hover:bg-amber-400 cursor-pointer"
                >
                  {editingTurma ? 'Salvar Edições' : 'Criar Turma'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE DIALOG CONTAINER */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setDeletingId(null)}></div>
          <div className="relative w-full max-w-sm overflow-hidden rounded-xl border border-slate-800 bg-slate-900 p-6 text-center shadow-xl animate-scaleIn">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto mb-4">
              <Plus className="h-5 w-5 rotate-45" />
            </div>
            <h4 className="text-base font-bold text-white font-serif">Excluir Turma?</h4>
            <p className="text-sm text-slate-400 mt-2">
              Você tem certeza? A exclusão removerá todas as frequências Dominicais e relatórios financeiros desta turma. Os alunos cadastrados serão desvinculados e liberados para novas classes.
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
