import React from 'react';
import { Aluno, Turma, Presenca, Dizimo, Licao } from '../types';
import { 
  Printer, 
  TrendingUp, 
  Calendar, 
  Coins, 
  Award, 
  BookOpen, 
  FileCheck,
  Check,
  X,
  FileDown
} from 'lucide-react';
import { jsPDF } from 'jspdf';
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
  LineChart, 
  Line, 
  Legend 
} from 'recharts';
import { formatDateBr } from '../db';

const getSvgLogoDataUrl = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const svgString = `<svg viewBox="0 0 500 500" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <path id="textArcTop" d="M 36 250 A 214 214 0 0 1 464 250" fill="none" />
          <path id="textArcBottom" d="M 464 250 A 214 214 0 0 1 36 250" fill="none" />
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFE57F" />
            <stop offset="40%" stop-color="#FAD02C" />
            <stop offset="100%" stop-color="#C59600" />
          </linearGradient>
          <linearGradient id="mapGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#F8FAF9" />
            <stop offset="100%" stop-color="#CFDAD6" />
          </linearGradient>
          <linearGradient id="biblePages" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#FFFFFF" />
            <stop offset="50%" stop-color="#F0F4F2" />
            <stop offset="100%" stop-color="#E6ECE9" />
          </linearGradient>
        </defs>

        <circle cx="250" cy="250" r="244" fill="#0E5C3B" stroke="url(#goldGradient)" stroke-width="6" />
        <circle cx="250" cy="250" r="192" fill="#FFFFFF" stroke="url(#goldGradient)" stroke-width="8" />

        <g>
          <use href="#textArcTop" fill="none" />
          <use href="#textArcBottom" fill="none" />
          
          <text fill="#FFFFFF" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="900" letter-spacing="0.8">
            <textPath href="#textArcTop" startOffset="50%" text-anchor="middle">IGREJA EVANGÉLICA ASSEMBLEIA DE DEUS NO AMAZONAS</textPath>
          </text>

          <text fill="#FFFFFF" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="900" letter-spacing="4">
            <textPath href="#textArcBottom" startOffset="50%" text-anchor="middle">IEADTAM TRADICIONAL</textPath>
          </text>
        </g>

        <circle cx="40" cy="250" r="5" fill="#FAD02C" />
        <circle cx="460" cy="250" r="5" fill="#FAD02C" />

        <g transform="translate(0, 0)">
          <path d="M 235 390 C 245 390, 258 393, 276 398 C 290 402, 298 412, 296 422 C 294 430, 288 442, 278 454 C 270 464, 264 472, 258 481 C 255 485, 251 485, 248 480 C 243 470, 241 454, 241 445 C 241 435, 235 428, 231 418 C 227 410, 227 400, 235 390 Z" fill="url(#mapGradient)" stroke="#ACBFB9" stroke-width="1.2" />
          <path d="M 241 411 C 244 406, 252 404, 258 407 C 260 410, 258 416, 254 419 C 249 421, 242 417, 241 411 Z" fill="#0E5C3B" stroke="#FFFFFF" stroke-width="0.8" />
        </g>

        <g>
          <path d="M 115 385 Q 185 365, 250 376 Q 315 365, 385 385 L 385 390 Q 315 370, 250 381 Q 185 370, 115 390 Z" fill="#D6E2DE" />
          <path d="M 112 388 Q 183 368, 250 379 Q 317 368, 388 388" stroke="url(#goldGradient)" stroke-width="4" fill="none" />
          <path d="M 250 324 Q 185 310, 115 328 L 115 385 Q 185 365, 250 376 Z" fill="url(#biblePages)" stroke="#C5D5D0" stroke-width="1" />
          <path d="M 250 324 Q 315 310, 385 328 L 385 385 Q 315 365, 250 376 Z" fill="url(#biblePages)" stroke="#C5D5D0" stroke-width="1" />
          <line x1="250" y1="324" x2="250" y2="376" stroke="#ACBFB9" stroke-width="2.5" />
          <path d="M 132 338 Q 182 326, 233 336" stroke="#1B2421" stroke-width="2" fill="none" opacity="0.65" stroke-dasharray="3, 2" />
          <path d="M 132 347 Q 182 335, 233 345" stroke="#1B2421" stroke-width="2" fill="none" opacity="0.65" stroke-dasharray="18, 4, 6, 2" />
          <path d="M 132 356 Q 182 344, 233 354" stroke="#1B2421" stroke-width="2" fill="none" opacity="0.65" stroke-dasharray="10, 3, 10, 2" />
          <path d="M 132 365 Q 182 353, 233 363" stroke="#1B2421" stroke-width="2" fill="none" opacity="0.65" stroke-dasharray="14, 3, 6, 2" />
          <path d="M 267 336 Q 318 326, 368 338" stroke="#1B2421" stroke-width="2" fill="none" opacity="0.65" stroke-dasharray="10, 4, 10, 2" />
          <path d="M 267 345 Q 318 335, 368 347" stroke="#1B2421" stroke-width="2" fill="none" opacity="0.65" stroke-dasharray="3, 2, 15, 3" />
          <path d="M 267 354 Q 318 344, 368 356" stroke="#1B2421" stroke-width="2" fill="none" opacity="0.65" stroke-dasharray="16, 4, 4, 2" />
          <path d="M 267 363 Q 318 353, 368 365" stroke="#1B2421" stroke-width="2" fill="none" opacity="0.65" stroke-dasharray="8, 3, 14, 2" />
        </g>

        <text x="250" y="288" fill="#0E5C3B" font-family="Georgia, serif" font-size="54" font-weight="bold" text-anchor="middle" letter-spacing="1.5">IEADTAM</text>

        <g>
          <path d="M 250 326 C 220 300, 210 265, 232 238 C 242 225, 250 195, 250 190 C 250 195, 258 225, 268 238 C 290 265, 280 300, 250 326 Z" fill="#AD1C1C" />
          <path d="M 250 322 C 228 300, 220 272, 236 248 C 244 236, 250 208, 250 204 C 250 208, 256 236, 264 248 C 280 272, 272 300, 250 322 Z" fill="#F97316" />
          <path d="M 250 316 C 235 298, 230 278, 242 258 C 246 248, 250 225, 250 220 C 250 225, 254 248, 258 258 C 270 278, 265 298, 250 316 Z" fill="#FACC15" />
          <path d="M 250 304 C 242 290, 240 278, 246 265 Q 250 248, 250 245 Q 250 248, 254 265 C 260 278, 258 290, 250 304 Z" fill="#FEF08A" opacity="0.95" />
        </g>

        <g>
          <path d="M 250 198 C 220 190, 182 170, 138 128 C 126 116, 128 110, 142 116 C 168 128, 192 144, 218 162 C 202 153, 178 138, 155 125 C 145 120, 148 114, 160 120 C 184 132, 206 148, 226 166 C 208 156, 185 142, 168 132 C 158 127, 162 121, 175 127 C 198 138, 218 154, 238 174 C 232 166, 210 152, 192 142 C 182 137, 186 131, 198 137 C 220 148, 238 163, 250 182 Z" fill="#FFFFFF" stroke="#CFDAD6" stroke-width="0.8" />
          <path d="M 250 198 C 280 190, 318 170, 362 128 C 374 116, 372 110, 358 116 C 332 128, 308 144, 282 162 C 298 153, 322 138, 345 125 C 355 120, 352 114, 340 120 C 316 132, 294 148, 274 166 C 292 156, 315 142, 332 132 C 342 127, 338 121, 325 127 C 302 138, 282 154, 262 174 C 268 166, 290 152, 308 142 C 318 137, 314 131, 302 137 C 280 148, 262 163, 250 182 Z" fill="#FFFFFF" stroke="#CFDAD6" stroke-width="0.8" />
          <path d="M 242 205 C 236 218, 222 232, 212 240 C 205 244, 208 248, 216 244 C 230 238, 242 225, 248 214 C 246 226, 238 240, 232 250 C 228 255, 232 258, 238 252 C 246 244, 249 232, 250 220 C 250 234, 250 250, 250 258 C 250 262, 250 262, 250 258 C 251 232, 254 244, 262 252 C 268 258, 272 255, 268 250 C 262 240, 254 226, 252 214 C 258 225, 270 238, 284 244 C 292 248, 295 244, 288 240 C 278 232, 264 218, 258 205 Z" fill="#FFFFFF" stroke="#CFDAD6" stroke-width="0.8" />
          <path d="M 245 198 C 242 185, 238 165, 242 148 C 244 140, 248 135, 250 135 C 252 135, 256 140, 258 148 C 262 165, 258 185, 255 198 C 254 204, 250 210, 250 210 C 250 210, 246 204, 245 198 Z" fill="#FFFFFF" stroke="#E6ECE9" stroke-width="0.8" />
          <path d="M 249 135 L 251 135 L 250 144 Z" fill="url(#goldGradient)" />
        </g>
      </svg>`;

      const image = new Image();
      image.crossOrigin = 'anonymous';

      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      image.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 500;
          canvas.height = 500;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            URL.revokeObjectURL(url);
            reject(new Error("Canvas context is null"));
            return;
          }
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(image, 0, 0, 500, 500);

          const pngData = canvas.toDataURL('image/png');
          URL.revokeObjectURL(url);
          resolve(pngData);
        } catch (err) {
          URL.revokeObjectURL(url);
          reject(err);
        }
      };

      image.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Failed to load SVG Image onto Canvas"));
      };

      image.src = url;
    } catch (error) {
      reject(error);
    }
  });
};

