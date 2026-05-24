import React, { useState, useEffect } from 'react';
import { 
  getDatabase, 
  saveDatabase, 
  resetDatabase, 
  formatDateBr, 
  DatabaseState 
} from './db';
import { User, Congregation, Aluno, Professor, Licao, Turma, Presenca, Dizimo, PageType } from './types';
import { fetchDatabaseFromCloud, saveDatabaseToCloud } from './firebase';
import DashboardView from './components/DashboardView';
import AlunosView from './components/AlunosView';
import ProfessoresView from './components/ProfessoresView';
import LicoesView from './components/LicoesView';
import TurmasView from './components/TurmasView';
import PresencasView from './components/PresencasView';
import DizimosView from './components/DizimosView';
import UsuariosView from './components/UsuariosView';
import RelatoriosView from './components/RelatoriosView';
import SedesView from './components/SedesView';
import IeadtamLogo from './components/IeadtamLogo';

import { 
  Building2, 
  Menu, 
  X, 
  User as UserIcon, 
  LogOut, 
  LayoutDashboard, 
  GraduationCap, 
  Presentation, 
  BookOpen, 
  Users, 
  ClipboardCheck, 
  Coins, 
  ShieldCheck, 
  BarChart3, 
  Lock,
  Church,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Calendar
} from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function App() {
  const [db, setDb] = useState<DatabaseState>(() => getDatabase());
  const [currentDateTime, setCurrentDateTime] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatFullDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' };
    const formatted = date.toLocaleDateString('pt-BR', options);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  const [loadingCloud, setLoadingCloud] = useState(true);
  const [cloudSynced, setCloudSynced] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<PageType>('dashboard');
  const [activeCongregationId, setActiveCongregationId] = useState<string>('');
  
  // Mobile drawer state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Login states
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Custom persistent toast list
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Load EBD data from Cloud Firestore on mount
  useEffect(() => {
    async function initCloudSync() {
      try {
        const cloudData = await fetchDatabaseFromCloud();
        if (cloudData) {
          setDb(cloudData);
          saveDatabase(cloudData); // sync local mirror
          setCloudSynced(true);
          
          // Re-verify and login matched user from new database state
          const savedUser = localStorage.getItem('ieadtam_ebd_session_user');
          if (savedUser) {
            const u = JSON.parse(savedUser) as User;
            const match = cloudData.usuarios.find(x => x.usuario === u.usuario && x.senha === u.senha);
            if (match) {
              setCurrentUser(match);
              setActiveCongregationId(match.congregacaoId);
            }
          }
        } else {
          // If Firestore database is empty, seed it with initial EBD records
          const localData = getDatabase();
          await saveDatabaseToCloud(localData);
          setCloudSynced(true);
        }
      } catch (error) {
        console.error("Firestore loading failure, running offline:", error);
      } finally {
        setLoadingCloud(false);
      }
    }
    initCloudSync();
  }, []);

  // Authenticate session check on load
  useEffect(() => {
    if (loadingCloud) return; // Wait for cloud sync to process before session lookups
    const savedUser = localStorage.getItem('ieadtam_ebd_session_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser) as User;
        // Verify user still exists in database
        const match = db.usuarios.find(x => x.usuario === u.usuario && x.senha === u.senha);
        if (match) {
          setCurrentUser(match);
          setActiveCongregationId(match.congregacaoId);
        } else {
          localStorage.removeItem('ieadtam_ebd_session_user');
        }
      } catch (err) {
        localStorage.removeItem('ieadtam_ebd_session_user');
      }
    }
  }, [db, loadingCloud]);

  // Toast dispatch helper
  const triggerToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts((prev) => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Quick Login Assist Buttons
  const triggerQuickLogin = (uname: string, upass: string) => {
    setLoginUser(uname);
    setLoginPass(upass);
    setLoginError('');
    
    setIsLoggingIn(true);
    setTimeout(() => {
      const match = db.usuarios.find(
        (u) => u.usuario.toLowerCase() === uname.toLowerCase() && u.senha === upass
      );
      if (match) {
        setCurrentUser(match);
        setActiveCongregationId(match.congregacaoId);
        localStorage.setItem('ieadtam_ebd_session_user', JSON.stringify(match));
        triggerToast(`Seja bem-vindo(a), ${match.nome}!`, 'success');
        setLoginUser('');
        setLoginPass('');
      } else {
        setLoginError('Credenciais incorretas.');
      }
      setIsLoggingIn(false);
    }, 300);
  };

  // Handle standard manual form submission
  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const queryUser = loginUser.trim().toLowerCase();
    const queryPass = loginPass.trim();

    if (!queryUser || !queryPass) {
      setLoginError('Insira o login e senha.');
      return;
    }

    const match = db.usuarios.find(
      (u) => u.usuario.toLowerCase() === queryUser && u.senha === queryPass
    );

    if (match) {
      setCurrentUser(match);
      setActiveCongregationId(match.congregacaoId);
      localStorage.setItem('ieadtam_ebd_session_user', JSON.stringify(match));
      triggerToast(`Olá, ${match.nome}. Login realizado.`, 'success');
      setLoginUser('');
      setLoginPass('');
    } else {
      setLoginError('Senha ou login incorretos.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ieadtam_ebd_session_user');
    triggerToast('Desconectado do sistema EBD.', 'info');
    setActiveTab('dashboard');
  };

  // Reset database option
  const handleFullReset = async () => {
    if (window.confirm('ATENÇÃO: Deseja redefinir todo o banco de dados? Todos os cadastros e relatórios customizados no localStorage e no Firestore serão redefinidos para a amostra padrão de Tarauacá Sede/Vila Nova/Centro.')) {
      const fresh = resetDatabase();
      setDb(fresh);
      setCurrentUser(null);
      localStorage.removeItem('ieadtam_ebd_session_user');
      triggerToast('Restaurando banco de dados na nuvem...', 'info');
      try {
        await saveDatabaseToCloud(fresh);
        triggerToast('Banco de dados EBD restaurado na nuvem com sucesso.', 'success');
      } catch (err) {
        triggerToast('Erro de conexão ao restaurar banco em nuvem.', 'error');
      }
    }
  };

  // CRUD OPERATIONS GATEWAYS
  // Ensure array safety
  const getCongName = () => {
    return db.congregacoes.find(c => c.id === activeCongregationId)?.nome || 'Padrão';
  };

  const getAlunos = (): Aluno[] => {
    return db.alunos[activeCongregationId] || [];
  };

  const getProfessores = (): Professor[] => {
    return db.professores[activeCongregationId] || [];
  };

  const getLicoes = (): Licao[] => {
    return db.licoes[activeCongregationId] || [];
  };

  const getTurmas = (): Turma[] => {
    return db.turmas[activeCongregationId] || [];
  };

  const getPresencas = (): Presenca[] => {
    return db.presencas[activeCongregationId] || [];
  };

  const getDizimos = (): Dizimo[] => {
    return db.dizimos[activeCongregationId] || [];
  };

  // Mutators helper: saves back State and disk
  const updateDBState = async (updated: DatabaseState) => {
    setDb(updated);
    saveDatabase(updated);
    try {
      await saveDatabaseToCloud(updated);
    } catch (error) {
      triggerToast('Aviso: Falha ao sincronizar com a nuvem. Operando offline...', 'error');
    }
  };

  // ALUNOS SAVERS / DELETES
  const saveAluno = (aluno: Aluno) => {
    const updated = { ...db };
    if (!updated.alunos[activeCongregationId]) {
      updated.alunos[activeCongregationId] = [];
    }
    const idx = updated.alunos[activeCongregationId].findIndex((a) => a.id === aluno.id);
    if (idx !== -1) {
      updated.alunos[activeCongregationId][idx] = aluno;
      triggerToast('Cadastro de aluno atualizado com sucesso.', 'success');
    } else {
      updated.alunos[activeCongregationId].push(aluno);
      triggerToast('Aluno matriculado com sucesso nesta congregação.', 'success');
    }
    updateDBState(updated);
  };

  const deleteAluno = (id: string) => {
    const updated = { ...db };
    // Remove from student list
    if (updated.alunos[activeCongregationId]) {
      updated.alunos[activeCongregationId] = updated.alunos[activeCongregationId].filter((a) => a.id !== id);
    }
    // Remove student reference from class rosters
    if (updated.turmas[activeCongregationId]) {
      updated.turmas[activeCongregationId].forEach((t) => {
        if (t.alunoIds) {
          t.alunoIds = t.alunoIds.filter((aid) => aid !== id);
        }
      });
    }
    // Wipe relevant student attendances
    if (updated.presencas[activeCongregationId]) {
      updated.presencas[activeCongregationId] = updated.presencas[activeCongregationId].filter((p) => p.alunoId !== id);
    }
    triggerToast('Aluno excluído e desmatriculado das turmas.', 'info');
    updateDBState(updated);
  };

  // PROFESSORES SAVERS / DELETES
  const saveProfessor = (p: Professor) => {
    const updated = { ...db };
    if (!updated.professores[activeCongregationId]) {
      updated.professores[activeCongregationId] = [];
    }
    const idx = updated.professores[activeCongregationId].findIndex((item) => item.id === p.id);
    if (idx !== -1) {
      updated.professores[activeCongregationId][idx] = p;
      triggerToast('Mestre atualizado com sucesso.', 'success');
    } else {
      updated.professores[activeCongregationId].push(p);
      triggerToast('Novo professor cadastrado na congregação.', 'success');
    }
    updateDBState(updated);
  };

  const deleteProfessor = (id: string) => {
    const updated = { ...db };
    if (updated.professores[activeCongregationId]) {
      updated.professores[activeCongregationId] = updated.professores[activeCongregationId].filter((p) => p.id !== id);
    }
    triggerToast('Professor excluído do sistema.', 'info');
    updateDBState(updated);
  };

  // LICOES SAVERS / DELETES
  const saveLicao = (l: Licao) => {
    const updated = { ...db };
    if (!updated.licoes[activeCongregationId]) {
      updated.licoes[activeCongregationId] = [];
    }
    const idx = updated.licoes[activeCongregationId].findIndex((item) => item.id === l.id);
    if (idx !== -1) {
      updated.licoes[activeCongregationId][idx] = l;
      triggerToast('Lição curricular atualizada.', 'success');
    } else {
      updated.licoes[activeCongregationId].push(l);
      triggerToast('Nova lição registrada no currículo.', 'success');
    }
    updateDBState(updated);
  };

  const deleteLicao = (id: string) => {
    const updated = { ...db };
    if (updated.licoes[activeCongregationId]) {
      updated.licoes[activeCongregationId] = updated.licoes[activeCongregationId].filter((l) => l.id !== id);
    }
    triggerToast('Lição curricular removida.', 'info');
    updateDBState(updated);
  };

  // TURMAS SAVERS / DELETES
  const saveTurma = (t: Turma) => {
    const updated = { ...db };
    if (!updated.turmas[activeCongregationId]) {
      updated.turmas[activeCongregationId] = [];
    }
    const idx = updated.turmas[activeCongregationId].findIndex((item) => item.id === t.id);
    if (idx !== -1) {
      updated.turmas[activeCongregationId][idx] = t;
      triggerToast('Ficha de classe e alunos atualizada.', 'success');
    } else {
      updated.turmas[activeCongregationId].push(t);
      triggerToast('Nova turma inaugurada para chamadas.', 'success');
    }
    updateDBState(updated);
  };

  const deleteTurma = (id: string) => {
    const updated = { ...db };
    if (updated.turmas[activeCongregationId]) {
      updated.turmas[activeCongregationId] = updated.turmas[activeCongregationId].filter((t) => t.id !== id);
    }
    // Delete corresponding attendances and tithes for that class
    if (updated.presencas[activeCongregationId]) {
      updated.presencas[activeCongregationId] = updated.presencas[activeCongregationId].filter((p) => p.turmaId !== id);
    }
    if (updated.dizimos[activeCongregationId]) {
      updated.dizimos[activeCongregationId] = updated.dizimos[activeCongregationId].filter((d) => d.turmaId !== id);
    }
    triggerToast('Classe fechada — históricos de chamada e dízimo expurgados.', 'info');
    updateDBState(updated);
  };

  // PRESENCAS SAVERS / DELETES
  const savePresenca = (p: Presenca) => {
    const updated = { ...db };
    if (!updated.presencas[activeCongregationId]) {
      updated.presencas[activeCongregationId] = [];
    }
    const idx = updated.presencas[activeCongregationId].findIndex((item) => item.id === p.id);
    if (idx !== -1) {
      updated.presencas[activeCongregationId][idx] = p;
      triggerToast('Chamada atualizada com sucesso.', 'success');
    } else {
      updated.presencas[activeCongregationId].push(p);
      triggerToast('Presença registrada com sucesso.', 'success');
    }
    updateDBState(updated);
  };

  const saveBatchPresencas = (pList: Presenca[], idsToDelete: string[] = []) => {
    const updated = { ...db };
    if (!updated.presencas[activeCongregationId]) {
      updated.presencas[activeCongregationId] = [];
    }

    if (idsToDelete.length > 0) {
      updated.presencas[activeCongregationId] = updated.presencas[activeCongregationId].filter(
        (p) => !idsToDelete.includes(p.id)
      );
    }

    pList.forEach((p) => {
      const idx = updated.presencas[activeCongregationId].findIndex((item) => item.id === p.id);
      if (idx !== -1) {
        updated.presencas[activeCongregationId][idx] = p;
      } else {
        updated.presencas[activeCongregationId].push(p);
      }
    });

    if (pList.length > 0) {
      triggerToast(`Chamada da turma registrada: ${pList.length} alunos presentes.`, 'success');
    } else if (idsToDelete.length > 0) {
      triggerToast('Chamada atualizada de volta com exclusão de frequências.', 'info');
    }
    updateDBState(updated);
  };

  const deletePresenca = (id: string) => {
    const updated = { ...db };
    if (updated.presencas[activeCongregationId]) {
      updated.presencas[activeCongregationId] = updated.presencas[activeCongregationId].filter((p) => p.id !== id);
    }
    triggerToast('Frequência dominical excluída.', 'info');
    updateDBState(updated);
  };

  // DIZIMOS SAVERS / DELETES
  const saveDizimo = (d: Dizimo) => {
    const updated = { ...db };
    if (!updated.dizimos[activeCongregationId]) {
      updated.dizimos[activeCongregationId] = [];
    }
    const idx = updated.dizimos[activeCongregationId].findIndex((item) => item.id === d.id);
    if (idx !== -1) {
      updated.dizimos[activeCongregationId][idx] = d;
      triggerToast('Ficha de dízimo atualizada.', 'success');
    } else {
      updated.dizimos[activeCongregationId].push(d);
      triggerToast('Dízimo de classe registrado com sucesso.', 'success');
    }
    updateDBState(updated);
  };

  const deleteDizimo = (id: string) => {
    const updated = { ...db };
    if (updated.dizimos[activeCongregationId]) {
      updated.dizimos[activeCongregationId] = updated.dizimos[activeCongregationId].filter((d) => d.id !== id);
    }
    triggerToast('Dízimo excluído das finanças.', 'info');
    updateDBState(updated);
  };

  // SYSTEM LOGINS SAVERS / ALL-USERS
  const saveSystemUser = (usr: User) => {
    const updated = { ...db };
    const idx = updated.usuarios.findIndex((u) => u.id === usr.id);
    if (idx !== -1) {
      // Retain password if unchanged
      const oldPass = updated.usuarios[idx].senha;
      updated.usuarios[idx] = usr;
      if (!usr.senha) {
        updated.usuarios[idx].senha = oldPass;
      }
      triggerToast('Usuário reconfigurado no sistema.', 'success');
    } else {
      updated.usuarios.push(usr);
      triggerToast('Novo usuário homologado para login.', 'success');
    }
    updateDBState(updated);
  };

  const deleteSystemUser = (id: string) => {
    if (id === currentUser?.id) {
      triggerToast('Ação proibida: você não pode deletar sua própria conta ativa.', 'error');
      return;
    }
    const updated = { ...db };
    updated.usuarios = updated.usuarios.filter((u) => u.id !== id);
    triggerToast('Usuário removido da homologação de acessos.', 'info');
    updateDBState(updated);
  };

  // CONGREGATIONS ADDERS / DELETES
  const addCongregation = (name: string) => {
    const updated = { ...db };
    const newId = `c_${Date.now()}`;
    
    // Add congregation registry
    updated.congregacoes.push({ id: newId, nome: name });
    
    // Provision clean record structures
    updated.alunos[newId] = [];
    updated.professores[newId] = [];
    updated.licoes[newId] = [];
    updated.turmas[newId] = [];
    updated.presencas[newId] = [];
    updated.dizimos[newId] = [];

    updateDBState(updated);
    triggerToast(`Congregação "${name}" criada e provisionada.`, 'success');
  };

  const deleteCongregation = (id: string, onSuccess: () => void) => {
    const updated = { ...db };
    
    // Remove congregation
    updated.congregacoes = updated.congregacoes.filter((c) => c.id !== id);
    
    // Purge corresponding record buckets
    delete updated.alunos[id];
    delete updated.professores[id];
    delete updated.licoes[id];
    delete updated.turmas[id];
    delete updated.presencas[id];
    delete updated.dizimos[id];

    updateDBState(updated);
    
    // If the deleted congregation was active, switch active back to Sede
    if (activeCongregationId === id) {
      const fallback = updated.congregacoes[0]?.id || '';
      setActiveCongregationId(fallback);
      if (currentUser) {
        currentUser.congregacaoId = fallback;
        localStorage.setItem('ieadtam_ebd_session_user', JSON.stringify(currentUser));
      }
    }

    triggerToast('Congregação e seus dados excluídos permanentemente.', 'info');
    onSuccess();
  };

  const editCongregation = (id: string, name: string) => {
    const updated = { ...db };
    const index = updated.congregacoes.findIndex((c) => c.id === id);
    if (index !== -1) {
      const oldName = updated.congregacoes[index].nome;
      updated.congregacoes[index] = { ...updated.congregacoes[index], nome: name };
      updateDBState(updated);
      triggerToast(`Sede "${oldName}" atualizada para "${name}" com sucesso.`, 'success');
    }
  };

  // Helper lookup tools passed to child tabs
  const findAlunoObject = (id: string): Aluno | null => {
    const matchingBucket = db.alunos[activeCongregationId] || [];
    return matchingBucket.find((x) => x.id === id) || null;
  };

  const findTurmaObject = (id: string): Turma | null => {
    const matchingBucket = db.turmas[activeCongregationId] || [];
    return matchingBucket.find((x) => x.id === id) || null;
  };

  const findLicaoObject = (id: string): Licao | null => {
    const matchingBucket = db.licoes[activeCongregationId] || [];
    return matchingBucket.find((x) => x.id === id) || null;
  };

  // MAIN ROUTING GATEWAY SELECTOR
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            congName={getCongName()}
            alunos={getAlunos()}
            professores={getProfessores()}
            turmas={getTurmas()}
            presencas={getPresencas()}
            dizimos={getDizimos()}
            licoes={getLicoes()}
            findAluno={findAlunoObject}
            findTurma={findTurmaObject}
            findLicao={findLicaoObject}
          />
        );
      case 'alunos':
        return (
          <AlunosView
            alunos={getAlunos()}
            turmas={getTurmas()}
            presencas={getPresencas()}
            onSave={saveAluno}
            onDelete={deleteAluno}
          />
        );
      case 'professores':
        return (
          <ProfessoresView
            professores={getProfessores()}
            turmas={getTurmas()}
            licoes={getLicoes()}
            presencas={getPresencas()}
            onSave={saveProfessor}
            onDelete={deleteProfessor}
          />
        );
      case 'licoes':
        return (
          <LicoesView
            licoes={getLicoes()}
            turmas={getTurmas()}
            onSave={saveLicao}
            onDelete={deleteLicao}
          />
        );
      case 'turmas':
        return (
          <TurmasView
            turmas={getTurmas()}
            alunos={getAlunos()}
            licoes={getLicoes()}
            onSave={saveTurma}
            onDelete={deleteTurma}
          />
        );
      case 'presenca':
        return (
          <PresencasView
            presencas={getPresencas()}
            turmas={getTurmas()}
            alunos={getAlunos()}
            licoes={getLicoes()}
            onSave={savePresenca}
            onSaveMultiple={saveBatchPresencas}
            onDelete={deletePresenca}
          />
        );
      case 'dizimo':
        return (
          <DizimosView
            dizimos={getDizimos()}
            turmas={getTurmas()}
            onSave={saveDizimo}
            onDelete={deleteDizimo}
          />
        );
      case 'usuarios':
        return (
          <UsuariosView
            currentUser={currentUser!}
            usuarios={db.usuarios}
            congregacoes={db.congregacoes}
            onSaveUser={saveSystemUser}
            onDeleteUser={deleteSystemUser}
            onAddCongregation={addCongregation}
            onDeleteCongregation={deleteCongregation}
          />
        );
      case 'relatorios':
        return (
          <RelatoriosView
            congName={getCongName()}
            alunos={getAlunos()}
            turmas={getTurmas()}
            presencas={getPresencas()}
            dizimos={getDizimos()}
            licoes={getLicoes()}
            findAluno={findAlunoObject}
            findTurma={findTurmaObject}
            findLicao={findLicaoObject}
          />
        );
      case 'sedes':
        return (
          <SedesView
            currentUser={currentUser!}
            congregacoes={db.congregacoes}
            usuarios={db.usuarios}
            alunos={db.alunos}
            professores={db.professores}
            turmas={db.turmas}
            onAddCongregation={addCongregation}
            onDeleteCongregation={deleteCongregation}
            onEditCongregation={editCongregation}
          />
        );
      default:
        return <div>Não implementado.</div>;
    }
  };

  if (loadingCloud) {
    return (
      <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-slate-950 p-4">
        {/* Abstract glowing mesh circles background */}
        <div className="absolute top-[20%] left-[10%] w-[350px] h-[350px] rounded-full bg-amber-500/5 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-emerald-500/5 blur-3xl pointer-events-none"></div>
        
        <div className="relative flex flex-col items-center max-w-sm w-full p-8 rounded-2xl border border-slate-900 bg-slate-900/40 backdrop-blur-md text-center">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
          <div className="w-24 h-24 mb-6 filter drop-shadow-[0_4px_10px_rgba(245,196,60,0.15)] animate-pulse">
            <IeadtamLogo />
          </div>
          <h2 className="text-xl font-bold text-amber-500 font-serif mb-2">Portal EBD IEADTAM</h2>
          <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
            Sincronizando as bases de dados e frequências de Escola Bíblica Dominical de forma segura com o Firestore...
          </p>
          <div className="grid grid-cols-1 w-full gap-2 mt-6">
            <div className="h-1 w-full overflow-hidden rounded bg-slate-800 animate-pulse">
              <div className="h-full w-2/3 rounded bg-amber-500"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ROUTER RENDER SEPARATOR OR LOGIN
  if (!currentUser) {
    return (
      <div className="relative min-h-screen w-full flex items-center justify-center bg-slate-950 p-4 overflow-hidden">
        {/* Abstract glowing mesh circles background */}
        <div className="absolute top-[10%] left-[5%] w-[350px] h-[350px] rounded-full bg-amber-500/5 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[10%] right-[5%] w-[400px] h-[400px] rounded-full bg-emerald-500/5 blur-3xl pointer-events-none"></div>

        <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-900 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-md animate-scaleIn">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
          
          {/* Logo Brand Header */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 mb-3 filter drop-shadow-[0_4px_10px_rgba(245,196,60,0.15)] animate-scaleIn">
              <IeadtamLogo />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-amber-500 font-serif">IEADTAM</h1>
            <p className="text-xs text-slate-500 mt-1 uppercase font-semibold tracking-wider">Portal Escola Dominical</p>
          </div>

          {/* Toast / Errors inline alerts */}
          {loginError && (
            <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Manual Auth Form */}
          <form onSubmit={handleManualLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Nome de Usuário
              </label>
              <input
                type="text"
                required
                disabled={isLoggingIn}
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
                placeholder="Ex: admin"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Senha Acesso
              </label>
              <input
                type="password"
                required
                disabled={isLoggingIn}
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                placeholder="Introduza a senha"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-sm font-bold text-slate-950 font-serif hover:bg-amber-400 active:scale-98 transition cursor-pointer"
            >
              {isLoggingIn ? 'Autenticando...' : 'Entrar no Sistema'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans print:bg-white print:text-black">
      
      {/* PERSISTENT TOASTS FIXED ALERT WATERFALL */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-2.5 rounded-xl border p-4 shadow-xl pointer-events-auto animate-toastIn ${
              t.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : t.type === 'error'
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-450'
                : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
            }`}
          >
            {t.type === 'success' ? (
              <CheckCircle className="h-4.5 w-4.5 shrink-0" />
            ) : (
              <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            )}
            <span className="text-xs font-semibold leading-normal">{t.message}</span>
          </div>
        ))}
      </div>

      {/* MOBILE DESKTOP MENU SEPARATOR HEADER */}
      <header className="sticky top-0 z-30 px-5 py-3 flex items-center justify-between border-b border-slate-900 bg-slate-900 md:hidden print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 shrink-0">
            <IeadtamLogo />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-white tracking-wider font-serif text-sm">IEADTAM EBD</span>
            <span className="text-[10px] text-amber-550 font-mono font-semibold flex items-center gap-1 select-none">
              <Clock className="h-2.5 w-2.5 animate-pulse text-amber-500" /> {formatTime(currentDateTime)}
            </span>
          </div>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 border border-slate-800 text-slate-350 hover:text-white rounded-lg"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* BACKPLANE SIDEBAR DRAWER AND RESPONSIVE WRAP */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 border-r border-slate-900 bg-slate-900/90 backdrop-blur-md flex flex-col justify-between transition-transform duration-300 md:translate-x-0 md:static print:hidden
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Sidebar Header Brand */}
        <div className="p-5 border-b border-slate-905 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 shrink-0">
              <IeadtamLogo />
            </div>
            <div>
              <h1 className="font-bold text-white text-base leading-none tracking-tight font-serif">IEADTAM</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Escola Dominical</p>
            </div>
          </div>

          {/* Congregation badge and indicator */}
          <div className="w-full flex items-center gap-2 rounded-xl bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/10 py-1.5 px-3 select-none text-xs text-amber-500 font-bold">
            <Church className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{getCongName()}</span>
          </div>

          {/* Sytlish Clock & Calendar Widget */}
          <div className="w-full flex flex-col gap-1.5 rounded-xl bg-slate-950 border border-slate-800 p-2.5 select-none shadow-inner">
            <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-amber-500 animate-pulse" /> Hora Certa
              </span>
              <span className="font-mono text-amber-500 text-xs font-bold leading-none tracking-tight">{formatTime(currentDateTime)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="truncate text-[11px] capitalize">{formatFullDate(currentDateTime)}</span>
            </div>
          </div>

          {/* ADMIN CONGREGATION SWITCHER CONTROL */}
          {currentUser.role === 'admin' && (
            <div className="space-y-1">
              <label className="block text-[9px] uppercase font-bold tracking-wider text-slate-500">Alternar Congregação</label>
              <select
                value={activeCongregationId}
                onChange={(e) => {
                  setActiveCongregationId(e.target.value);
                  triggerToast(`Visualizando congregação "${db.congregacoes.find(c=>c.id===e.target.value)?.nome}"`, 'info');
                }}
                className="w-full p-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-350 focus:outline-none focus:border-amber-500 cursor-pointer shadow font-semibold"
              >
                {db.congregacoes.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Navigation Sidebar menu items */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-5 px-3">
          {/* Main Group */}
          <div className="space-y-1">
            <div className="px-3 text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1">Principal</div>
            <button
              onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 py-2 px-3.5 rounded-xl text-xs font-semibold select-none cursor-pointer transition ${
                activeTab === 'dashboard' 
                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                  : 'text-slate-400 hover:text-slate-105 hover:bg-slate-850/50'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </button>
          </div>

          {/* Registers Group */}
          <div className="space-y-1">
            <div className="px-3 text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1">Cadastros</div>
            <div className="space-y-1">
              <button
                onClick={() => { setActiveTab('alunos'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 py-2 px-3.5 rounded-xl text-xs font-semibold select-none cursor-pointer transition ${
                  activeTab === 'alunos' 
                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                    : 'text-slate-400 hover:text-slate-105 hover:bg-slate-850/50'
                }`}
              >
                <GraduationCap className="h-4 w-4" />
                <span>Alunos</span>
              </button>
              <button
                onClick={() => { setActiveTab('professores'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 py-2 px-3.5 rounded-xl text-xs font-semibold select-none cursor-pointer transition ${
                  activeTab === 'professores'
                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                    : 'text-slate-400 hover:text-slate-105 hover:bg-slate-850/50'
                }`}
              >
                <Presentation className="h-4 w-4" />
                <span>Professores</span>
              </button>
              <button
                onClick={() => { setActiveTab('licoes'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 py-2 px-3.5 rounded-xl text-xs font-semibold select-none cursor-pointer transition ${
                  activeTab === 'licoes' 
                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                    : 'text-slate-400 hover:text-slate-105 hover:bg-slate-850/50'
                }`}
              >
                <BookOpen className="h-4 w-4" />
                <span>Lições</span>
              </button>
              <button
                onClick={() => { setActiveTab('turmas'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 py-2 px-3.5 rounded-xl text-xs font-semibold select-none cursor-pointer transition ${
                  activeTab === 'turmas' 
                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                    : 'text-slate-400 hover:text-slate-105 hover:bg-slate-850/50'
                }`}
              >
                <Users className="h-4 w-4" />
                <span>Turmas</span>
              </button>
            </div>
          </div>

          {/* Control Group */}
          <div className="space-y-1">
            <div className="px-3 text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1">Controle</div>
            <div className="space-y-1">
              <button
                onClick={() => { setActiveTab('presenca'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 py-2 px-3.5 rounded-xl text-xs font-semibold select-none cursor-pointer transition ${
                  activeTab === 'presenca' 
                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                    : 'text-slate-400 hover:text-slate-105 hover:bg-slate-850/50'
                }`}
              >
                <ClipboardCheck className="h-4 w-4" />
                <span>Presença</span>
              </button>
              <button
                onClick={() => { setActiveTab('dizimo'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 py-2 px-3.5 rounded-xl text-xs font-semibold select-none cursor-pointer transition ${
                  activeTab === 'dizimo' 
                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                    : 'text-slate-400 hover:text-slate-105 hover:bg-slate-850/50'
                }`}
              >
                <Coins className="h-4 w-4" />
                <span>Dízimo</span>
              </button>
              {currentUser.role === 'admin' && (
                <button
                  onClick={() => { setActiveTab('usuarios'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 py-2 px-3.5 rounded-xl text-xs font-semibold select-none cursor-pointer transition ${
                    activeTab === 'usuarios' 
                      ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                      : 'text-slate-400 hover:text-slate-105 hover:bg-slate-850/50'
                  }`}
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Config Usuários</span>
                </button>
              )}
            </div>
          </div>

          {/* Analysis Group */}
          <div className="space-y-1">
            <div className="px-3 text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1">Análise</div>
            <button
              onClick={() => { setActiveTab('relatorios'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 py-2 px-3.5 rounded-xl text-xs font-semibold select-none cursor-pointer transition ${
                activeTab === 'relatorios' 
                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                  : 'text-slate-400 hover:text-slate-105 hover:bg-slate-850/50'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Gráficos / PDF</span>
            </button>
          </div>
        </nav>

        {/* User Sidebar Footer Profile */}
        <div className="p-4 border-t border-slate-905 bg-slate-900 flex items-center gap-3 shrink-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-sm font-extrabold text-amber-500 border border-amber-500/25">
            {currentUser.nome.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-white text-xs font-bold leading-normal truncate">{currentUser.nome}</h4>
            <span className="text-[10px] text-slate-500 font-semibold uppercase leading-none mt-0.5 block">{currentUser.role === 'admin' ? 'Administrador' : 'Professor'}</span>
          </div>
          <button 
            onClick={handleLogout}
            title="Sair"
            className="p-1.5 border border-slate-850 bg-slate-950 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-550/5 transition cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </aside>

      {/* SIDEBAR BACKPLANE COVER OVERLAY ON MOBILE FOR SEAMLESS CLOSINGS */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 md:hidden print:hidden"
        ></div>
      )}

      {/* VIEWPORT AREA HOLDER */}
      <main className="flex-1 p-5 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full print:p-0 print:border-none print:shadow-none">
        {renderActiveTab()}
      </main>
    </div>
  );
}
