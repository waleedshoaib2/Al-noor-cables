import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Export a page section to PDF
 * @param elementId - The ID of the element to export
 * @param filename - The name of the PDF file
 * @param title - Optional title for the PDF
 */
export async function exportToPDF(
  elementId: string,
  filename: string,
  title?: string
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with ID "${elementId}" not found`);
    return;
  }

  try {
    // Show loading indicator
    const loading = document.createElement('div');
    loading.style.position = 'fixed';
    loading.style.top = '50%';
    loading.style.left = '50%';
    loading.style.transform = 'translate(-50%, -50%)';
    loading.style.padding = '20px';
    loading.style.background = 'rgba(0, 0, 0, 0.8)';
    loading.style.color = 'white';
    loading.style.borderRadius = '8px';
    loading.style.zIndex = '10000';
    loading.textContent = 'Generating PDF...';
    document.body.appendChild(loading);

    // Create canvas from HTML element
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    // Calculate PDF dimensions
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    let position = 0;

    // Add title if provided
    if (title) {
      pdf.setFontSize(18);
      pdf.text(title, 105, 15, { align: 'center' });
      position = 25;
      heightLeft = imgHeight - 10;
    }

    // Add image to PDF
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);

    // Add new pages if content is longer than one page
    heightLeft -= pageHeight;
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Save PDF
    pdf.save(filename);

    // Remove loading indicator
    document.body.removeChild(loading);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Failed to generate PDF. Please try again.');
  }
}

/**
 * Export table data to PDF with custom formatting
 */
export async function exportTableToPDF(
  tableElement: HTMLElement,
  filename: string,
  title?: string
): Promise<void> {
  try {
    const loading = document.createElement('div');
    loading.style.position = 'fixed';
    loading.style.top = '50%';
    loading.style.left = '50%';
    loading.style.transform = 'translate(-50%, -50%)';
    loading.style.padding = '20px';
    loading.style.background = 'rgba(0, 0, 0, 0.8)';
    loading.style.color = 'white';
    loading.style.borderRadius = '8px';
    loading.style.zIndex = '10000';
    loading.textContent = 'Generating PDF...';
    document.body.appendChild(loading);

    const canvas = await html2canvas(tableElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    const pdf = new jsPDF('p', 'mm', 'a4');
    let position = 0;

    if (title) {
      pdf.setFontSize(18);
      pdf.text(title, 105, 15, { align: 'center' });
      position = 25;
      heightLeft = imgHeight - 10;
    }

    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);

    heightLeft -= pageHeight;
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
    document.body.removeChild(loading);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Failed to generate PDF. Please try again.');
  }
}

