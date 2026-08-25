import html2canvas from 'html2canvas';
import { saveImageDataUrl } from './fileSaver';

export const exportWallpaperImage = async (
  elementId: string,
  filename: string = 'Sacred_Talisman_Wallpaper_9x16',
  scale: number = 3
): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id ${elementId} not found`);
  }

  try {
    const canvas = await html2canvas(element, {
      scale: scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: false,
    });

    const dataUrl = canvas.toDataURL('image/png', 1.0);
    await saveImageDataUrl(dataUrl, filename, 'Сакральные обои-талисман');
  } catch (error) {
    console.error('Failed to export wallpaper:', error);
    throw error;
  }
};

