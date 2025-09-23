import React from 'react';

export const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

export const CameraIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

export const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

export const ShareIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
    </svg>
);

export const HistoryIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const RefreshIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0120 12M20 20l-1.5-1.5A9 9 0 004 12" />
    </svg>
);

export const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

export const SparklesIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6.343 6.343l1.414 1.414M16.243 16.243l1.414 1.414M17.657 6.343l-1.414 1.414M7.757 16.243l-1.414 1.414M12 21v-4M21 12h-4M12 3v4M3 12h4m3-9v4m3 5h4m-3 9v-4" />
    </svg>
);

export const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);

export const ExclamationCircleIcon = ({ title }: { title: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
        <title>{title}</title>
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-5a1 1 0 102 0v-4a1 1 0 10-2 0v4zm1-8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
);

export const PhotoIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

export const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

export const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const QuestionMarkCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const GridIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 14a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 14a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
);

export const XIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export const ExpandIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4h4m12 4V4h-4M4 16v4h4m12-4v4h-4" />
    </svg>
);

export const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
);

export const MinusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
    </svg>
);

export const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

export const SyringeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21v-4m0 0V3m0 14h.01M6 12l6-6 6 6" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9l-6 6-6-6" />
    </svg>
);

export const CubeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1-2-1m4 4l-2 1-2-1m4-4l-2-1-2 1m0 4l2 1 2-1m-4-4v4m0 0l-2 1-2-1m4 4v4m0-4h.01M6 12h.01M18 12h.01M12 6h.01M12 18h.01M12 21a9 9 0 110-18 9 9 0 010 18z"/>
    </svg>
);

export const PencilIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
    </svg>
);

export const LipstickIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v5a2 2 0 002 2h-4a2 2 0 002-2v-5m0 0V5a2 2 0 012-2h.08a2 2 0 011.92 2.92l-4 8a2 2 0 01-1.92.08A2 2 0 018 7.08V15" />
    </svg>
);

export const UndoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 15l-3-3m0 0l3-3m-3 3h8a5 5 0 000-10H6" />
    </svg>
);
export const RedoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 15l3-3m0 0l-3-3m3 3H5a5 5 0 000 10h6" />
    </svg>
);
export const CropIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M4 7h10a2 2 0 012 2v10m-3-10h3a2 2 0 012 2v3" />
    </svg>
);

export const SpinnerIcon = ({ className }: { className?: string }) => (
    <svg className={`animate-spin h-5 w-5 ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

export const GripHorizontalIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
    </svg>
);

export const ChevronDownIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className ?? ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);

export const StarIcon = ({ filled, className }: { filled?: boolean; className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className}`} fill={filled ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
);

export const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

export const FaceBlushIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <circle cx="9.5" cy="14.5" r="1.5" fill="currentColor" fillOpacity="0.3" stroke="none" />
        <circle cx="14.5" cy="14.5" r="1.5" fill="currentColor" fillOpacity="0.3" stroke="none" />
    </svg>
);

