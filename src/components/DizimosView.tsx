import React, { useState } from 'react';
import { Dizimo, Turma, normalizeText } from '../types';
import { 
  Plus, 
  Search, 
  Trash2, 
  Pencil, 
  Coins, 
  BookOpen, 
  Calendar,
  Filter,
  DollarSign
} from 'lucide-react';
import { generateUUID, formatDateBr } from '../db';

interface DizimosViewProps {
  dizimos: Dizimo[];
  turmas: Turma[];
  onSave: (dizimo: Dizimo) => void;
  onDelete: (id: string) => void;
}

export default function DizimosView({
  dizimos,
  turmas,
  onSave,
  onDelete
}: DizimosViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDizimo, setEditingDizimo] = useState<Dizimo | null>(null);

  // Form states
  const [turmaId, setTurmaId] = useState('');
  const [valor, setValor] = useState('');
  const [data, setData] = useState(() => new Date().toISOString().split('T')[0]);

  const handleEditClick = (d?: Dizimo) => {
    if (d) {
      setEditingDizimo(d);
      setTurmaId(d.turmaId);
      setValor(d.valor.toString());
      setData(d.data);
    } else {
      setEditingDizimo(null);
      setTurmaId('');
      setValor('');
      setData(new Date().toISOString().split('T')[0]);
    }
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!turmaId || !valor || isNaN(Number(valor)) || !data) return;

    onSave({
      id: editingDizimo ? editingDizimo.id : generateUUID('d'),
      turmaId,
      valor: parseFloat(valor),
      data
    });

    setIsModalOpen(false);
  };

  const findTurmaName = (id: string) => {
    return turmas.find((t) => t.id === id)?.nome || '—';
  };

  const totalDizimosVal = dizimos.reduce((sum, d) => sum + Number(d.valor || 0), 0);

  const filteredLogs = dizimos.filter((d) => {
    const className = normalizeText(findTurmaName(d.turmaId));
    const query = normalizeText(searchTerm);

    const matchesSearch = className.includes(query);
    const matchesDate = !filterDate || d.data === filterDate;

    return matchesSearch && matchesDate;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Title Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl md:text-3xl font-bold text-white font-serif">Livro de Dízimos</h2>
            <span className="inline-flex items-center justify-center bg-orange-500/10 text-orange-400 font-mono text-sm px-2.5 py-0.5 rounded-full border border-orange-500/20 font-bold min-w-[28px] h-7">
              {dizimos.length}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Lançamento e fechamento de ofertas e dízimos por classe dominical</p>
        </div>

        <button
          onClick={() => handleEditClick()}
          className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-slate-950 font-serif leading-none shadow-md transition-all hover:bg-orange-400 active:scale-95 cursor-pointer self-start sm:self-auto hover:shadow-orange-500/10"
        >
          <Plus className="h-4 w-4" />
          Lançar Dízimo
        </button>
      </div>

      {/* Bento Stats Offer Box */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-6 max-w-sm">
        {/* Accent strip */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-orange-500"></div>
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
          <Coins className="h-4 w-4 text-orange-500" />
          Arrecadação de dízimo acumulada
        </div>
        <div className="text-3xl font-extrabold text-white font-serif">
          R$ {totalDizimosVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </div>
      </div>

      {/* Query Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search input bar */}
        <div className="relative max-w-md w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome da classe/turma..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-900/60 border border-slate-850 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
          />
        </div>

        {/* Date Filters Bar */}
        <div className="relative max-w-[240px] w-full">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4" />
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-900/60 border border-slate-850 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500 cursor-pointer text-slate-350"
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

      {/* Main Table Records log */}
      {dizimos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/10 p-12 text-center">
          <Coins className="h-12 w-12 mx-auto text-slate-600 mb-4 opacity-40" />
          <h4 className="text-base font-bold text-slate-300">Nenhum dízimo lançado</h4>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Lance dízimos ou ofertas de assembleia arrecadados pelas turmas Dominicais para gerar os relatórios financeiros.
          </p>
          <button
            onClick={() => handleEditClick()}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-orange-500/10 px-4 py-2 text-xs font-bold text-orange-400 border border-orange-500/20 hover:bg-orange-500/20 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Lançar Primeiro Dízimo
          </button>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/15 p-8 text-center text-slate-500 text-sm font-medium">
          Nenhuma contribuição corresponde aos termos pesquisados ou data informada.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/20 shadow">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/60 border-b border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-4 font-semibold">Classe / Turma</th>
                  <th className="py-3.5 px-4 font-semibold">Valor Contribuído</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Data Lançamento</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-sm text-slate-300">
                {filteredLogs.slice().reverse().map((d) => (
                  <tr key={d.id} className="hover:bg-slate-800/10 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                      {findTurmaName(d.turmaId)}
                    </td>
                    <td className="py-3.5 px-4 font-black text-emerald-400 leading-none">
                      R$ {d.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-xs text-slate-400 font-semibold">{formatDateBr(d.data)}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex justify-end gap-1.5 font-mono">
                        <button
                          onClick={() => handleEditClick(d)}
                          className="bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-400 hover:text-orange-500 cursor-pointer"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(d.id)}
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

      {/* COMPONENT INTERACTIVE DIALOG MODAL: ADD / UPDATE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl animate-scaleIn">
            <h3 className="text-lg font-bold font-serif text-white mb-5">
              {editingDizimo ? 'Editar Dízimo' : 'Novo Dízimo de Classe'}
            </h3>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Turma Contribuinte
                </label>
                <select
                  required
                  value={turmaId}
                  onChange={(e) => setTurmaId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 cursor-pointer shadow-sm"
                >
                  <option value="">Selecione a turma...</option>
                  {turmas.map((t) => (
                    <option key={t.id} value={t.id}>{t.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Valor Contribuído (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    placeholder="250.00"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-slate-650 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Data da Aula / Contribuição
                </label>
                <input
                  type="date"
                  required
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 cursor-pointer text-slate-350 font-mono"
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
                  className="rounded-lg bg-orange-500 px-4 py-2 text-xs font-bold text-slate-950 font-serif hover:bg-orange-400 cursor-pointer"
                >
                  {editingDizimo ? 'Salvar Lançamento' : 'Gravar Dízimo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
