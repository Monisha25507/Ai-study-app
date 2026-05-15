import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { uploadPDF, deletePDF } from '../firebase/storage';
import { addPDFMetadata, getPDFs, deletePDFMetadata } from '../firebase/firestore';
import { summarizePDF } from '../api/gemini';
import Header from '../components/Header';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { Upload, FileText, Trash2, ExternalLink, Sparkles } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.3.136/build/pdf.worker.min.mjs`;

const PDFs = () => {
  const { user } = useAuth();
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [summary, setSummary] = useState('');
  const [summarizing, setSummarizing] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const fileRef = useRef();

  useEffect(() => { loadPDFs(); }, []);

  const loadPDFs = async () => {
    try {
      const data = await getPDFs(user.uid);
      setPdfs(data);
    } finally {
      setLoading(false);
    }
  };

  const extractText = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = '';
    for (let i = 1; i <= Math.min(pdf.numPages, 20); i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item) => item.str).join(' ') + '\n';
    }
    return text;
  };

  const handleFile = async (file) => {
    if (!file || file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }
    setUploading(true);
    setProgress(0);
    setSummary('');
    try {
      const { downloadURL, fullPath } = await uploadPDF(user.uid, file, setProgress);
      const ref = await addPDFMetadata(user.uid, {
        name: file.name,
        size: file.size,
        storageURL: downloadURL,
        fullPath,
      });
      const newPDF = { id: ref.id, name: file.name, size: file.size, storageURL: downloadURL, fullPath };
      setPdfs((prev) => [newPDF, ...prev]);
      toast.success('PDF uploaded!');

      // Extract & summarize
      setSummarizing(true);
      const text = await extractText(file);
      const result = await summarizePDF(text);
      setSummary(result);
      toast.success('Summary generated!');
    } catch (err) {
      toast.error('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
      setSummarizing(false);
    }
  };

  const handleDelete = async () => {
    const pdf = deleteModal;
    try {
      await deletePDF(pdf.fullPath);
      await deletePDFMetadata(user.uid, pdf.id);
      setPdfs((prev) => prev.filter((p) => p.id !== pdf.id));
      toast.success('PDF deleted');
    } catch {
      toast.error('Delete failed');
    } finally {
      setDeleteModal(null);
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="page">
      <Header title="PDF Upload" />

      {/* Drop Zone */}
      <div
        className={`drop-zone ${dragging ? 'dragging' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
        onClick={() => fileRef.current?.click()}
      >
        <input ref={fileRef} type="file" accept=".pdf" hidden onChange={(e) => handleFile(e.target.files[0])} />
        <Upload size={40} className="drop-icon" />
        <p className="drop-title">Drag & drop your PDF here</p>
        <p className="drop-sub">or click to browse</p>
      </div>

      {/* Progress */}
      {uploading && (
        <div className="upload-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span>{Math.round(progress)}%</span>
        </div>
      )}

      {/* Summary */}
      {summarizing && (
        <div className="summary-card loading-summary">
          <Sparkles size={20} className="spin" />
          <span>Generating AI summary...</span>
        </div>
      )}
      {summary && (
        <div className="summary-card">
          <div className="summary-header">
            <Sparkles size={18} />
            <h3>AI Summary</h3>
          </div>
          <div className="summary-content">
            {summary.split('\n').map((line, i) => <p key={i}>{line}</p>)}
          </div>
        </div>
      )}

      {/* PDF List */}
      <section className="section">
        <h2 className="section-title">Uploaded PDFs</h2>
        {loading ? (
          Array(3).fill(0).map((_, i) => <div key={i} className="pdf-item skeleton"><div className="skeleton-line" /></div>)
        ) : pdfs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📄</div>
            <h3>No PDFs uploaded yet</h3>
            <p>Upload a PDF to get an AI-generated summary</p>
          </div>
        ) : (
          <div className="pdf-list">
            {pdfs.map((pdf) => (
              <div key={pdf.id} className="pdf-item">
                <FileText size={22} className="pdf-icon" />
                <div className="pdf-info">
                  <span className="pdf-name">{pdf.name}</span>
                  <span className="pdf-meta">{formatSize(pdf.size)} · {pdf.uploadedAt?.toDate?.()?.toLocaleDateString()}</span>
                </div>
                <div className="pdf-actions">
                  <a href={pdf.storageURL} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
                    <ExternalLink size={15} /> View
                  </a>
                  <button className="btn btn-danger btn-sm" onClick={() => setDeleteModal(pdf)}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Delete PDF"
        confirmText="Delete"
        onConfirm={handleDelete}
        danger
      >
        <p>Delete <strong>{deleteModal?.name}</strong>? This cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default PDFs;
