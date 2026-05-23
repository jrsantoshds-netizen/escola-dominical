import React from 'react';
import { Aluno, Professor, Turma, Presenca, Dizimo, Licao } from '../types';
import { 
  GraduationCap, 
  Presentation, 
  Users, 
  Coins, 
  Calendar, 
  Check, 
  X,
  Book,
  FileCheck
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area,
  Legend
} from 'recharts';
import { formatDateBr } from '../db';

interface DashboardViewProps {
  congName: string;
  alunos: Aluno[];
  professores: Professor[];
  turmas: Turma[];
  presencas: Presenca[];
  dizimos: Dizimo[];
  licoes: Licao[];
  findAluno: (id: string) => Aluno | null;
  findTurma: (id: string) => Turma | null;
  findLicao: (id: string) => Licao | null;
}

export default function DashboardView({
  congName,
  alunos,
  professores,
  turmas,
  presencas,
  dizimos,
  licoes,
  findAluno,
  findTurma,
  findLicao
}: DashboardViewProps) {
  // Stats
  const totalAlunos = alunos.length;
  const totalProfessores = professores.length;
  const totalTurmas = turmas.length;
  const totalDizimos = dizimos.reduce((sum, d) => sum + Number(d.valor || 0), 0);

  // Latest 8 attendances
  const latestPresencas = [...presencas].reverse().slice(0, 8);

  // Chart 1: Alunos por Turma
  const classEnrollmentData = turmas.map(t => ({
    name: t.nome,
    Alunos: (t.alunoIds || []).length
  }));

  // Chart 2: Dízimo por Turma
  const classTitheMap: Record<string, number> = {};
  turmas.forEach(t => {
    classTitheMap[t.id] = 0;
  });
  dizimos.forEach(d => {
    if (classTitheMap[d.turmaId] !== undefined) {
      classTitheMap[d.turmaId] += Number(d.valor || 0);
    }
  });
  const classTitheData = turmas.map(t => ({
    name: t.nome,
    Valor: classTitheMap[t.id] || 0
  }));

  // Chart 3: Presença por Data (evolution)
  const datePresenceMap: Record<string, number> = {};
  presencas.forEach(p => {
    datePresenceMap[p.data] = (datePresenceMap[p.data] || 0) + 1;
  });
  const presenceTimelineData = Object.keys(datePresenceMap)
    .sort()
    .map(date => ({
      dataBr: formatDateBr(date),
      dataRaw: date,
      Presenças: datePresenceMap[date]
    }));

  // Chart 4: Bíblias vs Revistas
  const totalBibles = presencas.reduce((sum, p) => sum + (p.qtdBiblia || 0), 0);
  const totalMagazines = presencas.reduce((sum, p) => sum + (p.qtdRevista || 0), 0);
  const bibleMagazineData = [
    { name: 'Bíblias', value: totalBibles, color: '#10B981' },
    { name: 'Revistas', value: totalMagazines, color: '#3B82F6' }
  ];

  const COLORS = ['#C9973F', '#10B981', '#3B82F6', '#FB923C', '#A78BFA', '#F87171', '#F59E0B', '#14B8A6'];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white font-serif">
            Dashboard Geral
          </h2>
          <p className="text-sm mt-1 text-slate-400">
            IEADTAM — <span className="text-amber-500 font-semibold">{congName}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 w-fit">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          PORTAL LIVE
        </div>
      </div>

      {/* Stats Cards Dashboard Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card Alunos */}
        <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-md transition-all duration-300 hover:border-amber-500/30 hover:-translate-y-1">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-amber-500"></div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Alunos</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
              <GraduationCap className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-serif">{totalAlunos}</div>
          <p className="text-xs text-slate-400 mt-2">Matriculados e ativos</p>
        </div>

        {/* Card Professores */}
        <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-md transition-all duration-300 hover:border-emerald-500/30 hover:-translate-y-1">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-emerald-500"></div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Professores</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
              <Presentation className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-serif">{totalProfessores}</div>
          <p className="text-xs text-slate-400 mt-2">Ministrantes ativos</p>
        </div>

        {/* Card Turmas */}
        <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-md transition-all duration-300 hover:border-blue-500/30 hover:-translate-y-1">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-blue-500"></div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Turmas</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-serif">{totalTurmas}</div>
          <p className="text-xs text-slate-400 mt-2">Classes em atividade</p>
        </div>

        {/* Card Dizimos */}
        <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-md transition-all duration-300 hover:border-orange-500/30 hover:-translate-y-1">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-orange-500"></div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Dízimos EBD</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
              <Coins className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-serif">R$ {totalDizimos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          <p className="text-xs text-slate-400 mt-2">Arrecadação total das classes</p>
        </div>
      </div>

      {/* Visualizations Charts Block */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alunos por Turma Chart */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
          <h3 className="text-base font-bold text-white mb-4">Alunos Ativos por Classe</h3>
          <div className="h-64 w-full">
            {classEnrollmentData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm">
                <Users className="h-8 w-8 mb-2 opacity-30" />
                Sem turmas cadastradas
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classEnrollmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                    labelStyle={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold' }}
                    itemStyle={{ color: '#f59e0b', fontSize: '13px' }}
                  />
                  <Bar dataKey="Alunos" fill="#C9973F" radius={[4, 4, 0, 0]} maxBarSize={45}>
                    {classEnrollmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Dízimo por Turma Chart */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
          <h3 className="text-base font-bold text-white mb-4">Contribuição de Dízimo por Classe</h3>
          <div className="h-64 w-full">
            {classTitheData.every(x => x.Valor === 0) ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm">
                <Coins className="h-8 w-8 mb-2 opacity-30" />
                Nenhum dízimo registrado
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={classTitheData.filter(d => d.Valor > 0)}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="Valor"
                  >
                    {classTitheData.filter(d => d.Valor > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                    formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Contribuído']}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconSize={8}
                    wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Presenças por Data Timeline Chart */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 lg:col-span-1">
          <h3 className="text-base font-bold text-white mb-4">Registro de Frequência nos Domingos</h3>
          <div className="h-56 w-full">
            {presenceTimelineData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm">
                <Calendar className="h-8 w-8 mb-2 opacity-30" />
                Sem registros de presença
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={presenceTimelineData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="dataBr" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                    labelStyle={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold' }}
                    itemStyle={{ color: '#C9973F', fontSize: '13px' }}
                  />
                  <defs>
                    <linearGradient id="presenceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C9973F" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#C9973F" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="Presenças" stroke="#C9973F" strokeWidth={2} fillOpacity={1} fill="url(#presenceGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Bíblias vs Revistas Pie Chart */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
          <h3 className="text-base font-bold text-white mb-4">Materiais Levados à EBD</h3>
          <div className="h-56 w-full">
            {totalBibles === 0 && totalMagazines === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm">
                <Book className="h-8 w-8 mb-2 opacity-30" />
                Sem registros de materiais
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bibleMagazineData}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {bibleMagazineData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                    itemStyle={{ fontSize: '12px' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconSize={8}
                    wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Latest Attendances List */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white">Últimas Chamadas Registradas</h3>
          <span className="text-xs text-slate-500">Últimos {latestPresencas.length} registros</span>
        </div>
        {latestPresencas.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-800 p-8 text-center text-slate-500 text-sm">
            <FileCheck className="h-8 w-8 mx-auto mb-2 opacity-30" />
            Nenhuma presença cadastrada nesta congregação.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-400 uppercase font-semibold">
                  <th className="py-3 px-4 font-semibold">Aluno</th>
                  <th className="py-3 px-4 font-semibold">Classe/Turma</th>
                  <th className="py-3 px-4 font-semibold">Lição Estudada</th>
                  <th className="py-3 px-4 font-semibold text-center">Bíblia</th>
                  <th className="py-3 px-4 font-semibold text-center">Revista</th>
                  <th className="py-3 px-4 font-semibold text-right">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-sm text-slate-300">
                {latestPresencas.map((p) => {
                  const alumnoObj = findAluno(p.alunoId);
                  const turmaObj = findTurma(p.turmaId);
                  const licaoObj = findLicao(p.licaoId);
                  return (
                    <tr key={p.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="py-3 px-4 font-medium text-white">{alumnoObj?.nome || '—'}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center rounded-md bg-blue-400/10 px-2 py-1 text-xs font-semibold text-blue-400 ring-1 ring-inset ring-blue-400/20">
                          {turmaObj?.nome || '—'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 truncate max-w-[180px]">{licaoObj?.nome || '—'}</td>
                      <td className="py-3 px-4 text-center">
                        {p.qtdBiblia > 0 ? (
                          <div className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                            <Check className="h-3 w-3" />
                          </div>
                        ) : (
                          <div className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-500/15 text-rose-400">
                            <X className="h-3 w-3" />
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {p.qtdRevista > 0 ? (
                          <div className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                            <Check className="h-3 w-3" />
                          </div>
                        ) : (
                          <div className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-500/15 text-rose-400">
                            <X className="h-3 w-3" />
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-400 text-xs font-mono">{formatDateBr(p.data)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