interface RelatoriosViewProps {
  congName: string;
  alunos: Aluno[];
  turmas: Turma[];
  presencas: Presenca[];
  dizimos: Dizimo[];
  licoes: Licao[];
  findAluno: (id: string) => Aluno | null;
  findTurma: (id: string) => Turma | null;
  findLicao: (id: string) => Licao | null;
}

export default function RelatoriosView({
  congName,
  alunos,
  turmas,
  presencas,
  dizimos,
  licoes,
  findAluno,
  findTurma,
  findLicao
}: RelatoriosViewProps) {
  
  // STATS FORMULATION
  const totalPresencas = presencas.length;

  // Unique Sundays/Dates
  const uniqueSundays = Array.from(new Set(presencas.map((p) => p.data))).sort();
  const countSundays = Math.max(uniqueSundays.length, 1);

  // Average presence per Sunday
  const avgPresence = (totalPresencas / countSundays).toFixed(1);

  // Total finances
  const totalDizimos = dizimos.reduce((sum, d) => sum + Number(d.valor || 0), 0);

  // General presence rate
  const presenceRate = alunos.length > 0 
    ? ((totalPresencas / (alunos.length * countSundays)) * 100).toFixed(0) 
    : '0';

  // Biblia and Revista stats
  const totalBibles = presencas.reduce((sum, p) => sum + (p.qtdBiblia || 0), 0);
  const totalMagazines = presencas.reduce((sum, p) => sum + (p.qtdRevista || 0), 0);

  // 1. Frequência por Turma
  const classPresenceRate = turmas.map((t) => {
    const classPresences = presencas.filter((p) => p.turmaId === t.id).length;
    const enrolledCount = (t.alunoIds || []).length;
    const maxCapacity = enrolledCount * countSundays;
    const rate = maxCapacity > 0 ? Math.round((classPresences / maxCapacity) * 100) : 0;
    return {
      id: t.id,
      nome: t.nome,
      rate,
      totalPres: classPresences,
      enrolled: enrolledCount
    };
  });

  // 2. Dízimo por Turma Chart Data
  const classFinances = turmas.map((t) => {
    const sum = dizimos
      .filter((d) => d.turmaId === t.id)
      .reduce((s, x) => s + parseFloat(x.valor.toString()), 0);
    return {
      nome: t.nome,
      Total: sum
    };
  });

  // 3. Top Frequência Leaderboard (Top 10 Alunos)
  const studentLeaderboard = alunos.map((a) => {
    const presCount = presencas.filter((p) => p.alunoId === a.id).length;
    const pct = countSundays > 0 ? Math.round((presCount / countSundays) * 100) : 0;
    return {
      nome: a.nome,
      count: presCount,
      pct
    };
  })
  .sort((a, b) => b.count - a.count)
  .slice(0, 10);

  // 4. Lições Mais Aplicadas (count presences by lesson)
  const lessonCounts: Record<string, number> = {};
  presencas.forEach((p) => {
    lessonCounts[p.licaoId] = (lessonCounts[p.licaoId] || 0) + 1;
  });
  const lessonStatsData = Object.keys(lessonCounts).map((lid) => {
    const lic = licoes.find((l) => l.id === lid);
    return {
      nome: lic ? lic.nome : 'Outras/Antigas',
      value: lessonCounts[lid]
    };
  })
  .sort((a, b) => b.value - a.value);

  // 5. Evolução por Data (count presences by Sunday)
  const timelineData = uniqueSundays.map((date) => {
    const count = presencas.filter((p) => p.data === date).length;
    return {
      dataBr: formatDateBr(date),
      dataRaw: date,
      Presenças: count
    };
  });

  const COLORS = ['#C9973F', '#10B981', '#3B82F6', '#FB923C', '#A78BFA', '#F87171', '#F59E0B', '#14B8A6'];

  const [isGenerating, setIsGenerating] = React.useState(false);

  const generatePdf = async () => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      let y = 15;
      let pageCount = 1;

      // Helper to check page-overflow and add a new page
      const checkPageOverflow = (neededHeight: number) => {
        if (y + neededHeight > 275) {
          // Footer for full page
          doc.setFont('Helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(148, 163, 184);
          doc.text(`Portal EBD IEADTAM — Página ${pageCount}`, 195, 287, { align: 'right' });

          doc.addPage();
          pageCount++;
          y = 15;

          // Print header indicator elements on new page
          doc.setFont('Helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(148, 163, 184);
          doc.text(`Relatório EBD — IEADTAM (${congName}) — Continuação`, 15, y);
          y += 5;
          doc.setLineWidth(0.1);
          doc.setDrawColor(226, 232, 240);
          doc.line(15, y, 195, y);
          y += 8;
        }
      };

      // --- PAGE 1 HEADER ---
      doc.setFillColor(234, 245, 238); // Soft sage green background for banner
      doc.setDrawColor(180, 220, 195); // Matching subtle border
      doc.rect(15, y, 180, 24, 'FD');

      let textXOffset = 20;

      try {
        const logoBase64 = await getSvgLogoDataUrl();
        if (logoBase64) {
          // Insert the high-fidelity circular IEADTAM vectors on the left of the banner
          doc.addImage(logoBase64, 'PNG', 18, y + 3, 18, 18);
          textXOffset = 39; // offset text so it sits beautifully next to the logo
        }
      } catch (logoErr) {
        console.warn("Could not embed high-fidelity logo inside PDF header:", logoErr);
      }

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(14, 92, 59); // High-fidelity dark green matching logo
      doc.text('PORTAL ESCOLA DOMINICAL — IEADTAM', textXOffset, y + 8);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85); // Slate-700
      doc.text(`Congregação: ${congName} — Relatório Consolidado de Estatísticas`, textXOffset, y + 14);
      
      // Add date/time of extraction in pt-BR format
      const extractionDate = new Date().toLocaleString('pt-BR');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139); // Slate-500
      doc.text(`Gerado em: ${extractionDate} (UTC)`, textXOffset, y + 19);

      y += 32;

    // --- CORE CONSOLIDATED STATS BANNER (GRID REPLICA) ---
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text('RESUMO GERAL DAS MÉTRICAS', 15, y);
    y += 3;
    doc.setLineWidth(0.3);
    doc.setDrawColor(201, 151, 63); // Amber border
    doc.line(15, y, 195, y);
    y += 6;

    // 5 stats boxes: box width = 33mm each, spacing = 3mm
    const boxW = 33;
    const boxH = 14;
    const gap = 3.5;

    const statsMetrics = [
      { num: `${totalPresencas}`, label: 'Presenças' },
      { num: `${avgPresence}`, label: 'Média/Dom' },
      { num: `${uniqueSundays.length}`, label: 'Aulas Dadas' },
      { num: `R$ ${totalDizimos.toFixed(0)}`, label: 'Total Dízimos' },
      { num: `${presenceRate}%`, label: 'Freq. Média' }
    ];

    statsMetrics.forEach((metric, idx) => {
      const bx = 15 + idx * (boxW + gap);
      // Background box
      doc.setFillColor(248, 250, 252); // light slate gray-50
      doc.rect(bx, y, boxW, boxH, 'F');
      doc.setDrawColor(226, 232, 240); // slate-200 border
      doc.setLineWidth(0.1);
      doc.rect(bx, y, boxW, boxH, 'S');

      // Value
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(15, 23, 42);
      doc.text(metric.num, bx + boxW / 2, y + 5.5, { align: 'center' });

      // Label
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text(metric.label, bx + boxW / 2, y + 10.5, { align: 'center' });
    });

    y += boxH + 10;

    // --- SECTION 1: FREQUÊNCIA POR CLASSE ---
    checkPageOverflow(40);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text('FREQUÊNCIA DETALHADA POR CLASSE', 15, y);
    y += 3;
    doc.setLineWidth(0.2);
    doc.setDrawColor(226, 232, 240);
    doc.line(15, y, 195, y);
    y += 5;

    // Table Header
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105); // slate-600
    doc.text('Nome da Classe', 17, y);
    doc.text('Matriculados', 85, y, { align: 'right' });
    doc.text('Presenças Totais', 125, y, { align: 'right' });
    doc.text('Frequência (%)', 190, y, { align: 'right' });
    y += 3;
    doc.line(15, y, 195, y);
    y += 4;

    doc.setFont('Helvetica', 'normal');
    if (classPresenceRate.length === 0) {
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('Sem turmas disponíveis no sistema.', 17, y);
      y += 6;
    } else {
      classPresenceRate.forEach((t) => {
        checkPageOverflow(10);
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(15, 23, 42);
        doc.text(t.nome, 17, y);
        doc.text(`${t.enrolled} alunos`, 85, y, { align: 'right' });
        doc.text(`${t.totalPres} presenças`, 125, y, { align: 'right' });
        
        doc.setFont('Helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(`${t.rate}%`, 190, y, { align: 'right' });
        y += 5.5;
      });
    }

    y += 6;

    // --- SECTION 2: FINANCEIRO POR CLASSE & LIÇÕES ---
    checkPageOverflow(50);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text('DÍZIMOS E LIÇÕES MAIS MINISTRADAS', 15, y);
    y += 3;
    doc.line(15, y, 195, y);
    y += 5;

    // Table Columns side-by-side
    const leftMargin = 15;
    const rightMarginStart = 110;

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('Dízimo por Classe', leftMargin + 2, y);
    doc.text('Total Coletado', leftMargin + 75, y, { align: 'right' });

    doc.text('Tema da Aula / Lição', rightMarginStart + 2, y);
    doc.text('Ministrada', rightMarginStart + 75, y, { align: 'right' });
    
    y += 3;
    doc.setDrawColor(226, 232, 240);
    doc.line(leftMargin, y, leftMargin + 80, y);
    doc.line(rightMarginStart, y, rightMarginStart + 80, y);
    y += 4;

    const maxSideRows = Math.max(classFinances.length, lessonStatsData.length);
    if (maxSideRows === 0) {
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('Nenhum dado cadastrado.', leftMargin + 2, y);
      y += 6;
    } else {
      for (let i = 0; i < maxSideRows; i++) {
        checkPageOverflow(10);
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(8);

        // Left Col (Finance)
        if (i < classFinances.length) {
          const fin = classFinances[i];
          doc.setTextColor(15, 23, 42);
          doc.text(fin.nome, leftMargin + 2, y);
          doc.setFont('Helvetica', 'bold');
          doc.setTextColor(249, 115, 22); // Orange
          doc.text(`R$ ${fin.Total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, leftMargin + 75, y, { align: 'right' });
        }

        // Right Col (Lessons)
        doc.setFont('Helvetica', 'normal');
        if (i < lessonStatsData.length) {
          const les = lessonStatsData[i];
          doc.setTextColor(15, 23, 42);
          const nameTrimmed = les.nome.length > 30 ? les.nome.substring(0, 28) + '...' : les.nome;
          doc.text(nameTrimmed, rightMarginStart + 2, y);
          doc.setFont('Helvetica', 'bold');
          doc.setTextColor(15, 23, 42);
          doc.text(`${les.value} domingo(s)`, rightMarginStart + 75, y, { align: 'right' });
        }

        y += 5.5;
      }
    }

    y += 6;

    // --- SECTION 3: TOP ALUNOS MAIS ASSÍDUOS ---
    checkPageOverflow(45);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text('LÍDERES DE PRESENÇA (TOP 10 ALUNOS ASSÍDUOS)', 15, y);
    y += 3;
    doc.setLineWidth(0.2);
    doc.setDrawColor(226, 232, 240);
    doc.line(15, y, 195, y);
    y += 5;

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('Posição & Nome do Aluno', 17, y);
    doc.text('Frequências Atendidas', 125, y, { align: 'right' });
    doc.text('Taxa Assiduidade (%)', 190, y, { align: 'right' });
    y += 3;
    doc.line(15, y, 195, y);
    y += 4;

    doc.setFont('Helvetica', 'normal');
    if (studentLeaderboard.length === 0) {
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('Nenhum dado assíduo.', 17, y);
      y += 6;
    } else {
      studentLeaderboard.forEach((student, idx) => {
        checkPageOverflow(9);
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(15, 23, 42);
        
        // Posição indicator
        doc.setFont('Helvetica', 'bold');
        doc.text(`#${idx + 1}`, 17, y);
        doc.setFont('Helvetica', 'normal');
        doc.text(student.nome, 25, y);
        
        doc.text(`${student.count} domingo(s)`, 125, y, { align: 'right' });
        
        doc.setFont('Helvetica', 'bold');
        doc.setTextColor(16, 185, 129); // Emerald text
        doc.text(`${student.pct}%`, 190, y, { align: 'right' });
        
        y += 5.2;
      });
    }

    y += 6;

    // --- SECTION 4: ESTATÍSITICO CONSOLIDADO POR DOMINGO ---
    checkPageOverflow(50);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text('ESTATÍSTICO CONSOLIDADO DE PRESENÇAS E CONTRIBUIÇÕES POR DATA', 15, y);
    y += 3;
    doc.setLineWidth(0.2);
    doc.setDrawColor(226, 232, 240);
    doc.line(15, y, 195, y);
    y += 5;

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('Domingo Letivo', 17, y);
    doc.text('Alunos Presentes', 75, y, { align: 'right' });
    doc.text('Bíblias Levadas', 110, y, { align: 'right' });
    doc.text('Revistas', 140, y, { align: 'right' });
    doc.text('Dízimo do Domingo (R$)', 190, y, { align: 'right' });
    y += 3;
    doc.line(15, y, 195, y);
    y += 4;

    doc.setFont('Helvetica', 'normal');
    if (timelineData.length === 0) {
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('Nenhum registro consolidado por data.', 17, y);
      y += 6;
    } else {
      const datesReversed = timelineData.slice().reverse();
      datesReversed.forEach((day) => {
        checkPageOverflow(9);
        const dayPresences = presencas.filter((p) => p.data === day.dataRaw);
        const dayBibles = dayPresences.filter((p) => p.qtdBiblia > 0).length;
        const dayMagazines = dayPresences.filter((p) => p.qtdRevista > 0).length;
        
        const dayTithes = dizimos
          .filter((d) => d.data === day.dataRaw)
          .reduce((sum, d) => sum + Number(d.valor || 0), 0);

        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(15, 23, 42);
        doc.text(day.dataBr, 17, y);

        doc.setFont('Helvetica', 'normal');
        doc.text(`${dayPresences.length} alunos`, 75, y, { align: 'right' });
        doc.text(`${dayBibles} bíblias`, 110, y, { align: 'right' });
        doc.text(`${dayMagazines} revistas`, 140, y, { align: 'right' });

        doc.setFont('Helvetica', 'bold');
        doc.setTextColor(249, 115, 22); // Orange for finance
        doc.text(`R$ ${dayTithes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 190, y, { align: 'right' });
        
        y += 5.2;
      });
    }

      // Final Footer
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(`Portal EBD IEADTAM — Página ${pageCount}`, 195, 287, { align: 'right' });

      // Save document
      doc.save(`Relatorio_Consolidado_EBD_${congName.replace(/\s+/g, '_')}.pdf`);
    } catch (pdfErr) {
      console.error("PDF generation failed:", pdfErr);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    try {
      window.focus();
      window.print();
    } catch (err) {
      console.warn("Erro de impressão de frame capturado:", err);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn print:bg-white print:text-black">
      {/* Relatórios Header controls (Print Trigger) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white font-serif">Gráficos e Relatórios</h2>
          <p className="text-sm mt-1 text-slate-400">
            IEADTAM — Estatísticas gerais consolidadas da congregação: <span className="text-amber-500 font-semibold">{congName}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={generatePdf}
            disabled={isGenerating}
            className={`inline-flex items-center gap-2 rounded-lg bg-amber-500 transition-all px-4 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/10 ${isGenerating ? 'opacity-60 cursor-not-allowed bg-amber-600' : 'hover:bg-amber-600 cursor-pointer'}`}
          >
            {isGenerating ? (
              <span className="flex items-center gap-1.5 animate-pulse">
                <span className="h-3.5 w-3.5 rounded-full border-2 border-slate-950 border-t-transparent animate-spin inline-block shrink-0" />
                Gerando PDF...
              </span>
            ) : (
              <>
                <FileDown className="h-4 w-4 shrink-0" />
                Exportar PDF Consolidado
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-500/30 px-4 py-2.5 text-xs font-semibold text-slate-300 transition-all cursor-pointer hover:text-amber-500"
          >
            <Printer className="h-4 w-4 text-amber-500 shrink-0" />
            Imprimir Tela
          </button>
        </div>
      </div>

      {/* Print only Header */}
      <div className="hidden print:block text-center border-b border-gray-400 pb-4 mb-4">
        <h1 className="text-3xl font-black text-black">RELATÓRIO DE DESEMPENHO EBD</h1>
        <h2 className="text-lg font-bold text-gray-700 mt-1">IGREJA ASSEMBLEIA DE DEUS - IEADTAM ({congName})</h2>
        <p className="text-xs text-gray-450 mt-1">Período de registros consolidado via Portal Escola Dominical</p>
      </div>

      {/* Five core indicators stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-center">
          <div className="text-2xl font-black text-amber-550 font-serif">{totalPresencas}</div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mt-1">Presenças</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-center">
          <div className="text-2xl font-black text-emerald-400 font-serif">{avgPresence}</div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mt-1">Média / Domingo</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-center">
          <div className="text-2xl font-black text-blue-400 font-serif">{uniqueSundays.length}</div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mt-1">Aulas dadas</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-center">
          <div className="text-2xl font-black text-orange-400 font-serif">R$ {totalDizimos.toFixed(0)}</div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mt-1">Total Dízimos</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-center col-span-2 md:col-span-1">
          <div className="text-2xl font-black text-purple-400 font-serif">{presenceRate}%</div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mt-1">Frequência média</div>
        </div>
      </div>

      {/* Graphs block 1: Class Frequency rate slider meters vs Class Financial sums */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class frequency sliders */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
          <h3 className="text-base font-bold text-white mb-5 flex items-center gap-1.5 border-b border-slate-800/60 pb-2">
            <TrendingUp className="h-4 w-4 text-amber-500" />
            Frequência por Classe (Fator Presença / Domingo)
          </h3>
          {classPresenceRate.length === 0 ? (
            <div className="text-center text-xs text-slate-600 py-6">Sem dados de turmas.</div>
          ) : (
            <div className="space-y-4 pt-1">
              {classPresenceRate.map((t, idx) => (
                <div key={t.id} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-300">
                    <span className="font-bold">{t.nome}</span>
                    <span className="text-amber-500 font-bold">{t.rate}% frequência</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-950 border border-slate-850 overflow-hidden relative">
                    <div 
                      className="h-full rounded-full bg-amber-500 transition-all duration-500 shadow-lg"
                      style={{ width: `${Math.min(t.rate, 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-[10px] text-slate-500 flex justify-between uppercase">
                    <span>{t.totalPres} presenças totais</span>
                    <span>{t.enrolled} matriculados</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Financial offerings bar chart */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
          <h3 className="text-base font-bold text-white mb-5 flex items-center gap-1.5 border-b border-slate-800/60 pb-2">
            <Coins className="h-4 w-4 text-orange-500" />
            Dízimos e Ofertas de Caixa por Classe (R$)
          </h3>
          <div className="h-56 w-full">
            {classFinances.length === 0 || classFinances.every(x => x.Total === 0) ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm italic">
                Nenhum dízimo arrecadado até agora.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classFinances} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="nome" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                    labelStyle={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold' }}
                    itemStyle={{ color: '#fb923c', fontSize: '13px' }}
                    formatter={(val: number) => [`R$ ${val.toFixed(2)}`, 'Contribuído']}
                  />
                  <Bar dataKey="Total" fill="#FB923C" radius={[4, 4, 0, 0]} maxBarSize={35}>
                    {classFinances.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Graphs block 2: Student Leaderboard Top 10 vs Lesson counters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top active students leaderboard */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
          <h3 className="text-base font-bold text-white mb-5 flex items-center gap-1.5 border-b border-slate-800/60 pb-2">
            <Award className="h-4 w-4 text-amber-500" />
            Top 10 Alunos Mais Assíduos (Líderes de Presença)
          </h3>
          
          {studentLeaderboard.length === 0 ? (
            <div className="text-center text-xs text-slate-600 py-8">Nenhum aluno cadastrado.</div>
          ) : (
            <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1">
              {studentLeaderboard.map((student, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/40 border border-slate-850/50 hover:border-amber-500/10 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold border ${
                      idx < 3 
                        ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                        : 'bg-slate-900 text-slate-450 border-slate-800'
                    }`}>
                      {idx + 1}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-white leading-none mb-1">{student.nome}</div>
                      <div className="text-[10px] text-slate-500">{student.count} domingos frequentados</div>
                    </div>
                  </div>
                  {/* Assiduity rate */}
                  <div className="text-xs font-extrabold text-emerald-400 font-mono">
                    {student.pct}% assiduidade
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Doughnut lesson stats */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
          <h3 className="text-base font-bold text-white mb-5 flex items-center gap-1.5 border-b border-slate-800/60 pb-2">
            <BookOpen className="h-4 w-4 text-amber-500" />
            Lições mais Ministradas (Frequência por Tema)
          </h3>

          <div className="h-56 w-full mb-3">
            {lessonStatsData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm italic">
                Nenhum registro de participação.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={lessonStatsData}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {lessonStatsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                    itemStyle={{ fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          {/* Custom legend logs */}
          <div className="max-h-[85px] overflow-y-auto space-y-1.5 px-2">
            {lessonStatsData.slice(0, 4).map((entry, idx) => (
              <div key={idx} className="flex justify-between items-center text-[11px] font-medium text-slate-400">
                <div className="flex items-center gap-1.5 truncate pr-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                  <span className="truncate">{entry.nome}</span>
                </div>
                <strong className="text-white shrink-0 font-mono">{entry.value}x</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sunday presence evolution area chart */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
        <h3 className="text-base font-bold text-white mb-5 flex items-center gap-1.5 border-b border-slate-800/60 pb-2">
          <Calendar className="h-4 w-4 text-amber-500" />
          Volume de Alunos Presentes no Calendário de Domingos
        </h3>
        <div className="h-56 w-full">
          {timelineData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-500 text-sm italic">
              Sem dados disponíveis de frequências Dominicais.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="dataBr" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Presenças" 
                  stroke="#C9973F" 
                  strokeWidth={2} 
                  dot={{ r: 4 }} 
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Histórico Consolidado detail log */}
      <div className="rounded-xl border border-slate-850 bg-slate-900/40 p-5">
        <h3 className="text-base font-bold text-white mb-4 border-b border-slate-800/60 pb-2">Estatístico Consolidado por Data</h3>
        
        {timelineData.length === 0 ? (
          <div className="text-center text-xs text-slate-600 py-6">Sem histórico financeiro ou de presenças.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm text-slate-350">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-400 uppercase font-semibold">
                  <th className="py-3 px-4">Domingo Letivo</th>
                  <th className="py-3 px-4">Total Presentes</th>
                  <th className="py-3 px-4">Bíblias Levadas</th>
                  <th className="py-3 px-4">Revistas Levadas</th>
                  <th className="py-3 px-4 text-right">Dízimo do Domingo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-slate-300">
                {timelineData.slice().reverse().map((day) => {
                  const dayPresences = presencas.filter((p) => p.data === day.dataRaw);
                  const dayBibles = dayPresences.filter((p) => p.qtdBiblia > 0).length;
                  const dayMagazines = dayPresences.filter((p) => p.qtdRevista > 0).length;
                  
                  const dayTithes = dizimos
                    .filter((d) => d.data === day.dataRaw)
                    .reduce((sum, d) => sum + Number(d.valor || 0), 0);

                  return (
                    <tr key={day.dataRaw} className="hover:bg-slate-800/10">
                      <td className="py-3 px-4 font-bold text-white font-mono text-xs">{day.dataBr}</td>
                      <td className="py-3 px-4">{dayPresences.length} alunos</td>
                      <td className="py-3 px-4 font-medium text-emerald-450">{dayBibles} bíblias</td>
                      <td className="py-3 px-4 font-medium text-blue-400">{dayMagazines} revistas</td>
                      <td className="py-3 px-4 text-right font-bold text-orange-400">R$ {dayTithes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
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
