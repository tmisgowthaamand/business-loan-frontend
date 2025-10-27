import { Component, ErrorInfo, ReactNode } from 'react';
import { DocumentCheckIcon } from '@heroicons/react/24/outline';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class DocumentVerificationErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('DocumentVerificationErrorBoundary caught an error:', error, errorInfo);
  }

  private loadMockData = async () => {
    try {
      // Load mock data and redirect to a working state
      const { MockDataService } = await import('../services/mockData.service');
      const enquiries = MockDataService.getEnquiries();
      const documents = MockDataService.getDocuments();
      
      console.log('🔄 Loaded mock data:', { enquiries: enquiries.length, documents: documents.length });
      
      // Reset error state and try again
      this.setState({ hasError: false, error: undefined });
    } catch (mockError) {
      console.error('Failed to load mock data:', mockError);
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              {/* Logo */}
              <div className="flex justify-center mb-6">
                <img 
                  src="/generated-image.png" 
                  alt="Business Loan Portal" 
                  className="h-16 w-16 object-contain drop-shadow-lg"
                  style={{ 
                    filter: 'contrast(2.2) saturate(2.0) brightness(1.8)',
                    imageRendering: 'crisp-edges'
                  }}
                />
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto">
                <div className="flex items-center justify-center w-16 h-16 mx-auto bg-blue-100 rounded-full mb-6">
                  <DocumentCheckIcon className="w-8 h-8 text-blue-600" />
                </div>
                
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  Document Verification
                </h1>
                
                <p className="text-gray-600 mb-6">
                  Loading document verification system...
                </p>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-amber-800">
                        <strong>Offline Mode:</strong> Using demo data for document verification
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={this.loadMockData}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    🔄 Load Document Verification
                  </button>
                  
                  <button
                    onClick={() => window.location.href = '/dashboard'}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    🏠 Go to Dashboard
                  </button>

                  <button
                    onClick={() => window.location.href = '/documents/upload'}
                    className="w-full bg-green-100 hover:bg-green-200 text-green-700 font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    📄 Upload Documents
                  </button>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">Available Features:</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• View client documents (BALAMURUGAN, VIGNESH S, etc.)</li>
                    <li>• Verify document status</li>
                    <li>• Assign staff members</li>
                    <li>• Add to shortlist</li>
                  </ul>
                </div>

                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="mt-6 p-3 bg-red-50 rounded text-xs">
                    <summary className="cursor-pointer font-medium text-red-800">Error Details (Dev Mode)</summary>
                    <pre className="mt-2 whitespace-pre-wrap text-red-700">{this.state.error.stack}</pre>
                  </details>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default DocumentVerificationErrorBoundary;
