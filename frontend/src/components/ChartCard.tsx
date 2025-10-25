import React, { useRef } from 'react';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';
import Button from './ui/Button';
import { Printer, Lightbulb } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ChartCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  onExplain?: () => void;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, description, children, onExplain }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    const cardElement = cardRef.current;
    if (!cardElement) return;

    // --- 1. PREPARE FOR CAPTURE ---
    const cardBgColor = getComputedStyle(document.documentElement).getPropertyValue('--color-card').trim();
    // Temporarily remove shadow for a cleaner capture
    const originalShadow = cardElement.style.boxShadow;
    cardElement.style.boxShadow = 'none';

    try {
        // --- 2. CAPTURE HIGH-RESOLUTION IMAGE ---
        // scale: 3 provides a high-resolution image for a crisp PDF.
        const canvas = await html2canvas(cardElement, { 
          backgroundColor: cardBgColor, 
          scale: 3,
          useCORS: true,
          width: cardElement.scrollWidth,
          height: cardElement.scrollHeight,
        });
        
        const imgData = canvas.toDataURL('image/png');
        
        // --- 3. SETUP PDF DOCUMENT ---
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'pt',
          format: 'a4'
        });
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const margin = 40;
        const headerFooterHeight = 40;

        // --- 4. ADD HEADER AND FOOTER ---
        pdf.setFontSize(10);
        pdf.setTextColor(100, 116, 139);
        pdf.text('Peoplelytics', margin, headerFooterHeight - 20);
        pdf.text(title, pdfWidth - margin, headerFooterHeight - 20, { align: 'right' });
        pdf.setDrawColor(226, 232, 240);
        pdf.line(margin, headerFooterHeight - 15, pdfWidth - margin, headerFooterHeight - 15);

        const dateStr = new Date().toLocaleString();
        pdf.setFontSize(8);
        pdf.text(dateStr, margin, pdfHeight - headerFooterHeight + 15);
        pdf.text('Page 1 of 1', pdfWidth - margin, pdfHeight - headerFooterHeight + 15, { align: 'right' });
        pdf.line(margin, pdfHeight - headerFooterHeight + 5, pdfWidth - margin, pdfHeight - headerFooterHeight + 5);
        
        // --- 5. CALCULATE IMAGE SIZE AND POSITION ---
        // This logic ensures the captured image fits within the PDF's content area
        // while maintaining its aspect ratio and being centered.
        const contentWidth = pdfWidth - margin * 2;
        const contentHeight = pdfHeight - headerFooterHeight * 2;
        const canvasAspectRatio = canvas.height / canvas.width;
        
        let imgWidth = contentWidth;
        let imgHeight = imgWidth * canvasAspectRatio;

        // If the image is too tall, constrain it by height and recalculate width
        if (imgHeight > contentHeight) {
            imgHeight = contentHeight;
            imgWidth = imgHeight / canvasAspectRatio;
        }

        // Center the image horizontally and vertically within the content area
        const x = (pdfWidth - imgWidth) / 2;
        const y = headerFooterHeight + (contentHeight - imgHeight) / 2;

        // --- 6. ADD IMAGE AND SAVE ---
        pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
        pdf.save(`${title.replace(/ /g, '_').toLowerCase()}.pdf`);
    } catch (err) {
        console.error("Failed to generate PDF", err);
    } finally {
        // --- 7. RESTORE ORIGINAL STYLES ---
        cardElement.style.boxShadow = originalShadow;
    }
  };

  return (
    <Card ref={cardRef}>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <div className="flex items-center -mt-2 -mr-2 flex-shrink-0">
          {onExplain && (
            <Button variant="ghost" size="sm" onClick={onExplain} className="p-2 h-10 w-10" title="Explain with AI">
              <Lightbulb className="h-5 w-5 text-text-secondary"/>
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={handleDownloadPDF} className="p-2 h-10 w-10" title="Download as PDF">
            <Printer className="h-5 w-5 text-text-secondary"/>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};

export default ChartCard;