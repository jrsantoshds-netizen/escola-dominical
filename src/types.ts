export interface Congregation {
  id: string;
  nome: string;
}

export interface User {
  id: string;
  nome: string;
  usuario: string; // login username
  senha?: string;
  role: 'admin' | 'usuario';
  congregacaoId: string;
}

export interface Aluno {
  id: string;
  nome: string;
  endereco: string;
  whatsapp: string;
}

export interface Professor {
  id: string;
  nome: string;
  endereco: string;
  whatsapp: string;
}

export interface Licao {
  id: string;
  nome: string;
}

export interface Turma {
  id: string;
  nome: string;
  alunoIds: string[];
  licaoId: string; // The active lesson for this class
}

export interface Presenca {
  id: string;
  alunoId: string;
  turmaId: string;
  licaoId: string;
  qtdBiblia: number; // 0 or 1
  qtdRevista: number; // 0 or 1
  data: string; // YYYY-MM-DD
}

export interface Dizimo {
  id: string;
  turmaId: string;
  valor: number;
  data: string; // YYYY-MM-DD
}

export type PageType = 
  | 'dashboard'
  | 'alunos'
  | 'professores'
  | 'licoes'
  | 'turmas'
  | 'presenca'
  | 'dizimo'
  | 'usuarios'
  | 'relatorios'
  | 'sedes';

export function normalizeText(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

