import React from 'react';
import { BarChart3, FileSearch, TrendingUp } from 'lucide-react';

interface SuperscriptAnalyzerProps {
  currentPage: number;
  superscriptCount: number;
  totalPages: number;
}

const SuperscriptAnalyzer: React.FC<SuperscriptAnalyzerProps> = ({
  currentPage,
  superscriptCount,
  totalPages
}) => {
  const getAnalysisColor = (count: number) => {
    if (count === 0) return 'text-gray-400';
    if (count <= 2) return 'text-green-400';
    if (count <= 5) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getAnalysisIcon = (count: number) => {
    if (count === 0) return <FileSearch className="w-4 h-4" />;
    if (count <= 5) return <BarChart3 className="w-4 h-4" />;
    return <TrendingUp className="w-4 h-4" />;
  };

  const getAnalysisMessage = (count: number) => {
    if (count === 0) return 'No superscripts detected';
    if (count === 1) return '1 superscript found';
    if (count <= 5) return `${count} superscripts found`;
    return `High density: ${count} superscripts`;
  };

  return (
    <div className="bg-gray-800 border-t border-gray-700 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`flex items-center space-x-2 ${getAnalysisColor(superscriptCount)}`}>
            {getAnalysisIcon(superscriptCount)}
            <span className="font-medium">Page {currentPage} Analysis:</span>
          </div>
          <span className={`${getAnalysisColor(superscriptCount)} font-semibold`}>
            {getAnalysisMessage(superscriptCount)}
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-gray-400 text-sm">
            Progress: {currentPage} / {totalPages}
          </div>
          
          {superscriptCount > 0 && (
            <div className="bg-yellow-500/20 px-3 py-1 rounded-full">
              {/* <span className="text-yellow-300 text-sm">
                Validation Required
              </span> */}
            </div>
          )}
        </div>
      </div>
      
      {superscriptCount > 5 && (
        <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-center space-x-2 text-red-400">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">
              High superscript density detected - manual review recommended
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperscriptAnalyzer;