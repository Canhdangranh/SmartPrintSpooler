import React from 'react';
import { DocFile } from '../types';
import { FileText, Trash2, GripVertical } from 'lucide-react';

interface FileItemProps {
  file: DocFile;
  index: number;
  onRemove: (id: string) => void;
}

export const FileItem: React.FC<FileItemProps> = ({ file, index, onRemove }) => {
  return (
    <div className="group relative bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all mb-3">
      <div className="flex items-start gap-4">
        {/* Drag Handle (Visual only for this demo) */}
        <div className="mt-2 text-gray-400 cursor-move">
          <GripVertical size={20} />
        </div>

        {/* Icon */}
        <div className="p-3 bg-red-50 rounded-lg text-red-600">
          <FileText size={24} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h3 className="text-sm font-medium text-gray-900 truncate pr-4">
              {index + 1}. {file.name}
            </h3>
            <button 
              onClick={() => onRemove(file.id)}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
          
          <p className="text-xs text-gray-500 mt-1">
            {(file.file.size / 1024).toFixed(1)} KB • PDF Document
          </p>
        </div>
      </div>
      
      {/* Odd page indicator badge */}
      <div className="absolute top-[-8px] right-[-8px] hidden group-hover:flex">
         <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded-full border border-blue-200 shadow-sm">
           Auto Blank Page
         </span>
      </div>
    </div>
  );
};