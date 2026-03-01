// app/hooks/usePdfExport.ts
// C# の PrintDocument.Print() に相当するフック

'use client';

import { useState, useCallback } from 'react';

export function usePdfExport() {
  const [isExporting, setIsExporting] = useState(false);

  /**
   * 指定した要素をPDFとしてダウンロード
   * C#: Graphics.DrawImage() + PrintDocument に相当
   */
  const exportToPdf = useCallback(async (
    elementId: string,
    filename: string,
    options?: { orientation?: 'portrait' | 'landscape' }
  ) => {
    setIsExporting(true);
    try {
      // 動的インポート（バンドルサイズ最適化）
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas'),
      ]);

      const element = document.getElementById(elementId);
      if (!element) throw new Error(`Element #${elementId} not found`);

      // html2canvas でDOM→画像変換
      const canvas = await html2canvas(element, {
        scale: 2,          // Retina対応（高解像度）
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const orientation = options?.orientation ?? 'portrait';

      // A4サイズPDF生成
      const pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      // 複数ページ対応
      if (imgHeight <= pdfHeight) {
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      } else {
        let position = 0;
        let remainingHeight = imgHeight;
        while (remainingHeight > 0) {
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          remainingHeight -= pdfHeight;
          position -= pdfHeight;
          if (remainingHeight > 0) pdf.addPage();
        }
      }

      pdf.save(filename);
    } catch (err) {
      console.error('PDF export failed:', err);
      throw err;
    } finally {
      setIsExporting(false);
    }
  }, []);

  return { exportToPdf, isExporting };
}