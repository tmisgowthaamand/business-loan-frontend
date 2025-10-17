import { XMarkIcon, ArrowLeftIcon, DocumentIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';

interface PDFViewerProps {
  isOpen: boolean;
  onClose: () => void;
  documentName: string;
  documentType: string;
  documentUrl?: string;
  documentId?: number;
  isVerified?: boolean;
  onVerify?: (documentId: number) => void;
}

function PDFViewer({ isOpen, onClose, documentName, documentType, documentUrl, documentId, isVerified, onVerify }: PDFViewerProps) {
  const [pdfError, setPdfError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  console.log('🔍 PDFViewer render:', { isOpen, documentName, documentType, documentUrl });

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Handle escape key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, isFullscreen, onClose]);

  // Reset states when modal opens
  useEffect(() => {
    if (isOpen) {
      setPdfError(false);
      setIsLoading(true);
      setIsFullscreen(false);
    }
  }, [isOpen]);
  
  if (!isOpen) {
    console.log('❌ PDFViewer not open, returning null');
    return null;
  }

  console.log('✅ PDFViewer is open, rendering modal');

  // Get the PDF URL for the uploaded document
  const getPdfUrl = () => {
    if (documentUrl) {
      // Use the backend document view URL
      console.log('🔗 Using backend document URL:', documentUrl);
      return documentUrl;
    }
    return null;
  };

  const pdfUrl = getPdfUrl();



  return (
    <div 
      className={`fixed inset-0 bg-black z-[9999] flex items-center justify-center ${
        isFullscreen ? 'bg-opacity-95' : 'bg-opacity-50 p-4'
      }`}
      onClick={onClose}
    >
      <div 
        className={`bg-white shadow-xl flex flex-col ${
          isFullscreen 
            ? 'w-full h-full' 
            : 'rounded-lg max-w-4xl w-full max-h-[90vh]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Back to Documents"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{documentName}</h2>
              <p className="text-sm text-gray-500">{documentType.replace('_', ' ')}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* Verify Button */}
            {documentId && onVerify && !isVerified && (
              <button
                onClick={() => onVerify(documentId)}
                className="flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                title="Verify Document"
              >
                <CheckCircleIcon className="h-4 w-4 mr-1" />
                ✓ Verify
              </button>
            )}
            {/* Verified Status */}
            {isVerified && (
              <div className="flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm rounded border border-green-200">
                <CheckCircleIcon className="h-4 w-4 mr-1" />
                ✓ Verified
              </div>
            )}
            <button
              onClick={toggleFullscreen}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? (
                <ArrowsPointingInIcon className="h-5 w-5" />
              ) : (
                <ArrowsPointingOutIcon className="h-5 w-5" />
              )}
            </button>
            <button
              onClick={() => {
                if (pdfUrl) {
                  const a = document.createElement('a');
                  a.href = pdfUrl;
                  a.download = `${documentName}.pdf`;
                  a.click();
                }
              }}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              title="Download PDF"
              disabled={!pdfUrl}
            >
              📥 Download
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>


        {/* PDF Content */}
        <div className="flex-1 p-4">
          {pdfUrl ? (
            <div className="h-full">
              {isLoading && (
                <div className="mb-2 p-3 bg-blue-50 border border-blue-200 rounded text-sm flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  <span>📄 <strong>Loading document:</strong> {documentName}</span>
                </div>
              )}
              
              {pdfError ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center p-8 max-w-md">
                    <DocumentIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">PDF Display Error</h3>
                    <p className="text-gray-600 mb-4">
                      Unable to display the PDF in the browser. This might be due to browser restrictions or PDF format issues.
                    </p>
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          setPdfError(false);
                          setIsLoading(true);
                        }}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        🔄 Try Again
                      </button>
                      <a 
                        href={pdfUrl} 
                        className="block w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-center"
                        download={`${documentName}.pdf`}
                      >
                        📥 Download PDF
                      </a>
                      <button
                        onClick={() => window.open(pdfUrl, '_blank')}
                        className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                      >
                        🔗 Open in New Tab
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full relative">
                  <iframe
                    src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1&page=1&view=FitH&zoom=page-fit`}
                    className={`w-full h-full border border-gray-300 ${
                      isFullscreen ? 'min-h-screen' : 'rounded-lg min-h-[600px]'
                    }`}
                    title={`${documentName} - PDF Viewer`}
                    onLoad={() => {
                      console.log('✅ PDF loaded successfully from:', pdfUrl);
                      setIsLoading(false);
                    }}
                    onError={(e) => {
                      console.error('❌ Failed to load PDF:', pdfUrl, e);
                      setPdfError(true);
                      setIsLoading(false);
                    }}
                    allow="fullscreen"
                  >
                    <div className="p-8 text-center">
                      <DocumentIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">Your browser doesn't support inline PDF viewing.</p>
                      <div className="space-y-2">
                        <a 
                          href={pdfUrl} 
                          className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2"
                          download={`${documentName}.pdf`}
                        >
                          📥 Download PDF
                        </a>
                        <button
                          onClick={() => window.open(pdfUrl, '_blank')}
                          className="inline-block px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                        >
                          🔗 Open in New Tab
                        </button>
                      </div>
                    </div>
                  </iframe>
                  
                  {/* PDF Controls Overlay */}
                  <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-2 flex space-x-2">
                    <button
                      onClick={() => window.open(pdfUrl, '_blank')}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm transition-colors"
                      title="Open in new tab"
                    >
                      🔗
                    </button>
                    <a
                      href={pdfUrl}
                      download={`${documentName}.pdf`}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm transition-colors"
                      title="Download PDF"
                    >
                      📥
                    </a>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center p-8">
                <DocumentIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No Document Available</h3>
                <p className="text-gray-600 mb-4">
                  No file URL provided for this document.
                </p>
                <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
                  <p><strong>Document:</strong> {documentName}</p>
                  <p><strong>Type:</strong> {documentType}</p>
                  <p><strong>File:</strong> {documentUrl || 'Not specified'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PDFViewer;
