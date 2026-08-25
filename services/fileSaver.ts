import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import type { jsPDF } from 'jspdf';

export interface SaveFileResult {
  success: boolean;
  method: 'native_filesystem' | 'native_share' | 'web_share' | 'browser_download';
  message?: string;
}

/**
 * Convert Blob to Base64 string safely across all platforms
 */
export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read blob data'));
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      // Extract pure base64 part
      const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
      resolve(base64);
    };
    reader.readAsDataURL(blob);
  });
}

/**
 * Universal file saver that works reliably on:
 * 1. Android Native App (Capacitor APK WebView) via Filesystem + Share API
 * 2. Mobile Chrome / Mobile Safari via Web Share API
 * 3. Desktop Browsers via Blob URL download
 */
export async function saveFileToDevice(
  blob: Blob,
  filename: string,
  mimeType: string,
  title?: string
): Promise<SaveFileResult> {
  const cleanTitle = title || filename.replace(/[_-]/g, ' ').replace(/\.[a-zA-Z0-9]+$/, '');
  const isNative = Capacitor.isNativePlatform();

  // 1. Android / iOS Native App (Capacitor WebView)
  if (isNative) {
    try {
      const base64Data = await blobToBase64(blob);
      
      // Save file to Cache or Documents directory
      const writeResult = await Filesystem.writeFile({
        path: filename,
        data: base64Data,
        directory: Directory.Cache,
        recursive: true
      });

      const fileUri = writeResult.uri;

      // Trigger native Android Share / Save Sheet
      try {
        const canShareRes = await Share.canShare().catch(() => ({ value: true }));
        if (canShareRes.value) {
          await Share.share({
            title: cleanTitle,
            text: `Сакральный манускрипт: ${cleanTitle}`,
            url: fileUri,
            dialogTitle: `Сохранить или отправить ${filename}`
          });
          return { success: true, method: 'native_share' };
        }
      } catch (shareErr) {
        console.warn('Capacitor Share failed, file saved in Cache:', shareErr);
      }

      return { success: true, method: 'native_filesystem' };
    } catch (nativeErr) {
      console.warn('Capacitor Filesystem write failed, falling back to Web API:', nativeErr);
    }
  }

  // 2. Mobile Browser (Android Chrome, iOS Safari) using Web Share API with File
  const isMobileBrowser = typeof navigator !== 'undefined' && 
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');

  if (isMobileBrowser && typeof navigator !== 'undefined' && 'canShare' in navigator) {
    try {
      const file = new File([blob], filename, { type: mimeType, lastModified: Date.now() });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: cleanTitle,
          text: `Сакральный файл: ${cleanTitle}`
        });
        return { success: true, method: 'web_share' };
      }
    } catch (shareErr: any) {
      if (shareErr?.name === 'AbortError') {
        // User just cancelled the share sheet, file was prepared successfully
        return { success: true, method: 'web_share' };
      }
      console.warn('Web Share API failed, falling back to standard download:', shareErr);
    }
  }

  // 3. Desktop / Standard Browser Download Fallback
  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = url;
    link.download = filename;
    link.target = '_self';
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      URL.revokeObjectURL(url);
    }, 2500);

    return { success: true, method: 'browser_download' };
  } catch (downloadErr) {
    console.error('Standard browser download failed:', downloadErr);
    // Final fallback: try opening in a new tab/window
    try {
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      return { success: true, method: 'browser_download' };
    } catch (winErr) {
      throw new Error(`Не удалось сохранить файл: ${winErr}`);
    }
  }
}

/**
 * Save jsPDF document to device
 */
export async function savePdfDocument(
  doc: jsPDF, 
  filename: string, 
  title?: string
): Promise<SaveFileResult> {
  const safeFilename = filename.toLowerCase().endsWith('.pdf') ? filename : `${filename}.pdf`;
  const blob = doc.output('blob');
  return await saveFileToDevice(blob, safeFilename, 'application/pdf', title);
}

/**
 * Save audio WAV blob to device
 */
export async function saveAudioBlob(
  blob: Blob, 
  filename: string, 
  title?: string
): Promise<SaveFileResult> {
  const safeFilename = filename.toLowerCase().endsWith('.wav') ? filename : `${filename}.wav`;
  return await saveFileToDevice(blob, safeFilename, 'audio/wav', title);
}

/**
 * Save data URL image (PNG / JPG) to device
 */
export async function saveImageDataUrl(
  dataUrl: string, 
  filename: string, 
  title?: string
): Promise<SaveFileResult> {
  const safeFilename = filename.toLowerCase().endsWith('.png') ? filename : `${filename}.png`;
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return await saveFileToDevice(blob, safeFilename, 'image/png', title);
}
