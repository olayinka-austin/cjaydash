import React, { useState } from 'react';
import { useWealth } from '../context/WealthContext';
import { InvestmentCategory } from '../types';
import { CATEGORY_DETAILS, formatDate } from '../utils/calculations';
import { Upload, FileText, Trash2, Download, Plus, Shield, Search } from 'lucide-react';

export const VaultScreen: React.FC = () => {
  const { documentRecords, addDocument, deleteDocument } = useWealth();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const newDoc = {
        title: file.name,
        category: (filterCategory !== 'all' ? filterCategory : 'general') as any,
        fileType: file.type || 'application/pdf',
        fileSize: `${(file.size / 1024).toFixed(1)} KB`,
        uploadDate: new Date().toISOString().split('T')[0],
        notes: 'Attached trade slip / statement document'
      };
      addDocument(newDoc);
    }
  };

  const filteredDocs = documentRecords.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (doc.notes && doc.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = filterCategory === 'all' || doc.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#ffffff] border border-[#e3e2e1] p-5 rounded">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#1b6b51]" />
            <h1 className="text-base font-bold text-[#1a1c1c]">Document &amp; Statement Vault</h1>
          </div>
          <p className="text-xs text-[#747878] mt-0.5">
            Secure offline repository for trade confirmations, CSCS notices, contract notes, and broker certificates
          </p>
        </div>

        <label className="bg-[#1a1c1c] hover:bg-[#2f3130] text-[#faf9f8] px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs">
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Document</span>
          <input type="file" multiple onChange={handleFileUpload} className="hidden" />
        </label>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#ffffff] border border-[#e3e2e1] p-3 rounded">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#747878] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search documents by title or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#faf9f8] border border-[#e3e2e1] rounded text-xs text-[#1a1c1c] focus:outline-none focus:border-[#1a1c1c]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-[#747878]">Category:</span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-[#faf9f8] border border-[#e3e2e1] rounded px-3 py-1.5 text-xs font-semibold text-[#1a1c1c]"
          >
            <option value="all">All Categories ({documentRecords.length})</option>
            {Object.entries(CATEGORY_DETAILS).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.length === 0 ? (
          <div className="col-span-full bg-[#ffffff] border border-dashed border-[#d4d4d3] rounded-md p-12 text-center">
            <FileText className="w-10 h-10 text-[#747878] mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold text-[#1a1c1c]">No documents found</p>
            <p className="text-xs text-[#747878] mt-1">Upload trade receipts or certificates to store them in your vault</p>
          </div>
        ) : (
          filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="bg-[#ffffff] border border-[#e3e2e1] hover:border-[#1a1c1c] p-4 rounded transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded bg-[#f4f3f2] flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-[#1a1c1c]" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-[#1a1c1c] truncate" title={doc.title}>
                        {doc.title}
                      </h4>
                      <p className="text-[10px] font-mono text-[#747878]">{doc.fileSize} &middot; {formatDate(doc.uploadDate)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteDocument(doc.id)}
                    className="text-[#747878] hover:text-[#ba1a1a] p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete Document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="mt-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#f4f3f2] text-[#444748] border border-[#e3e2e1]">
                    {CATEGORY_DETAILS[doc.category as keyof typeof CATEGORY_DETAILS]?.label || 'General Document'}
                  </span>
                  {doc.notes && (
                    <p className="text-[11px] text-[#747878] mt-2 line-clamp-2">
                      {doc.notes}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#f4f3f2] flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#1b6b51] font-semibold">VERIFIED RECORD</span>
                <button
                  onClick={() => alert(`Opening ${doc.title} in preview mode.`)}
                  className="text-xs font-semibold text-[#1a1c1c] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
