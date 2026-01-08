import { jsPDF } from 'jspdf';
import { Note, MOMENT_TYPES, MOOD_LABELS } from './types';
import { parseWeekKey, getWeekStart, getWeekEnd, formatDateRange } from './storage';

export function exportNotesToPDF(notes: Note[]): void {
  if (notes.length === 0) return;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let currentY = margin;

  // Sort notes by week
  const sortedNotes = [...notes].sort((a, b) => a.weekKey.localeCompare(b.weekKey));
  
  // Get year from first note
  const { year } = parseWeekKey(sortedNotes[0].weekKey);

  // Title page
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text('Empty Jar', pageWidth / 2, pageHeight / 2 - 20, { align: 'center' });
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'normal');
  doc.text(`${year} Gratitude Journal`, pageWidth / 2, pageHeight / 2, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(`${notes.length} moments of gratitude`, pageWidth / 2, pageHeight / 2 + 15, { align: 'center' });
  
  doc.setTextColor(0);

  // Add notes
  sortedNotes.forEach((note, index) => {
    doc.addPage();
    currentY = margin;

    const { weekNumber, year } = parseWeekKey(note.weekKey);
    const weekStart = getWeekStart(weekNumber, year);
    const weekEnd = getWeekEnd(weekStart);
    const momentType = MOMENT_TYPES.find(t => t.value === note.momentType);

    // Week header
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(`WEEK ${weekNumber}`, margin, currentY);
    
    currentY += 6;
    doc.text(formatDateRange(weekStart, weekEnd), margin, currentY);
    
    currentY += 10;

    // Title
    if (note.title) {
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0);
      
      const titleLines = doc.splitTextToSize(note.title, contentWidth);
      doc.text(titleLines, margin, currentY);
      currentY += (titleLines.length * 8) + 5;
    }

    // Body
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40);
    
    const bodyLines = doc.splitTextToSize(note.body, contentWidth);
    doc.text(bodyLines, margin, currentY);
    currentY += (bodyLines.length * 6) + 10;

    // Meta info
    doc.setFontSize(10);
    doc.setTextColor(100);
    
    const metaItems: string[] = [];
    metaItems.push(`Mood: ${MOOD_LABELS[note.mood - 1]}`);
    if (momentType) {
      metaItems.push(`${momentType.emoji} ${momentType.label}`);
    }
    if (note.isBackfill) {
      metaItems.push('(Backfilled)');
    }
    
    doc.text(metaItems.join('  •  '), margin, currentY);
    currentY += 8;

    // Tags
    if (note.tags.length > 0) {
      doc.text(note.tags.map(t => `#${t}`).join('  '), margin, currentY);
      currentY += 8;
    }

    // Page number
    doc.setFontSize(9);
    doc.text(`${index + 1} / ${sortedNotes.length}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  });

  // Save the PDF
  const filename = `empty-jar-${year}.pdf`;
  doc.save(filename);
}
