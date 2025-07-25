declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
  }
}

declare module 'jspdf-autotable' {
  const content: any;
  export = content;
}

// Global autoTable fonksiyonu için
declare global {
  interface Window {
    autoTable: any;
  }
} 