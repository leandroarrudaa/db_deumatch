
import { jsPDF } from 'jspdf';
import { Candidate, MatchResult } from '../types';
import { generatePdfReportData } from './aiSimulation';

// --- CONFIGURAÇÃO VISUAL ---
const COLORS = {
    primary: '#FF7F47',   // Tinder Orange
    secondary: '#FF0072', // Tinder Pink
    dark: '#333333',      // Text Dark
    gray: '#64748b',      // Slate 500
    bg: '#F5F7FA'         // Neutral Gray Background
};

// CONSTANTES DE LAYOUT
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN_TOP = 45;    // Início do conteúdo após cabeçalho
const MARGIN_SIDE = 17;   // Margem lateral (~48px)
const MARGIN_BOTTOM = 20; // Espaço reservado para o rodapé
const SAFETY_LIMIT = PAGE_HEIGHT - MARGIN_BOTTOM - 10; // Ponto de quebra de página
const CONTENT_WIDTH = PAGE_WIDTH - (MARGIN_SIDE * 2);
const CARD_PADDING = 12;  // Padding interno dos cards

export const generateCandidatePDF = (candidate: Candidate, matchResult?: MatchResult) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const data = generatePdfReportData(candidate);

    // Variável de controle de fluxo vertical
    let cursorY = MARGIN_TOP;

    // --- HELPERS GRÁFICOS ---

    const hexToRgb = (hex: string) => {
        const r = parseInt(hex.substring(1, 3), 16);
        const g = parseInt(hex.substring(3, 5), 16);
        const b = parseInt(hex.substring(5, 7), 16);
        return { r, g, b };
    };

    const drawPageBackground = () => {
        doc.setFillColor(COLORS.bg);
        doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, 'F');
    };

    const drawHeader = (title: string, subtitle: string) => {
        drawPageBackground();
        
        // Linha Gradiente Superior
        doc.setFillColor(COLORS.primary);
        doc.rect(0, 0, 105, 1.5, 'F');
        doc.setFillColor(COLORS.secondary);
        doc.rect(105, 0, 105, 1.5, 'F');

        // Marca
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.setFont('helvetica', 'bold');
        doc.text("DeuMatch | Carreiras", MARGIN_SIDE, 15);

        // Título da Página
        doc.setFontSize(24);
        doc.setTextColor(COLORS.dark);
        doc.setFont('helvetica', 'bold');
        doc.text(title.toUpperCase(), MARGIN_SIDE, 28);

        // Subtítulo
        doc.setFontSize(10);
        doc.setTextColor(COLORS.primary);
        doc.setFont('helvetica', 'bold'); 
        doc.text(subtitle.toUpperCase(), MARGIN_SIDE, 34);

        // Contexto do Candidato (Direita)
        doc.setFontSize(9);
        doc.setTextColor(COLORS.dark);
        doc.text(candidate.name.toUpperCase(), PAGE_WIDTH - MARGIN_SIDE, 28, { align: 'right' });
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);
        doc.text(candidate.role.toUpperCase(), PAGE_WIDTH - MARGIN_SIDE, 33, { align: 'right' });
    };

    const drawCard = (x: number, y: number, h: number) => {
        // Sombra Suave
        doc.setFillColor(220, 222, 226); 
        doc.roundedRect(x, y + 1.5, CONTENT_WIDTH, h, 6, 6, 'F'); 
        
        // Card Principal Branco
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(x, y, CONTENT_WIDTH, h, 6, 6, 'F');
        
        // Borda Sutil
        doc.setDrawColor(235, 238, 242);
        doc.setLineWidth(0.1);
        doc.roundedRect(x, y, CONTENT_WIDTH, h, 6, 6, 'S');
    };

    const getTextHeight = (text: string, width: number, size: number, lineHeightFactor = 0.45) => {
        doc.setFontSize(size);
        const lines = doc.splitTextToSize(text, width);
        return lines.length * (size * lineHeightFactor); // altura em mm
    };

    const printParagraph = (text: string, x: number, y: number, width: number, size: number = 10, color: string = '#333333', lineHeightFactor = 0.45) => {
        doc.setFontSize(size);
        doc.setTextColor(color);
        doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(text, width);
        doc.text(lines, x, y);
        return lines.length * (size * lineHeightFactor);
    };

    // --- CONTROLE DE FLUXO E PAGINAÇÃO ---

    // Verifica se o elemento cabe na página atual. Se não, cria nova página.
    const checkPageBreak = (heightNeeded: number, nextTitle: string, nextSubtitle: string) => {
        if (cursorY + heightNeeded > SAFETY_LIMIT) {
            doc.addPage();
            drawHeader(nextTitle, nextSubtitle);
            cursorY = MARGIN_TOP; // Reinicia o cursor no topo
            return true; // Indicador de que houve quebra
        }
        return false;
    };

    // --- RENDERIZADORES DE SEÇÃO ---

    const renderDnaSection = () => {
        const title = "DNA & Trajetória";
        const subtitle = "Arquitetura da Performance";
        
        // Inicializa página se necessário (para garantir cabeçalho)
        doc.addPage();
        drawHeader(title, subtitle);
        cursorY = MARGIN_TOP;

        const textBoxWidth = CONTENT_WIDTH - (CARD_PADDING * 2);

        // Bloco 1: DNA Narrative
        const narrativeTextHeight = getTextHeight(data.identity.narrative, textBoxWidth, 9.5);
        const narrativeCardHeight = narrativeTextHeight + 35; // Header + Padding

        // Verifica overflow (raro ser a primeira coisa, mas boa prática)
        checkPageBreak(narrativeCardHeight, title, subtitle);

        drawCard(MARGIN_SIDE, cursorY, narrativeCardHeight);
        
        // Título do Card
        doc.setFontSize(12);
        doc.setTextColor(COLORS.primary);
        doc.setFont('helvetica', 'bold');
        doc.text("DNA DO CANDIDATO (DEEP DIVE)", MARGIN_SIDE + CARD_PADDING, cursorY + 12);
        doc.setDrawColor(240, 240, 240);
        doc.line(MARGIN_SIDE + CARD_PADDING, cursorY + 16, PAGE_WIDTH - MARGIN_SIDE - CARD_PADDING, cursorY + 16);

        // Conteúdo
        printParagraph(data.identity.narrative, MARGIN_SIDE + CARD_PADDING, cursorY + 24, textBoxWidth, 9.5);
        
        cursorY += narrativeCardHeight + 10; // Avança cursor + gap

        // Bloco 2: Career Analysis
        const careerTextHeight = getTextHeight(data.identity.careerAnalysis, textBoxWidth, 9.5);
        const careerCardHeight = careerTextHeight + 35;

        // Aqui é onde o overflow geralmente acontece na página 2
        checkPageBreak(careerCardHeight, title, subtitle);

        drawCard(MARGIN_SIDE, cursorY, careerCardHeight);

        doc.setFontSize(12);
        doc.setTextColor(COLORS.secondary);
        doc.setFont('helvetica', 'bold');
        doc.text("ANÁLISE CRÍTICA DE TRAJETÓRIA", MARGIN_SIDE + CARD_PADDING, cursorY + 12);
        doc.setDrawColor(240, 240, 240);
        doc.line(MARGIN_SIDE + CARD_PADDING, cursorY + 16, PAGE_WIDTH - MARGIN_SIDE - CARD_PADDING, cursorY + 16);

        printParagraph(data.identity.careerAnalysis, MARGIN_SIDE + CARD_PADDING, cursorY + 24, textBoxWidth, 9.5);

        cursorY += careerCardHeight + 10;
    };

    const renderPsychometricsSection = () => {
        const title = "Raio-X Psicométrico";
        const subtitle = "Mapeamento de 20 Facetas";

        doc.addPage();
        drawHeader(title, subtitle);
        cursorY = MARGIN_TOP;

        // DIMENSÕES FIXAS OTIMIZADAS PARA PÁGINA ÚNICA
        const blockHeight = 38; 
        const blockGap = 4;

        const drawFacetBlock = (blockTitle: string, color: string, traits: {l: string, v: number}[]) => {
            drawCard(MARGIN_SIDE, cursorY, blockHeight);
            
            // Strip Colorida
            doc.setFillColor(color);
            doc.roundedRect(MARGIN_SIDE, cursorY, 3, blockHeight, 1, 1, 'F');

            // Título
            doc.setTextColor(color);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text(blockTitle.toUpperCase(), MARGIN_SIDE + CARD_PADDING, cursorY + 8);

            // Colunas de Traits
            traits.forEach((t, i) => {
                const isRightCol = i % 2 !== 0;
                const row = Math.floor(i / 2);
                
                const colX = isRightCol ? MARGIN_SIDE + (CONTENT_WIDTH / 2) + 2 : MARGIN_SIDE + CARD_PADDING;
                const rowY = cursorY + 14 + (row * 11);

                doc.setFontSize(8);
                doc.setTextColor(80, 80, 80);
                doc.setFont('helvetica', 'bold');
                doc.text(t.l.toUpperCase(), colX, rowY);

                // Barra Fundo
                doc.setFillColor(245, 247, 250);
                doc.roundedRect(colX, rowY + 2, 65, 3, 1, 1, 'F');
                
                // Barra Valor
                doc.setFillColor(color);
                doc.roundedRect(colX, rowY + 2, (65 * t.v)/100, 3, 1, 1, 'F');

                doc.setTextColor(COLORS.dark);
                doc.setFontSize(7);
                doc.text(`${t.v}%`, colX + 68, rowY + 4.5);
            });

            cursorY += blockHeight + blockGap;
        };

        drawFacetBlock("Sensibilidade Emocional", '#6366f1', [
            {l:"Autoconfiança", v:data.facets.autoconfianca},
            {l:"Temperamento", v:data.facets.temperamento},
            {l:"Impulsividade", v:data.facets.impulsividade},
            {l:"Vulnerabilidade", v:data.facets.vulnerabilidade}
        ]);
        drawFacetBlock("Amabilidade", COLORS.secondary, [
            {l:"Julgamento", v:data.facets.julgamento},
            {l:"Sensibilidade", v:data.facets.sensibilidade},
            {l:"Confronto", v:data.facets.confronto},
            {l:"Competição", v:data.facets.competicao}
        ]);
        drawFacetBlock("Extroversão", COLORS.primary, [
            {l:"Desinibição", v:data.facets.desinibicao},
            {l:"Sociabilidade", v:data.facets.sociabilidade},
            {l:"Influência", v:data.facets.influencia},
            {l:"Energia", v:data.facets.energia}
        ]);
        drawFacetBlock("Disciplina", '#10b981', [
            {l:"Ambição", v:data.facets.ambicao},
            {l:"Autodisciplina", v:data.facets.autodisciplina},
            {l:"Planejamento", v:data.facets.planejado},
            {l:"Perfeccionismo", v:data.facets.perfeccionismo}
        ]);
        drawFacetBlock("Abertura ao Novo", '#3b82f6', [
            {l:"Imaginação", v:data.facets.imaginacao},
            {l:"Intelecto", v:data.facets.abertura},
            {l:"Regulação", v:data.facets.regulacao},
            {l:"Praticidade", v:data.facets.praticidade}
        ]);
    };

    const renderSynthesisSection = () => {
        const title = "A Ponte de Inteligência";
        const subtitle = "Interpretação Holística";

        doc.addPage();
        drawHeader(title, subtitle);
        cursorY = MARGIN_TOP;

        const textBoxWidth = CONTENT_WIDTH - (CARD_PADDING * 2);
        
        const paragraphs = data.synthesis.text.split('\n\n');
        let totalHeight = 35; // Header + padding
        paragraphs.forEach(para => {
            const isHeader = para === para.toUpperCase() && para.length > 10;
            if(isHeader) totalHeight += 12;
            else totalHeight += getTextHeight(para, textBoxWidth, 10, 0.45) + 6;
        });
        
        drawCard(MARGIN_SIDE, cursorY, Math.max(200, totalHeight)); 

        doc.setFontSize(14);
        doc.setTextColor(COLORS.primary);
        doc.setFont('helvetica', 'bold');
        doc.text("DIAGNÓSTICO ESTRATÉGICO DA PERSONALIDADE", MARGIN_SIDE + CARD_PADDING, cursorY + 15);
        doc.setDrawColor(230, 230, 230);
        doc.line(MARGIN_SIDE + CARD_PADDING, cursorY + 20, PAGE_WIDTH - MARGIN_SIDE - CARD_PADDING, cursorY + 20);

        let textY = cursorY + 30;
        
        paragraphs.forEach(para => {
            const isHeader = para === para.toUpperCase() && para.length > 10;
            if (isHeader) {
                textY += 5;
                doc.setFontSize(11);
                doc.setTextColor(COLORS.dark);
                doc.setFont('helvetica', 'bold');
                doc.text(para, MARGIN_SIDE + CARD_PADDING, textY);
                textY += 6;
            } else {
                textY += printParagraph(para, MARGIN_SIDE + CARD_PADDING, textY, textBoxWidth, 10, '#444444', 0.45) + 6;
            }
        });
    };

    const renderManualSection = () => {
        const title = "Manual de Operação";
        const subtitle = "Guia Tático de Gestão";

        doc.addPage();
        drawHeader(title, subtitle);
        cursorY = MARGIN_TOP;

        const textBoxWidth = CONTENT_WIDTH - (CARD_PADDING * 2);

        const printManualBlock = (blockTitle: string, content: string, color: string, iconChar: string) => {
            const contentHeight = getTextHeight(content, textBoxWidth, 9.5, 0.4);
            const cardHeight = contentHeight + 26; // Header reduzido + Padding reduzido

            // CRÍTICO: Verifica overflow antes de desenhar
            checkPageBreak(cardHeight, title, subtitle);

            drawCard(MARGIN_SIDE, cursorY, cardHeight);

            // Ícone Círculo
            doc.setFillColor(color);
            doc.circle(MARGIN_SIDE + 12, cursorY + 12, 4, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.text(iconChar, MARGIN_SIDE + 12, cursorY + 12, { align: 'center', baseline: 'middle' });
            
            // Título
            doc.setFontSize(12);
            doc.setTextColor(color);
            doc.setFont('helvetica', 'bold');
            doc.text(blockTitle.toUpperCase(), MARGIN_SIDE + 20, cursorY + 13.5);

            // Conteúdo
            printParagraph(content, MARGIN_SIDE + CARD_PADDING, cursorY + 20, textBoxWidth, 9.5, '#444444', 0.4);

            cursorY += cardHeight + 6; // Gap reduzido entre cards
        };

        printManualBlock("Zonas de Potência (Onde ele brilha)", data.managerManual.potency, '#10b981', '+');
        printManualBlock("Zonas de Risco & O que Drena Energia", data.managerManual.risks, COLORS.secondary, '!');
        printManualBlock("Protocolo de Liderança (Como Gerir)", data.managerManual.management, '#6366f1', '?');
    };

    const drawCover = (isFront: boolean) => {
        // Gradient Background
        const c1 = hexToRgb(COLORS.primary);
        const c2 = hexToRgb(COLORS.secondary);
        const steps = 150;
        const stepHeight = 297 / steps;
        for (let i = 0; i < steps; i++) {
            const ratio = i / steps;
            const r = Math.round(c1.r + (c2.r - c1.r) * ratio);
            const g = Math.round(c1.g + (c2.g - c1.g) * ratio);
            const b = Math.round(c1.b + (c2.b - c1.b) * ratio);
            doc.setFillColor(r, g, b);
            doc.rect(0, i * stepHeight, 210, stepHeight + 0.5, 'F');
        }

        if (isFront) {
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold'); 
            doc.text("CONFIDENTIAL CANDIDATE REPORT", MARGIN_SIDE, 20);
            doc.text("2026 EDITION", PAGE_WIDTH - MARGIN_SIDE, 20, { align: 'right' });
            
            doc.setDrawColor(255, 255, 255);
            doc.setLineWidth(0.5);
            doc.line(MARGIN_SIDE, 24, PAGE_WIDTH - MARGIN_SIDE, 24);

            const centerY = PAGE_HEIGHT / 2;
            const centerX = PAGE_WIDTH / 2;

            // TITULO DA MARCA: SIMULAÇÃO MONTSERRAT EXTRABOLD
            // Centralizado Horizontal e Verticalmente
            doc.setFontSize(72);
            doc.setFont('helvetica', 'bold');
            // charSpace negativo (-2.5) agrupa as letras para dar peso visual
            doc.text("DeuMatch", centerX, centerY - 15, { align: 'center', charSpace: -2.5 });
            
            // NOME DO CANDIDATO: MENOR E MAIS BAIXO
            // Ajustado para criar hierarquia visual clara
            const nameY = centerY + 65; // Mais abaixo
            const nameLines = doc.splitTextToSize(candidate.name.toUpperCase(), 160);
            
            doc.setFontSize(22); // Reduzido de 36 para 22
            doc.setFont('helvetica', 'normal'); 
            doc.text(nameLines, centerX, nameY, { align: 'center', charSpace: 0 }); // Reset charSpace
            
            const roleY = nameY + (nameLines.length * 10) + 5;
            doc.setFillColor(255, 255, 255);
            const roleWidth = doc.getTextWidth(candidate.role.toUpperCase()) + 20;
            doc.roundedRect(centerX - (roleWidth/2), roleY - 6, roleWidth, 10, 5, 5, 'F');
            
            doc.setTextColor(COLORS.secondary);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text(candidate.role.toUpperCase(), centerX, roleY + 0.5, { align: 'center', charSpace: 0 });
        } else {
             const centerY = PAGE_HEIGHT / 2;
             const centerX = PAGE_WIDTH / 2;
             doc.setTextColor(255, 255, 255);
             doc.setFontSize(60);
             doc.setFont('helvetica', 'bold');
             doc.text("DeuMatch", centerX, centerY, { align: 'center', charSpace: -2.5 });
             
             doc.setFontSize(12);
             doc.setFont('helvetica', 'normal');
             doc.text("www.deumatch.com.br", centerX, 270, { align: 'center', charSpace: 0 });
        }
    };

    // =========================================================
    // EXECUÇÃO DO FLUXO DE PÁGINAS
    // =========================================================
    
    // 1. Capa
    drawCover(true);

    // 2. DNA & Carreira (Pode gerar múltiplas páginas)
    renderDnaSection();

    // 3. Psicométrico (Pode gerar quebra se altura mudar)
    renderPsychometricsSection();

    // 4. Síntese
    renderSynthesisSection();

    // 5. Manual (Crítico para overflow)
    renderManualSection();

    // 6. Contra-capa
    doc.addPage();
    drawCover(false);

    // =========================================================
    // POS-PROCESSAMENTO: NUMERAÇÃO DE PÁGINAS
    // =========================================================
    const totalPages = doc.getNumberOfPages();
    for (let i = 2; i < totalPages; i++) { // Pula capa (1) e contra-capa (última)
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(180, 180, 180);
        doc.text(`CONFIDENTIAL DOSSIER • GENERATED BY DEUMATCH AI`, MARGIN_SIDE, 285);
        doc.text(`${i} / ${totalPages - 1}`, PAGE_WIDTH - MARGIN_SIDE, 285, { align: 'right' });
    }

    doc.save(`Elite_Dossier_${candidate.name.replace(/\s+/g, '_')}.pdf`);
};