export const BookmarkIcon = ({ filled, className }: { filled?: boolean; className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill={filled ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
);

export const CubeTransparentIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 10l-2 1-2-1m4 4l-2 1-2-1m4-4l-2-1-2 1m0 4l2 1 2-1m-4-4v4m0 0l-2 1-2-1m4 4v4m0-4h.01M6 12h.01M18 12h.01M12 6h.01M12 18h.01M12 21a9 9 0 110-18 9 9 0 010 18z" />
    </svg>
);

const LIP_ART_PATHS = [
  "M20,60 Q50,20 80,60 Q50,110 20,60 M25,55 Q50,50 75,55", // Classic Cupid's Bow
  "M10,55 C20,20 80,20 90,55 C80,85 20,85 10,55 M15,52 Q50,45 85,52", // Fuller Lips
  "M20,50 Q50,70 80,50 Q50,40 20,50 M20,50 Q50,30 80,50", // M-shaped
  "M15,60 Q50,30 85,60 Q50,90 15,60 M30,58 Q50,65 70,58", // Downturned corners
  "M25,50 Q50,35 75,50 Q50,80 25,50 M30,50 Q50,55 70,50", // Heart-shaped
  "M10,60 Q50,50 90,60 Q50,70 10,60 M10,60 Q50,40 90,60", // Wide smile
  "M30,50 Q50,40 70,50 Q50,60 30,50 M30,50 Q50,30 70,50", // Pouty
  "M20,65 C40,40 60,40 80,65 C60,80 40,80 20,65 M25,62 Q50,58 75,62", // Soft curve
  "M10,50 C30,25 70,25 90,50 C70,60 30,60 10,50 M15,48 Q50,42 85,48", // Sharp Cupid's Bow
  "M25,70 Q50,50 75,70 Q50,95 25,70 M30,68 Q50,70 70,68", // Lower heavy
  "M20,50 Q50,30 80,50 Q50,55 20,50 M25,48 Q50,45 75,48", // Upper heavy
  "M15,55 Q50,60 85,55 Q50,50 15,55 M15,55 Q50,40 85,55", // Thin lips
  "M5,50 C25,30 75,30 95,50 C75,70 25,70 5,50 M10,48 Q50,45 90,48", // Stretched
  "M30,60 Q50,45 70,60 Q50,75 30,60 M35,58 Q50,62 65,58", // Rounded
  "M20,55 Q50,40 80,55 Q50,80 20,55 M25,53 Q50,55 75,53", // Teardrop upper
  "M18,60 Q50,25 82,60 Q50,105 18,60 M23,55 Q50,52 77,55", // Voluminous
  "M22,52 Q50,38 78,52 Q50,72 22,52 M22,52 Q50,48 78,52", // Pointed cupid
  "M15,65 Q50,50 85,65 Q50,80 15,65 M20,63 Q50,68 80,63", // Gentle wave
  "M28,48 Q50,30 72,48 Q50,65 28,48 M32,47 Q50,45 68,47", // High arch
  "M10,62 C30,45 70,45 90,62 C70,75 30,75 10,62 M15,60 Q50,58 85,60", // Broad
  "M30,55 Q50,50 70,55 Q50,60 30,55 M30,55 Q50,45 70,55", // Small, centered
  "M20,60 Q35,40 50,45 Q65,40 80,60 Q50,85 20,60 M25,58 Q50,62 75,58", // Double arch
  "M10,50 Q50,80 90,50 Q50,20 10,50 M15,50 Q50,55 85,50", // Inverted heart
  "M25,58 Q50,42 75,58 Q50,68 25,58 M30,57 Q50,54 70,57", // Keyhole pout
  "M18,60 Q50,40 82,60 Q50,80 18,60 M20,58 L80,58", // Straight line middle
  "M20,50 C40,30 60,30 80,50 C60,45 40,45 20,50 M20,50 Q50,65 80,50", // Overlapping
  "M25,65 Q50,35 75,65 Q50,100 25,65 M30,60 Q50,60 70,60", // Droplet
  "M10,55 Q50,45 90,55 Q50,65 10,55 M15,53 L85,53", // Flat top
  "M20,60 Q50,40 80,60 Q50,80 20,60 M25,58 C40,55 60,55 75,58", // Bow-shaped
  "M30,50 Q50,60 70,50 Q50,40 30,50 M35,48 Q50,52 65,48", // Almond
  "M15,50 C30,35 70,35 85,50 C70,55 30,55 15,50 M20,48 Q50,50 80,48", // Butterfly
  "M22,65 Q50,50 78,65 Q50,85 22,65 M28,63 Q50,68 72,63", // Soft smile
  "M18,55 Q50,30 82,55 Q50,60 18,55 M25,53 Q50,50 75,53", // Angel wings
  "M20,60 Q50,50 80,60 Q50,70 20,60 M25,58 Q50,45 75,58", // Upward curve
  "M25,50 Q50,30 75,50 Q50,60 25,50 M30,48 Q50,40 70,48", // Sharp M
  "M15,60 C35,40 65,40 85,60 C65,75 35,75 15,60 M20,58 Q50,56 80,58", // Elegant curve
  "M28,60 Q50,50 72,60 Q50,70 28,60 M35,58 Q50,62 65,58", // Subtle pout
  "M10,58 Q50,40 90,58 Q50,78 10,58 M15,55 Q50,53 85,55", // Wide, sharp
  "M25,55 Q50,45 75,55 Q50,65 25,55 M30,53 Q50,60 70,53", // Rosebud
  "M20,50 Q50,35 80,50 Q50,40 20,50 M25,48 L75,48", // Flat separation
  "M18,65 Q50,45 82,65 Q50,90 18,65 M25,63 Q50,65 75,63", // Plump lower
  "M25,50 Q50,20 75,50 Q50,70 25,50 M30,45 Q50,48 70,45", // Plump upper
  "M12,60 Q50,35 88,60 Q50,85 12,60 M18,58 Q50,62 82,58", // Hollywood
  "M25,52 Q50,40 75,52 Q50,62 25,52 M30,50 Q50,55 70,50", // Petal
  "M20,60 Q50,55 80,60 Q50,65 20,60 M20,60 Q50,45 80,60", // Natural
  "M30,60 Q50,40 70,60 Q50,80 30,60 M35,58 Q50,55 65,58", // Doll-like
  "M15,55 C30,45 70,45 85,55 C70,65 30,65 15,55 M20,53 Q50,50 80,53", // Glamour
  "M22,58 Q50,48 78,58 Q50,68 22,58 M28,56 Q50,60 72,56", // Chic
  "M10,60 Q50,50 90,60 Q50,70 10,60 M15,58 L85,58", // Minimalist
  "M20,60 Q50,30 80,60 Q50,100 20,60 M28,55 Q50,58 72,55", // Exaggerated
];

export const LipArtIcon = ({ index, className }: { index: number; className?: string }) => {
    const pathData = LIP_ART_PATHS[index % LIP_ART_PATHS.length];
    const [upper, lower] = pathData.split(' M');
    return (
        <svg viewBox="0 0 100 100" className={className}>
            <path d={upper} />
            <path d={`M${lower}`} />
        </svg>
    );
};