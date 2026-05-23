import React, { useState } from 'react';
import { User, Congregation, normalizeText } from '../types';
import { 
  Plus, 
  Trash2, 
  Pencil, 
  UserCheck, 
  ShieldAlert, 
  Lock, 
  Church, 
  X,
  XCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { generateUUID } from '../db';

interface UsuariosViewProps {
  currentUser: User;
  usuarios: User[];
  congregacoes: Congregation[];
  onSaveUser: (u: User) => void;
  onDeleteUser: (id: string) => void;
  onAddCongregation: (name: string) => void;
  onDeleteCongregation: (id: string, onSuccess: () => void) => void;
}

export default function UsuariosView({
  currentUser,
  usuarios,
  congregacoes,
  onSaveUser,
  onDeleteUser,
  onAddCongregation,
  onDeleteCongregation
}: UsuariosViewProps) {
  const [newCongName, setNewCongName] = useState('');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // User form states
  const [nome, setNome] = useState('');
  const [username, setUsername] = useState('');
  const [senha, setSenha] = useState('');
  const [role, setRole] = useState<'admin' | 'usuario'>('usuario');
  const [congregacaoId, setCongregacaoId] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleEditClick = (u?: User) => {
    setErrorMessage('');
    if (u) {
      setEditingUser(u);
      setNome(u.nome);
      setUsername(u.usuario);
      setSenha(''); // blank to keep old password
      setRole(u.role);
      setCongregacaoId(u.congregacaoId);
    } else {
      setEditingUser(null);
      setNome('');
      setUsername('');
      setSenha('');
      setRole('usuario');
      setCongregacaoId(congregacoes[0]?.id || '');
    }
    setIsUserModalOpen(true);
  };

  const handleUserFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!nome.trim() || !username.trim()) {
      setErrorMessage('Nome e login usuário são campos obrigatórios.');
      return;
    }

    // Check duplicate username
    const duplicate = usuarios.find(
      (u) => u.usuario.toLowerCase() === username.trim().toLowerCase() && u.id !== editingUser?.id
    );
    if (duplicate) {
      setErrorMessage('Este nome de usuário para login já está em uso.');
      return;
    }

    if (!editingUser && !senha.trim()) {
      setErrorMessage('A senha é obrigatória para novos usuários.');
      return;
    }

    onSaveUser({
      id: editingUser ? editingUser.id : generateUUID('u'),
      nome: nome.trim(),
      usuario: username.trim().toLowerCase(),
      senha: senha.trim() ? senha.trim() : undefined, // Parent will retain old password if undefined
      role,
      congregacaoId
    });

    setIsUserModalOpen(false);
  };

  const handleCreateCongregation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCongName.trim()) return;

    // Check duplicate
    const duplicate = congregacoes.find(
      (c) => normalizeText(c.nome) === normalizeText(newCongName)
    );
    if (duplicate) {
      alert('Esta congregação já está cadastrada.');
      return;
    }

    onAddCongregation(newCongName.trim());
    setNewCongName('');
  };

  const handleDeleteCong = (id: string, name: string) => {
    if (congregacoes.length <= 1) {
      alert('O sistema EBD deve manter ao menos 1 congregação.');
      return;
    }

    // Check dependency: do any users currently belong to this congregation?
    const hasUsers = usuarios.filter((u) => u.congregacaoId === id);
    if (hasUsers.length > 0) {
      alert(`Não é possível excluir! Remova ou reatribua os usuários que pertencem à congregação "${name}" antes de prosseguir.`);
      return;
    }

    if(confirm(`Tem certeza que de excluir permanentemente a congregação "${name}"? Todos os alunos, professoras, turmas e históricos desta congregação específica serão removidos!`)) {
      onDeleteCongregation(id, () => {});
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Tab Header Title */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-white font-serif">Controle de Usuários</h2>
        <p className="text-xs text-slate-400 mt-1">Gerenciamento administrativo de congregações e níveis de acesso</p>
      </div>

      {/* Dynamic Congregations Section */}
      <div className="rounded-xl border border-slate-850 bg-slate-900/40 p-5 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Church className="h-4 w-4 text-amber-500" />
          Congregações no Sistema
        </h3>

        <div className="flex flex-wrap gap-2.5">
          {congregacoes.map((c) => (
            <span 
              key={c.id} 
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 text-xs font-bold text-amber-550"
            >
              <span>{c.nome}</span>
              {congregacoes.length > 1 && (
                <button
                  onClick={() => handleDeleteCong(c.id, c.nome)}
                  title="Excluir Congregação"
                  className="rounded-full hover:bg-rose-500/10 hover:text-rose-400 p-0.5 transition cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </span>
          ))}
        </div>

        {/* Add congregation inline */}
        <form onSubmit={handleCreateCongregation} className="flex gap-3 max-w-sm pt-2">
          <input
            type="text"
            required
            value={newCongName}
            onChange={(e) => setNewCongName(e.target.value)}
            placeholder="Nome da nova congregação"
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/20 px-3.5 py-2 text-xs font-bold text-orange-400 cursor-pointer transition"
          >
            <Plus className="h-3.5 w-3.5" />
            Adicionar
          </button>
        </form>
      </div>

      {/* Users catalog list */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Usuários Cadastrados</h3>
          <button
            onClick={() => handleEditClick()}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 font-serif shadow transition-all hover:bg-amber-400 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            Novo Usuário
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-850 bg-slate-900/20 shadow">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/60 border-b border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4 font-semibold">Nome Completo</th>
                <th className="py-3.5 px-4 font-semibold">Login Usuário</th>
                <th className="py-3.5 px-4 font-semibold">Congregação Padrão</th>
                <th className="py-3.5 px-4 font-semibold text-center">Nível Acesso</th>
                <th className="py-3.5 px-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-sm text-slate-350">
              {usuarios.map((u) => {
                const isSelf = u.id === currentUser.id;
                const matchedCong = congregacoes.find((cg) => cg.id === u.congregacaoId);
                
                return (
                  <tr key={u.id} className="hover:bg-slate-800/10 transition">
                    <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2.5">
                      <span>{u.nome}</span>
                      {isSelf && (
                        <span className="text-[9px] uppercase font-bold tracking-wider text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/15">
                          Você
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs">{u.usuario}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 text-xs text-amber-500 bg-amber-500/5 px-2.5 py-1 rounded-full border border-amber-500/10 font-medium">
                        <Church className="h-3.5 w-3.5" />
                        {matchedCong ? matchedCong.nome : 'Nenhum'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {u.role === 'admin' ? (
                        <span className="inline-flex rounded-full bg-orange-400/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-400 border border-orange-400/15">
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-blue-400/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-400 border border-blue-400/15">
                          Usuário
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex justify-end gap-1.5 font-mono">
                        <button
                          onClick={() => handleEditClick(u)}
                          className="bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-400 hover:text-amber-500 cursor-pointer"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        {!isSelf ? (
                          <button
                            onClick={() => onDeleteUser(u.id)}
                            className="bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-400 hover:text-rose-500 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        ) : (
                          <div className="w-[29px] h-[29px] inline-block"></div> // Placeholder for self alignment
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* DYNAMIC USER EDIT MODAL PANEL */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setIsUserModalOpen(false)}></div>
          
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl animate-scaleIn">
            <h3 className="text-lg font-bold font-serif text-white mb-5">
              {editingUser ? 'Editar Usuário do Sistema' : 'Novo Usuário do Sistema'}
            </h3>

            {errorMessage && (
              <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-rose-550/10 border border-rose-500/20 text-xs text-rose-455">
                <XCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleUserFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome do usuário admin ou professor"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-650 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Login Usuário (usuario)
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ex: joao.ebd"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-650 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Senha {editingUser && '(Deixe em branco para MANTER atual)'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder={editingUser ? '••••••••' : 'Insira a senha de login'}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-650 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-350"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Nível de Acesso
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'admin' | 'usuario')}
                    disabled={editingUser?.id === currentUser?.id} // Cannot demote yourself
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="usuario">Usuário</option>
                    <option value="admin">Administrador</option>
                  </select>
                  {editingUser?.id === currentUser?.id && (
                    <p className="text-[10px] text-slate-500 mt-1">* Não demotável por si</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Congregação EBD
                  </label>
                  <select
                    value={congregacaoId}
                    onChange={(e) => setCongregacaoId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {congregacoes.map((c) => (
                      <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="rounded-lg border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 font-serif hover:bg-amber-400 cursor-pointer"
                >
                  {editingUser ? 'Salvar Usuário' : 'Gravar Acesso'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
