
import React from 'react';
import type { BillDetails } from '../types';

interface BillResultProps {
  details: BillDetails;
}

const BillResult: React.FC<BillResultProps> = ({ details }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleDownloadPdf = () => {
    const billElement = document.getElementById('bill-to-print');
    const { jsPDF } = (window as any).jspdf;
    const html2canvas = (window as any).html2canvas;

    if (billElement && jsPDF && html2canvas) {
      html2canvas(billElement, { 
        backgroundColor: '#1f2937',
        scale: 2 
      }).then((canvas: HTMLCanvasElement) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const imgProps = pdf.getImageProperties(imgData);
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('utility-bill.pdf');
      });
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700">
      <div id="bill-to-print" className="p-4 bg-gray-800">
        <h3 className="text-2xl font-bold text-center text-white mb-6">Bill Summary</h3>
        <div className="space-y-4 text-lg">
          <div className="flex justify-between items-center text-gray-300">
            <span>Consumption:</span>
            <span className="font-mono">{details.units.toFixed(2)} units</span>
          </div>
          <hr className="border-gray-600"/>
          <div className="flex justify-between items-center text-gray-300">
            <span>Subtotal:</span>
            <span className="font-mono">{formatCurrency(details.subtotal)}</span>
          </div>
          <div className="flex justify-between items-center text-gray-300">
            <span>VAT:</span>
            <span className="font-mono">{formatCurrency(details.vatAmount)}</span>
          </div>
          <div className="flex justify-between items-center text-gray-300">
            <span>Service Charge:</span>
            <span className="font-mono">{formatCurrency(details.serviceCharge)}</span>
          </div>
          <hr className="border-t-2 border-indigo-500 my-4"/>
          <div className="flex justify-between items-center text-white text-2xl font-bold">
            <span>Total Payable:</span>
            <span className="font-mono text-indigo-400">{formatCurrency(details.total)}</span>
          </div>
        </div>
      </div>
      <div className="mt-8 text-center">
        <button
          onClick={handleDownloadPdf}
          className="bg-green-600 text-white font-bold py-2 px-6 rounded-md hover:bg-green-700 transition duration-300 flex items-center justify-center mx-auto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Download as PDF
        </button>
      </div>
    </div>
  );
};

export default BillResult;
