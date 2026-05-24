import React, { useState, useEffect } from 'react';
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
  Calendar,
  Activity,
  Wifi,
  RefreshCw,
  Terminal,
  Database,
  Globe,
  Radio,
  Cpu,
  UserCheck
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
  const [activeMode, setActiveMode] = useState<'temporeal' | 'lista'>('temporeal');
  
  // Real-time Simulation States
  const [latencies, setLatencies] = useState<Record<string, number>>({});
  const [activePings, setActivePings] = useState<Record<string, boolean>>({});
  const [syncedLogFeed, setSyncedLogFeed] = useState<Array<{ id: string; time: string; sede: string; text: string }>>([
    { id: '1', time: '02:29:45', sede: 'Tarauacá Sede', text: 'Carregamento inicial realizado com sucesso' },
    { id: '2', time: '02:30:12', sede: 'Vila Nova', text: 'Conexão autorizada e sincronização de dados ativa' },
    { id: '3', time: '02:30:55', sede: 'Vila Cruzeiro', text: 'Profª Francisca efetuou login no sistema' },
  ]);
  const [globalStatus, setGlobalStatus] = useState<'nominal' | 'syncing'>('nominal');

  useEffect(() => {
    // Generate initial pings for each congregation
    const initPings: Record<string, number> = {};
    congregacoes.forEach((c) => {
      initPings[c.id] = Math.floor(Math.random() * 50) + 15; // 15ms - 65ms
    });
    setLatencies(initPings);
  }, [congregacoes]);

  useEffect(() => {
    const handleAddLiveLog = () => {
      if (congregacoes.length === 0) return;
      
      const randomSede = congregacoes[Math.floor(Math.random() * congregacoes.length)];
      const randomActionPool = [
        'presença atualizada para 12 alunos na classe Adolescentes',
        'novo dízimo registrado para planejamento trimestral',
        'nova lição do trimestre adicionada ou revisada',
        'aluno Lucas Ramos matriculado na EBD',
        'aula iniciada com chamada ativa',
        'sincronização de relatórios mensais efetuada',
        'backup de dados local gravado com sucesso',
        'professor autorizado associado ao segmento'
      ];
      const randomAction = randomActionPool[Math.floor(Math.random() * randomActionPool.length)];
      
      const now = new Date();
      const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      setSyncedLogFeed((prev) => [
        {
          id: Math.random().toString(),
          time: timeStr,
          sede: randomSede.nome,
          text: randomAction
        },
        ...prev.slice(0, 11) // keep up to 12 items
      ]);
    };

    const interval = setInterval(() => {
      handleAddLiveLog();
    }, 7000 + Math.random() * 5000); // random interval between 7s and 12s

    return () => clearInterval(interval);
  }, [congregacoes]);

  const testSedePing = (sedeId: string) => {
    setActivePings(prev => ({ ...prev, [sedeId]: true }));
    setTimeout(() => {
      setLatencies(prev => ({
        ...prev,
        [sedeId]: Math.floor(Math.random() * 40) + 12 // recalculate to fresh ping 12ms - 52ms
      }));
      setActivePings(prev => ({ ...prev, [sedeId]: false }));
    }, 1200);
  };

  const handleTestAllConnections = () => {
    setGlobalStatus('syncing');
    
    // Set all active pings to spinning
    const spinningMap: Record<string, boolean> = {};
    congregacoes.forEach(c => { spinningMap[c.id] = true; });
    setActivePings(spinningMap);
    
    setTimeout(() => {
      // Set new latencies
      const updatedPings: Record<string, number> = {};
      const newActivePings: Record<string, boolean> = {};
      congregacoes.forEach((c) => {
        updatedPings[c.id] = Math.floor(Math.random() * 32) + 10;
        newActivePings[c.id] = false;
      });
      setLatencies(updatedPings);
      setActivePings(newActivePings);
      setGlobalStatus('nominal');
      
      // Add a log of full sync
      const now = new Date();
      const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setSyncedLogFeed((prev) => [
        {
          id: Math.random().toString(),
          time: timeStr,
          sede: 'ROTEADOR CENTRAL',
          text: 'Sincronização global de frequências e dízimos executada com sucesso!'
        },
        ...prev.slice(0, 11)
      ]);
    }, 2000);
  };

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
            <h2 className="text-2xl md:text-3xl font-bold text-white font-serif flex items-center gap-2 animate-fadeIn">
              <Globe className="h-6 w-6 text-amber-500 shrink-0" />
              Sedes Conectadas
            </h2>
            <span className="inline-flex items-center justify-center bg-emerald-500/10 text-emerald-400 font-mono text-[10px] px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-bold animate-pulse">
              Tempo Real
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Sincronismo e monitoramento de conexões administrativas das sedes IEADTAM</p>
        </div>

        {/* Tab Toggle Control Selection */}
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl self-start sm:self-auto select-none max-w-sm w-full">
          <button
            type="button"
            onClick={() => setActiveMode('temporeal')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer outline-none select-none ${
              activeMode === 'temporeal'
                ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold'
                : 'text-slate-400 hover:text-white hover:bg-slate-950/40'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            Painel Tempo Real
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('lista')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer outline-none select-none ${
              activeMode === 'lista'
                ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold'
                : 'text-slate-400 hover:text-white hover:bg-slate-950/40'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            Gerenciar Sedes
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-455 max-w-2xl">
          <XCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* TEMPO REAL / LATENCY MONITOR VIEW PANEL */}
      {activeMode === 'temporeal' && (
        <div className="space-y-6">
          {/* Global Network indicators summary card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/15">
                <Wifi className="h-6 w-6 animate-pulse" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Status da Rede Central</span>
                <span className="text-base font-bold text-white flex items-center gap-1.5 font-serif mt-0.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                  Conexão Nominal
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/15">
                <Radio className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Sedes Ativas</span>
                <span className="text-xl font-bold text-white font-mono mt-0.5">{congregacoes.length} / {congregacoes.length}</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/15">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Banco Sincronizado</span>
                  <span className="text-xs font-semibold text-slate-200 block mt-1">Multi-Sede integrado</span>
                </div>
              </div>

              <button
                disabled={globalStatus === 'syncing'}
                onClick={handleTestAllConnections}
                className="rounded-xl border border-slate-700 px-3 py-1.5 text-xs font-extrabold text-white bg-slate-950 hover:bg-slate-900 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 select-none shadow hover:border-amber-500/30"
              >
                <RefreshCw className={`h-3 w-3 ${globalStatus === 'syncing' ? 'animate-spin text-amber-500' : ''}`} />
                {globalStatus === 'syncing' ? 'Testando...' : 'Testar Rede'}
              </button>
            </div>
          </div>

          {/* Connected Congregations Status Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fadeIn">
            {congregacoes.map((c) => {
              const students = (alunos[c.id] || []).length;
              const classes = (turmas[c.id] || []).length;
              const repUser = usuarios.find((u) => u.congregacaoId === c.id);
              const isPinging = activePings[c.id];
              const latency = latencies[c.id] || 25;
              const curSedeConnected = currentUser.congregacaoId === c.id;

              return (
                <div
                  key={c.id}
                  className={`relative overflow-hidden rounded-2xl border p-5 flex flex-col justify-between transition duration-200 ${
                    curSedeConnected 
                      ? 'border-emerald-500/40 bg-emerald-950/10 shadow-[0_0_15px_rgba(16,185,129,0.03)]' 
                      : 'border-slate-800 bg-slate-900/10 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Header: Sede Name and Live status light */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border font-bold shadow-inner ${
                          curSedeConnected
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-slate-950 text-amber-550 border-slate-850'
                        }`}>
                          <Church className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-serif text-sm font-bold text-white leading-tight flex items-center gap-1.5">
                            {c.nome}
                            {curSedeConnected && (
                              <span className="text-[9px] font-sans font-extrabold bg-emerald-500 text-slate-950 px-1 py-0.5 rounded uppercase leading-none">Sua Sede</span>
                            )}
                          </h3>
                          <span className="text-[9px] text-zinc-500 font-mono tracking-wider">PORTAL REGIONAL</span>
                        </div>
                      </div>

                      {/* Connection Meter Speed / Indicator */}
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-mono font-extrabold text-emerald-400 flex items-center gap-1 leading-none select-none">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          ONLINE
                        </span>
                        <button
                          title="Fazer ping e atualizar conexão"
                          disabled={isPinging}
                          onClick={() => testSedePing(c.id)}
                          className="text-[10px] text-slate-450 hover:text-amber-500 font-mono leading-none flex items-center gap-1 shrink-0 mt-1 cursor-pointer outline-none"
                        >
                          <Activity className={`h-2.5 w-2.5 ${isPinging ? 'animate-spin text-amber-500' : 'text-slate-600'}`} />
                          {isPinging ? 'Ping...' : `${latency}ms`}
                        </button>
                      </div>
                    </div>

                    {/* representative User details */}
                    <div className="rounded-xl bg-slate-950/60 border border-slate-850/40 p-3 flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                        <UserCheck className="h-3.5 w-3.5 text-zinc-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] text-slate-500 uppercase font-extrabold tracking-wider leading-none block">Dispositivo / Usuário Ativo</span>
                        <span className="text-xs font-bold text-slate-200 truncate block mt-1">
                          {repUser ? repUser.nome : `Sede Integrada (Terminal 0${students % 3 + 1})`}
                        </span>
                      </div>
                    </div>

                    {/* Stats counters */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 border-t border-slate-850/50 pt-3">
                      <div className="flex items-center gap-1.5 bg-slate-950/20 p-1.5 rounded border border-slate-850/30">
                        <GraduationCap className="h-3.5 w-3.5 text-zinc-500 animate-pulse" />
                        <span>Alunos: <strong className="text-white font-mono font-bold">{students}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-slate-950/20 p-1.5 rounded border border-slate-850/30">
                        <Layers className="h-3.5 w-3.5 text-zinc-500" />
                        <span>Turmas: <strong className="text-white font-mono font-bold">{classes}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="text-[9px] text-zinc-550 font-semibold mt-4 flex items-center justify-between border-t border-slate-850 pt-2.5">
                    <span>SALA DE REDE</span>
                    <span className="font-mono text-emerald-400 tracking-wide">Sincronizado</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Scrolling Sync Live terminal Console Feed */}
          <div className="rounded-2xl border border-slate-800 bg-slate-905/70 p-5 shadow-inner space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="h-4.5 w-4.5 text-emerald-400 shrink-0 animate-pulse" />
                <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-200">Terminal de Sincronismo (Feed em tempo real)</h4>
              </div>
              <span className="flex items-center gap-1.5 text-[9px] font-mono text-slate-500">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                Socket Ativo: Multi-Sede EBD
              </span>
            </div>

            <div className="space-y-2 h-44 overflow-y-auto select-none font-mono text-[11px] leading-relaxed pl-1">
              {syncedLogFeed.map((log) => (
                <div key={log.id} className="flex items-start gap-2.5 py-0.5 animate-fadeIn">
                  <span className="text-amber-500 shrink-0 text-[10px] font-semibold">[{log.time}]</span>
                  <span className="text-indigo-400 font-bold shrink-0">[{log.sede}]</span>
                  <span className="text-emerald-400 shrink-0">➔</span>
                  <span className="text-slate-350 leading-normal">{log.text}</span>
                </div>
              ))}
              {syncedLogFeed.length === 0 && (
                <div className="py-6 text-center text-slate-600 text-xs">Aguardando novos sincronismos...</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* LIST MANAGEMENT ORIGINAL MODE */}
      {activeMode === 'lista' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Searching Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar sede ou congregação..."
                className="w-full pl-11 pr-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-colors"
              />
            </div>

            {currentUser.role === 'admin' ? (
              <button
                onClick={() => {
                  setNewSedeName('');
                  setErrorMessage('');
                  setSuccessMessage('');
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-xs font-extrabold text-slate-950 font-serif leading-none shadow transition-all hover:bg-amber-400 active:scale-95 cursor-pointer select-none"
              >
                <Plus className="h-4 w-4" />
                Cadastrar Sede
              </button>
            ) : (
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
                Apenas administradores podem registrar sedes.
              </div>
            )}
          </div>

          {/* Grid structure for Sedes/Congregations */}
          {filteredCongregacoes.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/10 p-12 text-center">
              <Church className="h-12 w-12 mx-auto text-slate-600 mb-4 opacity-40" />
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
                    className="relative overflow-hidden rounded-2xl border border-slate-850 bg-slate-900/30 p-5 shadow-sm hover:border-amber-500/10 hover:bg-slate-900/50 transition duration-200 flex flex-col justify-between"
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
                              className="p-1 px-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-amber-500 hover:bg-amber-500/5 hover:border-amber-500/10 transition cursor-pointer"
                              title="Editar Nome da Sede"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            {congregacoes.length > 1 && (
                              <button
                                onClick={() => setDeletingId(c.id)}
                                className="p-1 px-1.5 rounded-lg border border-slate-800 text-slate-550 hover:text-rose-500 hover:bg-rose-500/5 hover:border-rose-500/10 transition cursor-pointer"
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

                        <div className="rounded-xl bg-slate-955/40 border border-slate-855/40 p-2 text-center">
                          <div className="text-sm font-black text-emerald-400 font-mono">{profCount}</div>
                          <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-500 leading-none block mt-0.5">Prof</span>
                        </div>

                        <div className="rounded-xl bg-slate-955/40 border border-slate-855/40 p-2 text-center">
                          <div className="text-sm font-black text-indigo-400 font-mono">{classCount}</div>
                          <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-500 leading-none block mt-0.5">Turmas</span>
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-450 font-semibold border-t border-slate-850/50 pt-2 flex justify-between items-center bg-slate-900/10">
                        <span>Usuários Cadastrados</span>
                        <span className="font-mono text-white bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800">{userUsers}</span>
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
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-655 focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-[10px] text-slate-550 mt-1.5">
                    * Ao cadastrar, o sistema irá provisionar novos registros em branco para esta Sede.
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-lg border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 font-serif hover:bg-amber-400"
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
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-450">
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
                    className="rounded-lg border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 font-serif hover:bg-amber-400"
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
