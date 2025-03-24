import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { pdfjs } from 'react-pdf';
import { Resume } from '../types';

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface ResumeUploaderProps {
  onResumeUploaded: (text: string, resume: Resume) => void;
}

const ResumeUploader: React.FC<ResumeUploaderProps> = ({ onResumeUploaded }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractTextFromPdf = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + ' ';
      }

      return fullText;
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw new Error('Failed to extract text from PDF');
    }
  };

  const parseResumeText = (text: string): Resume => {
    // This is a simplified parser - in a real app, this would be more sophisticated
    // or would use an API for more accurate parsing
    
    const lines = text.split(/\n|\r\n/);
    const cleanedLines = lines.filter(line => line.trim() !== '');
    
    // Basic extraction - this is very simplified
    const name = cleanedLines[0] || 'Unknown Name';
    
    // Try to find email
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const email = emailMatch ? emailMatch[0] : '';
    
    // Try to find phone
    const phoneMatch = text.match(/(\+\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/);
    const phone = phoneMatch ? phoneMatch[0] : '';
    
    // Extract skills (very basic approach)
    const skillsSection = text.match(/skills:?(.*?)(?:\n\n|\n[A-Z]|$)/is);
    const skills = skillsSection 
      ? skillsSection[1].split(/[,;]/).map(skill => skill.trim()).filter(Boolean)
      : [];
    
    // Extract summary (very basic approach)
    const summaryMatch = text.match(/summary:?(.*?)(?:\n\n|\n[A-Z]|$)/is);
    const summary = summaryMatch ? summaryMatch[1].trim() : '';
    
    // Create a basic resume object
    return {
      name,
      email,
      phone,
      summary,
      skills,
      experience: [],
      education: []
    };
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError(null);
    
    if (acceptedFiles.length === 0) {
      return;
    }
    
    const file = acceptedFiles[0];
    
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      setError('Please upload a PDF file');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const text = await extractTextFromPdf(file);
      const resumeData = parseResumeText(text);
      onResumeUploaded(text, resumeData);
    } catch (error) {
      console.error('Error processing file:', error);
      setError('Failed to process the resume. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [onResumeUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  });

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Upload Your Resume</h2>
      
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center justify-center space-y-4">
          <Upload size={48} className={isDragActive ? 'text-indigo-500' : 'text-gray-400'} />
          
          {isLoading ? (
            <div className="text-gray-600">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-700 mx-auto mb-4"></div>
              <p>Processing your resume...</p>
            </div>
          ) : (
            <>
              <p className="text-lg font-medium text-gray-700">
                {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume here'}
              </p>
              <p className="text-gray-500">or click to browse files</p>
              <p className="text-sm text-gray-400 mt-2">Supported format: PDF</p>
            </>
          )}
        </div>
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md flex items-start">
          <AlertCircle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      
      <div className="mt-8 bg-blue-50 p-4 rounded-lg">
        <div className="flex items-start">
          <FileText size={24} className="text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-800">Why upload your resume?</h3>
            <p className="text-blue-700 mt-1">
              Our ATS analyzer will scan your resume and provide feedback on how well it's optimized for Applicant Tracking Systems.
              You'll get a score and personalized recommendations to improve your chances of getting past the ATS filters.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeUploader;