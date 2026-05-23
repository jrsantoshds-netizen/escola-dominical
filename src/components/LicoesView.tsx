import React, { useState } from 'react';
import { Licao, Turma, normalizeText } from '../types';
import { 
  Plus, 
  Search, 
  Trash2, 
  Pencil, 
  BookOpen, 
  Layers
} from 'lucide-react';
import { generateUUID } from '../db';

interface LicoesViewProps {
  licoes: Licao[];
  turmas: Turma[];
  onSave: (licao: Licao) => void;
  onDelete: (id: string) => void;
}

export default function LicoesView({
  licoes,
  turmas,
  onSave,
  onDelete
}: LicoesViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLicao, setEditingLicao] = useState<Licao | null>(null);
  const [licaoName, setLicaoName] = useState('');
  
  // Delete confirm overlay
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Checks if lesson is actively used in any class
  const getLinkedClass = (licaoId: string): string | null => {
    const linked = turmas.find((t) => t.licaoId === licaoId);
    return linked ? linked.nome : null;
  };

  const handleEditClick = (licao?: Licao) => {
    if (licao) {
      setEditingLicao(licao);
      setLicaoName(licao.nome);
    } else {
      setEditingLicao(null);
      setLicaoName('');
    }
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!licaoName.trim()) return;

    onSave({
      id: editingLicao ? editingLicao.id : generateUUID('l'),
      nome: licaoName.trim()
    });

    setIsModalOpen(false);
  };

  const filteredLicoes = licoes.filter((l) =>
    normalizeText(l.nome).includes(normalizeText(searchTerm))
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Tab/Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl md:text-3xl font-bold text-white font-serif">Lições Estudadas</h2>
            <span className="inline-flex items-center justify-center bg-amber-500/10 text-amber-500 font-mono text-sm px-2.5 py-0.5 rounded-full border border-amber-500/20 font-bold min-w-[28px] h-7">
              {licoes.length}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Currículo didático e apostilas aplicadas às turmas Dominicais</p>
        </div>

        <button
          onClick={() => handleEditClick()}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-slate-950 font-serif leading-none shadow-md transition-all hover:bg-amber-400 active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Nova Lição
        </button>
      </div>

      {/* Searching Bar */}
      <div className="relative max-w-md w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar lições por título curricular..."
          className="w-full pl-11 pr-4 py-2.5 bg-slate-900/60 border border-slate-850 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-colors"
        />
      </div>

      {/* Lessons Table/Logs */}
      {licoes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/10 p-12 text-center">
          <BookOpen className="h-12 w-12 mx-auto text-slate-600 mb-4 opacity-40" />
          <h4 className="text-base font-bold text-slate-300">Nenhuma lição cadastrada</h4>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Adicione as lições bíblicas trimestrais ou semanais que serão aplicadas e estudadas.
          </p>
          <button
            onClick={() => handleEditClick()}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-amber-500/10 px-4 py-2 text-xs font-bold text-amber-500 border border-amber-500/20 hover:bg-amber-500/20 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Adicionar Primeira Lição
          </button>
        </div>
      ) : filteredLicoes.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/15 p-8 text-center text-slate-500 text-sm font-medium">
          Nenhuma lição encontrada para sua busca.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/20 shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/60 border-b border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-4 font-semibold">Título Curricular da Lição</th>
                  <th className="py-3.5 px-4 font-semibold">Classe Atribuída</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-sm text-slate-300">
                {filteredLicoes.map((l) => {
                  const linkedClass = getLinkedClass(l.id);
                  return (
                    <tr key={l.id} className="hover:bg-slate-800/10 transition-colors">
                      <td className="py-4 px-4 font-semibold text-white flex items-center gap-3">
                        <BookOpen className="h-4 w-4 text-amber-500 shrink-0" />
                        <span>{l.nome}</span>
                      </td>
                      <td className="py-4 px-4">
                        {linkedClass ? (
                          <span className="inline-flex items-center gap-1 text-[10px] uppercase font-mono font-bold text-blue-400 bg-blue-500/5 border border-blue-500/10 px-2.5 py-0.5 rounded">
                            <Layers className="h-2.5 w-2.5" />
                            {linkedClass}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500 italic">Livre de classe</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex justify-end gap-1.5 font-mono">
                          <button
                            onClick={() => handleEditClick(l)}
                            className="bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-slate-400 hover:text-amber-500 hover:border-amber-550/20 cursor-pointer"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingId(l.id)}
                            className="bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-slate-400 hover:text-rose-500 hover:border-rose-550/20 cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl animate-scaleIn">
            <h3 className="text-lg font-bold font-serif text-white mb-5">
              {editingLicao ? 'Editar Lição' : 'Nova Lição'}
            </h3>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Título curricular / Tema da lição
                </label>
                <input
                  type="text"
                  required
                  value={licaoName}
                  onChange={(e) => setLicaoName(e.target.value)}
                  placeholder="Ex: Lição 1 - O Amor de Deus"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-650 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
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
                  className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 font-serif hover:bg-amber-400 cursor-pointer"
                >
                  {editingLicao ? 'Salvar Edição' : 'Cadastrar Lição'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL WITH LINK WARNING */}
      {deletingId && (() => {
        const activeLinkedClass = getLinkedClass(deletingId);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setDeletingId(null)}></div>
            <div className="relative w-full max-w-sm overflow-hidden rounded-xl border border-slate-800 bg-slate-900 p-6 text-center shadow-xl animate-scaleIn">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-white font-serif">Excluir Lição?</h4>
              
              {activeLinkedClass ? (
                <div className="mt-2.5 p-3 rounded-lg bg-orange-500/5 border border-orange-500/20 text-xs text-orange-400 text-left">
                  <p className="font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5 text-[10px]">
                    <Layers className="h-3.5 w-3.5 shrink-0" />
                    Aviso: Lição Ativa em Turma
                  </p>
                  Esta lição está ativamente vinculada à turma <strong className="text-white">"{activeLinkedClass}"</strong>. Se você a excluir, certifique-se de atribuir um novo currículo a ela.
                </div>
              ) : (
                <p className="text-sm text-slate-400 mt-2">
                  Você tem certeza? A lição será permanentemente apagada. Esta ação não poderá ser revertida.
                </p>
              )}

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
                  Confirmar Exclusão
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
