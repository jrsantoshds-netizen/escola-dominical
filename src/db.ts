import { Congregation, User, Aluno, Professor, Licao, Turma, Presenca, Dizimo } from './types';

export interface DatabaseState {
  congregacoes: Congregation[];
  usuarios: User[];
  alunos: Record<string, Aluno[]>;
  professores: Record<string, Professor[]>;
  licoes: Record<string, Licao[]>;
  turmas: Record<string, Turma[]>;
  presencas: Record<string, Presenca[]>;
  dizimos: Record<string, Dizimo[]>;
}

const INITIAL_DB: DatabaseState = {
  congregacoes: [
    { id: 'c1', nome: 'Sede' },
    { id: 'c2', nome: 'Congregação Vila Nova' },
    { id: 'c3', nome: 'Congregação Centro' }
  ],
  usuarios: [
    { id: 'u1', nome: 'Administrador', usuario: 'admin', senha: 'admin123', role: 'admin', congregacaoId: 'c1' },
    { id: 'u2', nome: 'Maria Silva', usuario: 'maria', senha: '123456', role: 'usuario', congregacaoId: 'c2' },
    { id: 'u3', nome: 'João Santos', usuario: 'joao', senha: '123456', role: 'usuario', congregacaoId: 'c3' }
  ],
  alunos: {
    'c1': [
      { id: 'a1', nome: 'Carlos Eduardo', endereco: 'Rua das Flores, 123', whatsapp: '11999887766' },
      { id: 'a2', nome: 'Ana Beatriz', endereco: 'Av. Brasil, 456', whatsapp: '11988776655' },
      { id: 'a3', nome: 'Pedro Henrique', endereco: 'Rua São Paulo, 789', whatsapp: '11977665544' },
      { id: 'a4', nome: 'Lucia Fernanda', endereco: 'Rua Paz, 321', whatsapp: '11966554433' },
      { id: 'a5', nome: 'Roberto Carlos', endereco: 'Av. Liberdade, 654', whatsapp: '11955443322' }
    ],
    'c2': [
      { id: 'a6', nome: 'Fernanda Lima', endereco: 'Rua Vila Nova, 10', whatsapp: '11944332211' },
      { id: 'a7', nome: 'Ricardo Souza', endereco: 'Rua Vila Nova, 20', whatsapp: '11933221100' }
    ],
    'c3': [
      { id: 'a8', nome: 'Patricia Alves', endereco: 'Rua Centro, 55', whatsapp: '11922110099' },
      { id: 'a9', nome: 'Marcos Oliveira', endereco: 'Av. Centro, 100', whatsapp: '11911009988' }
    ]
  },
  professores: {
    'c1': [
      { id: 'p1', nome: 'Pastor José Mendes', endereco: 'Rua Pastor, 100', whatsapp: '11900000001' },
      { id: 'p2', nome: 'Dra. Raquel Torres', endereco: 'Rua Sabedoria, 200', whatsapp: '11900000002' }
    ],
    'c2': [
      { id: 'p3', nome: 'Ev. Antonio Ferreira', endereco: 'Rua Vila Nova, 50', whatsapp: '11900000003' }
    ],
    'c3': [
      { id: 'p4', nome: 'Dia. Cleusa Martins', endereco: 'Rua Centro, 30', whatsapp: '11900000004' }
    ]
  },
  licoes: {
    'c1': [
      { id: 'l1', nome: 'O Amor de Deus' },
      { id: 'l2', nome: 'A Fé que Vence' },
      { id: 'l3', nome: 'O Fruto do Espírito' },
      { id: 'l4', nome: 'A Oração Eficaz' }
    ],
    'c2': [
      { id: 'l5', nome: 'Jesus o Bom Pastor' },
      { id: 'l6', nome: 'Parábolas de Jesus' }
    ],
    'c3': [
      { id: 'l7', nome: 'Os Dez Mandamentos' }
    ]
  },
  turmas: {
    'c1': [
      { id: 't1', nome: 'Classe Adultos', alunoIds: ['a1', 'a2', 'a3'], licaoId: 'l1' },
      { id: 't2', nome: 'Classe Jovens', alunoIds: ['a4', 'a5'], licaoId: 'l2' }
    ],
    'c2': [
      { id: 't3', nome: 'Classe Geral', alunoIds: ['a6', 'a7'], licaoId: 'l5' }
    ],
    'c3': [
      { id: 't4', nome: 'Classe Principal', alunoIds: ['a8', 'a9'], licaoId: 'l7' }
    ]
  },
  presencas: {
    'c1': [
      { id: 'pr1', alunoId: 'a1', turmaId: 't1', licaoId: 'l1', qtdBiblia: 1, qtdRevista: 1, data: '2025-01-12' },
      { id: 'pr2', alunoId: 'a2', turmaId: 't1', licaoId: 'l1', qtdBiblia: 0, qtdRevista: 1, data: '2025-01-12' },
      { id: 'pr3', alunoId: 'a3', turmaId: 't1', licaoId: 'l1', qtdBiblia: 1, qtdRevista: 1, data: '2025-01-12' },
      { id: 'pr4', alunoId: 'a4', turmaId: 't2', licaoId: 'l2', qtdBiblia: 1, qtdRevista: 0, data: '2025-01-12' },
      { id: 'pr5', alunoId: 'a5', turmaId: 't2', licaoId: 'l2', qtdBiblia: 1, qtdRevista: 1, data: '2025-01-12' },
      { id: 'pr6', alunoId: 'a1', turmaId: 't1', licaoId: 'l2', qtdBiblia: 1, qtdRevista: 1, data: '2025-01-19' },
      { id: 'pr7', alunoId: 'a2', turmaId: 't1', licaoId: 'l2', qtdBiblia: 1, qtdRevista: 1, data: '2025-01-19' },
      { id: 'pr8', alunoId: 'a4', turmaId: 't2', licaoId: 'l3', qtdBiblia: 0, qtdRevista: 1, data: '2025-01-19' }
    ],
    'c2': [
      { id: 'pr9', alunoId: 'a6', turmaId: 't3', licaoId: 'l5', qtdBiblia: 1, qtdRevista: 1, data: '2025-01-12' },
      { id: 'pr10', alunoId: 'a7', turmaId: 't3', licaoId: 'l5', qtdBiblia: 1, qtdRevista: 1, data: '2025-01-12' }
    ],
    'c3': [
      { id: 'pr11', alunoId: 'a8', turmaId: 't4', licaoId: 'l7', qtdBiblia: 1, qtdRevista: 0, data: '2025-01-12' }
    ]
  },
  dizimos: {
    'c1': [
      { id: 'd1', turmaId: 't1', valor: 150, data: '2025-01-12' },
      { id: 'd2', turmaId: 't2', valor: 80, data: '2025-01-12' },
      { id: 'd3', turmaId: 't1', valor: 120, data: '2025-01-19' },
      { id: 'd4', turmaId: 't2', valor: 95, data: '2025-01-19' }
    ],
    'c2': [
      { id: 'd5', turmaId: 't3', valor: 200, data: '2025-01-12' }
    ],
    'c3': [
      { id: 'd6', turmaId: 't4', valor: 130, data: '2025-01-12' }
    ]
  }
};

const STORAGE_KEY = 'ieadtam_ebd_db_v1';

export function getDatabase(): DatabaseState {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      // Ensure all fields exist
      if (parsed.usuarios && parsed.congregacoes && parsed.alunos && parsed.professores) {
        return parsed as DatabaseState;
      }
    }
  } catch (error) {
    console.error('Failed to parse localStorage EBD DB', error);
  }
  
  // Save initial database back if not set
  saveDatabase(INITIAL_DB);
  return JSON.parse(JSON.stringify(INITIAL_DB)); // deep copy
}

export function saveDatabase(db: DatabaseState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (error) {
    console.error('Failed to save to localStorage', error);
  }
}

export function resetDatabase(): DatabaseState {
  saveDatabase(INITIAL_DB);
  return JSON.parse(JSON.stringify(INITIAL_DB));
}

export function generateUUID(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
}

export function formatDateBr(dateString: string): string {
  if (!dateString) return '—';
  const parts = dateString.split('-');
  return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateString;
}
