import React, { useState } from 'react';
import { Congregation, User, Aluno, Professor, Turma, normalizeText } from '../types';
import { 
  Plus, 
  Search, 
  Trash2, 
  Pencil,
  Church, 
  Users, 
  GraduationCap, 
  Presentation, 
  Layers,
  XCircle,
  CheckCircle,
  Building2,
  Calendar
} from 'lucide-react';

interface SedesViewProps {
  currentUser: User;
  congregacoes: Congregation[];
  usuarios: User[];
  alunos: Record<string, Aluno[]>;
  professores: Record<string, Professor[]>;
  turmas: Record<string, Turma[]>;
  onAddCongregation: (name: string) => void;
  onDeleteCongregation: (id: string, onSuccess: () => void) => void;
  onEditCongregation: (id: string, name: string) => void;
}

export default function SedesView({
  currentUser,
  congregacoes,
  usuarios,
  alunos,
  professores,
  turmas,
  onAddCongregation,
  onDeleteCongregation,
  onEditCongregation
}: SedesViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSedeName, setNewSedeName] = useState('');
  const [editingSede, setEditingSede] = useState<Congregation | null>(null);
  const [editSedeName, setEditSedeName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Delete confirm overlay
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreateSedeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const targetName = newSedeName.trim();
    if (!targetName) return;

    // Check duplicate
    const duplicate = congregacoes.find(
      (c) => normalizeText(c.nome) === normalizeText(targetName)
    );
    if (duplicate) {
      setErrorMessage('Esta sede/congregação já está cadastrada.');
      return;
    }

    onAddCongregation(targetName);
    setNewSedeName('');
    setSuccessMessage(`Sede "${targetName}" cadastrada com sucesso!`);
    setTimeout(() => {
      setIsModalOpen(false);
      setSuccessMessage('');
    }, 1500);
  };

  const handleEditSedeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!editingSede) return;

    const targetName = editSedeName.trim();
    if (!targetName) return;

    // Check duplicate
    const duplicate = congregacoes.find(
      (c) => c.id !== editingSede.id && normalizeText(c.nome) === normalizeText(targetName)
    );
    if (duplicate) {
      setErrorMessage('Esta sede/congregação já está cadastrada.');
      return;
    }

    onEditCongregation(editingSede.id, targetName);
    setSuccessMessage(`Sede atualizada para "${targetName}" com sucesso!`);
    setTimeout(() => {
      setEditingSede(null);
      setSuccessMessage('');
    }, 1500);
  };

  const handleDeleteSede = (id: string, name: string) => {
    setErrorMessage('');
    
    if (congregacoes.length <= 1) {
      setErrorMessage('O sistema EBD deve manter ao menos 1 congregação.');
      return;
    }

    // Check dependency: do any users count belong to this congregation?
    const hasUsers = usuarios.filter((u) => u.congregacaoId === id);
    if (hasUsers.length > 0) {
      setErrorMessage(`Não é possível excluir! Remova ou altere os usuários que pertencem à congregação "${name}" antes.`);
      return;
    }

    onDeleteCongregation(id, () => {
      setDeletingId(null);
    });
  };

  const filteredCongregacoes = congregacoes.filter((c) =>
    normalizeText(c.nome).includes(normalizeText(searchTerm))
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl md:text-3xl font-bold text-white font-serif">Sedes e Congregações</h2>
            <span className="inline-flex items-center justify-center bg-amber-500/10 text-amber-500 font-mono text-sm px-2.5 py-0.5 rounded-full border border-amber-500/20 font-bold min-w-[28px] h-7">
              {congregacoes.length}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Sedes administrativas e divisões regionais da congregação IEADTAM</p>
        </div>

        {currentUser.role === 'admin' ? (
          <button
            onClick={() => {
              setNewSedeName('');
              setErrorMessage('');
              setSuccessMessage('');
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-slate-950 font-serif leading-none shadow-md transition-all hover:bg-amber-400 active:scale-95 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            Cadastrar Sede
          </button>
        ) : (
          <div className="text-[11px] font-semibold text-slate-500 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
            Apenas administradores podem registrar sedes.
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 max-w-2xl">
          <XCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Searching Bar */}
      <div className="relative max-w-md w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar sede ou congregação..."
          className="w-full pl-11 pr-4 py-2.5 bg-slate-900/60 border border-slate-850 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-colors"
        />
      </div>

      {/* Grid structure for Sedes/Congregations */}
      {filteredCongregacoes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-850 bg-slate-900/10 p-12 text-center">
          <Church className="h-12 w-12 mx-auto text-slate-650 mb-4 opacity-40" />
          <h4 className="text-base font-bold text-slate-300">Nenhuma congregação encontrada</h4>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Não há registros de sedes ou congregações ativas para os parâmetros buscados.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCongregacoes.map((c) => {
            const studentCount = (alunos[c.id] || []).length;
            const profCount = (professores[c.id] || []).length;
            const classCount = (turmas[c.id] || []).length;
            const userUsers = usuarios.filter((u) => u.congregacaoId === c.id).length;

            return (
              <div 
                key={c.id}
                className="relative overflow-hidden rounded-2xl border border-slate-850 bg-slate-900/30 p-5 shadow-sm hover:border-amber-500/20 hover:bg-slate-900/50 transition duration-200 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Card Title Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/5 text-amber-500 border border-amber-500/10 shadow-inner">
                        <Church className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-serif text-base font-bold text-white line-clamp-1">{c.nome}</h3>
                        <p className="text-[10px] text-slate-500 font-mono uppercase font-bold tracking-wider">{c.id}</p>
                      </div>
                    </div>

                    {/* Sede actions */}
                    {currentUser.role === 'admin' && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingSede(c);
                            setEditSedeName(c.nome);
                            setErrorMessage('');
                            setSuccessMessage('');
                          }}
                          className="p-1 px-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-amber-500 hover:bg-amber-505/5 hover:border-amber-505/10 transition cursor-pointer"
                          title="Editar Nome da Sede"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        {congregacoes.length > 1 && (
                          <button
                            onClick={() => setDeletingId(c.id)}
                            className="p-1 px-1.5 rounded-lg border border-slate-800 text-slate-500 hover:text-rose-455 hover:bg-rose-500/5 hover:border-rose-500/10 transition cursor-pointer"
                            title="Excluir Sede"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Indicators counts blocks */}
                  <div className="grid grid-cols-3 gap-2 py-1 pt-2">
                    <div className="rounded-xl bg-slate-950/40 border border-slate-850/40 p-2 text-center">
                      <div className="text-sm font-black text-amber-505 font-mono">{studentCount}</div>
                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-500 leading-none block mt-0.5">Alunos</span>
                    </div>

                    <div className="rounded-xl bg-slate-950/40 border border-slate-850/40 p-2 text-center">
                      <div className="text-sm font-black text-emerald-400 font-mono">{profCount}</div>
                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-500 leading-none block mt-0.5">Prof</span>
                    </div>

                    <div className="rounded-xl bg-slate-950/40 border border-slate-850/40 p-2 text-center">
                      <div className="text-sm font-black text-indigo-400 font-mono">{classCount}</div>
                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-500 leading-none block mt-0.5">Turmas</span>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-450 font-semibold border-t border-slate-850/50 pt-2 flex justify-between items-center bg-slate-900/10">
                    <span>Usuários Cadastrados</span>
                    <span className="font-mono text-white bg-slate-950 px-2 py-0.5 rounded-full border border-slate-805">{userUsers}</span>
                  </div>
                </div>

                {/* Confirm Overlay de Delete */}
                {deletingId === c.id && (
                  <div className="absolute inset-0 z-10 p-5 bg-slate-950/95 flex flex-col justify-between rounded-2xl animate-scaleIn">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-rose-500 flex items-center gap-1.5 leading-none">
                        <Trash2 className="h-4 w-4" />
                        Confirmar Exclusão
                      </h4>
                      <p className="text-[11px] text-slate-350 leading-relaxed mt-2.5 font-sans">
                        Tem certeza que de excluir permanentemente a Sede <strong>"{c.nome}"</strong>? Todos os alunos, professoras, turmas e registros associados serão apagados do banco local!
                      </p>
                    </div>

                    <div className="flex gap-2.5 pt-2">
                      <button
                        onClick={() => setDeletingId(null)}
                        className="flex-1 py-1.5 text-center text-xs font-bold text-slate-400 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 cursor-pointer transition"
                      >
                        Manter
                      </button>
                      <button
                        onClick={() => handleDeleteSede(c.id, c.nome)}
                        className="flex-1 py-1.5 text-center text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg cursor-pointer transition"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Creation Sede Panel */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>

          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl animate-scaleIn">
            <h3 className="text-lg font-bold font-serif text-white mb-4">
              Registrar Nova Sede/Congregação
            </h3>

            {successMessage ? (
              <div className="py-6 text-center space-y-3">
                <CheckCircle className="h-10 w-10 text-emerald-400 mx-auto" />
                <p className="text-sm font-bold text-white leading-normal">{successMessage}</p>
              </div>
            ) : (
              <form onSubmit={handleCreateSedeSubmit} className="space-y-4">
                {errorMessage && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
                    <XCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Nome da Sede / Congregação
                  </label>
                  <input
                    type="text"
                    required
                    value={newSedeName}
                    onChange={(e) => setNewSedeName(e.target.value)}
                    placeholder="Ex: Tarauacá Sede ou Vila Nova"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1.5">
                    * Ao cadastrar, o sistema irá provisionar novos registros em branco para esta Sede.
                  </p>
                </div>

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
                    className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 font-serif hover:bg-amber-400 cursor-pointer"
                  >
                    Salvar Sede
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal Editing Sede Panel */}
      {editingSede && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setEditingSede(null)}></div>

          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl animate-scaleIn">
            <h3 className="text-lg font-bold font-serif text-white mb-4">
              Editar Nome da Sede / Congregação
            </h3>

            {successMessage ? (
              <div className="py-6 text-center space-y-3">
                <CheckCircle className="h-10 w-10 text-emerald-400 mx-auto" />
                <p className="text-sm font-bold text-white leading-normal">{successMessage}</p>
              </div>
            ) : (
              <form onSubmit={handleEditSedeSubmit} className="space-y-4">
                {errorMessage && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
                    <XCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Nome da Sede / Congregação
                  </label>
                  <input
                    type="text"
                    required
                    value={editSedeName}
                    onChange={(e) => setEditSedeName(e.target.value)}
                    placeholder="Ex: Tarauacá Sede ou Vila Nova"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setEditingSede(null)}
                    className="rounded-lg border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 font-serif hover:bg-amber-400 cursor-pointer"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
