import React, { useRef } from 'react';
import { BarChart, CheckCircle, AlertCircle, RefreshCw, Download, FileText } from 'lucide-react';
import { Resume, AnalysisResult } from '../types';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface ResumeAnalyzerProps {
  resume: Resume | null;
  resumeText: string;
  analysisResult: AnalysisResult | null;
  isAnalyzing: boolean;
  onAnalyze: () => void;
}

const ResumeAnalyzer: React.FC<ResumeAnalyzerProps> = ({
  resume,
  resumeText,
  analysisResult,
  isAnalyzing,
  onAnalyze
}) => {
  const resumeTemplateRef = useRef<HTMLDivElement>(null);

  if (!resume) {
    return (
      <div className="text-center py-12">
        <FileText size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-medium text-gray-700 mb-2">No Resume Available</h3>
        <p className="text-gray-500 mb-6">
          Please upload or build a resume first to analyze it.
        </p>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getScoreText = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  const generateResumeHTML = (data: Resume) => {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${data.name} - Resume</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          h1 {
            font-size: 24px;
            margin-bottom: 5px;
            color: #2d3748;
          }
          h2 {
            font-size: 18px;
            margin-top: 20px;
            margin-bottom: 10px;
            color: #4a5568;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 5px;
          }
          .contact-info {
            margin-bottom: 20px;
            font-size: 14px;
          }
          .summary {
            margin-bottom: 20px;
          }
          .skills {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-bottom: 20px;
          }
          .skill {
            background-color: #f0f4f8;
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 14px;
          }
          .experience-item, .education-item, .certification-item {
            margin-bottom: 15px;
          }
          .job-title, .degree, .cert-name {
            font-weight: bold;
            margin-bottom: 5px;
          }
          .company, .institution, .issuer {
            font-style: italic;
          }
          .dates {
            color: #718096;
            font-size: 14px;
            margin-bottom: 5px;
          }
          .description {
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <h1>${data.name}</h1>
        <div class="contact-info">
          ${data.email ? `Email: ${data.email}<br>` : ''}
          ${data.phone ? `Phone: ${data.phone}<br>` : ''}
          ${data.location ? `Location: ${data.location}<br>` : ''}
          ${data.linkedin ? `LinkedIn: ${data.linkedin}<br>` : ''}
          ${data.website ? `Website: ${data.website}` : ''}
        </div>
        
        ${data.summary ? `
        <h2>Professional Summary</h2>
        <div class="summary">
          ${data.summary}
        </div>
        ` : ''}
        
        ${data.skills && data.skills.length > 0 ? `
        <h2>Skills</h2>
        <div class="skills">
          ${data.skills.filter(skill => skill.trim() !== '').map(skill => `
            <span class="skill">${skill}</span>
          `).join('')}
        </div>
        ` : ''}
        
        ${data.experience && data.experience.length > 0 ? `
        <h2>Experience</h2>
        ${data.experience.map(exp => `
          <div class="experience-item">
            <div class="job-title">${exp.position}</div>
            <div class="company">${exp.company}</div>
            ${(exp.startDate || exp.endDate) ? `
              <div class="dates">${exp.startDate || 'N/A'} - ${exp.endDate || 'Present'}</div>
            ` : ''}
            ${exp.description ? `<div class="description">${exp.description}</div>` : ''}
          </div>
        `).join('')}
        ` : ''}
        
        ${data.education && data.education.length > 0 ? `
        <h2>Education</h2>
        ${data.education.map(edu => `
          <div class="education-item">
            <div class="degree">${edu.degree}${edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}</div>
            <div class="institution">${edu.institution}</div>
            ${(edu.startDate || edu.endDate) ? `
              <div class="dates">${edu.startDate || 'N/A'} - ${edu.endDate || 'Present'}</div>
            ` : ''}
          </div>
        `).join('')}
        ` : ''}
        
        ${data.certifications && data.certifications.length > 0 ? `
        <h2>Certifications</h2>
        ${data.certifications.map(cert => `
          <div class="certification-item">
            <div class="cert-name">${cert.name}</div>
            ${cert.issuer ? `<div class="issuer">${cert.issuer}</div>` : ''}
            ${cert.date ? `<div class="dates">${cert.date}</div>` : ''}
            ${cert.description ? `<div class="description">${cert.description}</div>` : ''}
          </div>
        `).join('')}
        ` : ''}
      </body>
      </html>
    `;
  };
  
  const downloadResume = async () => {
    if (!resume) return;
    
    try {
      // Create a temporary div to render the resume
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = generateResumeHTML(resume);
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      document.body.appendChild(tempDiv);
      
      // Create a new PDF document
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Convert the HTML to canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false
      });
      
      // Add the canvas as an image to the PDF
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      
      // Save the PDF
      pdf.save(`${resume.name.replace(/\s+/g, '_')}_Resume.pdf`);
      
      // Clean up
      document.body.removeChild(tempDiv);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">ATS Resume Analysis</h2>
        
        <div className="flex space-x-3">
          <button
            onClick={downloadResume}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Download size={16} className="mr-2" />
            Download Resume (PDF)
          </button>
          
          <button
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Analyzing...
              </>
            ) : (
              <>
                <RefreshCw size={16} className="mr-2" />
                {analysisResult ? 'Re-analyze Resume' : 'Analyze Resume'}
              </>
            )}
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Resume Overview</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Personal Information</h4>
            <ul className="space-y-2 text-gray-600">
              <li><span className="font-medium">Name:</span> {resume.name}</li>
              <li><span className="font-medium">Email:</span> {resume.email}</li>
              <li><span className="font-medium">Phone:</span> {resume.phone}</li>
              {resume.location && <li><span className="font-medium">Location:</span> {resume.location}</li>}
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Professional Summary</h4>
            <p className="text-gray-600 text-sm">
              {resume.summary || 'No summary provided'}
            </p>
          </div>
        </div>
        
        <div className="mt-6">
          <h4 className="font-medium text-gray-700 mb-2">Skills</h4>
          <div className="flex flex-wrap gap-2">
            {resume.skills && resume.skills.length > 0 ? (
              resume.skills.map((skill, index) => (
                skill.trim() && (
                  <span 
                    key={index} 
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                )
              ))
            ) : (
              <p className="text-gray-500 italic">No skills listed</p>
            )}
          </div>
        </div>
        
        <div className="mt-6">
          <h4 className="font-medium text-gray-700 mb-2">Experience</h4>
          {resume.experience && resume.experience.length > 0 ? (
            <div className="space-y-4">
              {resume.experience.map((exp, index) => (
                <div key={index} className="border-l-2 border-gray-200 pl-4">
                  <p className="font-medium">{exp.position} at {exp.company}</p>
                  {(exp.startDate || exp.endDate) && (
                    <p className="text-sm text-gray-500">
                      {exp.startDate || 'N/A'} - {exp.endDate || 'Present'}
                    </p>
                  )}
                  {exp.description && (
                    <p className="text-sm text-gray-600 mt-1">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No experience listed</p>
          )}
        </div>
        
        <div className="mt-6">
          <h4 className="font-medium text-gray-700 mb-2">Education</h4>
          {resume.education && resume.education.length > 0 ? (
            <div className="space-y-4">
              {resume.education.map((edu, index) => (
                <div key={index} className="border-l-2 border-gray-200 pl-4">
                  <p className="font-medium">{edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}</p>
                  <p className="text-sm">{edu.institution}</p>
                  {(edu.startDate || edu.endDate) && (
                    <p className="text-sm text-gray-500">
                      {edu.startDate || 'N/A'} - {edu.endDate || 'Present'}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No education listed</p>
          )}
        </div>
      </div>

      {isAnalyzing ? (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700 mx-auto mb-4"></div>
          <h3 className="text-xl font-medium text-gray-700 mb-2">Analyzing Your Resume</h3>
          <p className="text-gray-500">
            We're evaluating your resume against ATS criteria and industry standards...
          </p>
        </div>
      ) : analysisResult ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">ATS Compatibility Score</h3>
              <div className={`text-2xl font-bold ${getScoreColor(analysisResult.score)}`}>
                {analysisResult.score}%
              </div>
            </div>
            
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className={`h-4 rounded-full ${
                    analysisResult.score >= 80 ? 'bg-green-500' : 
                    analysisResult.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${analysisResult.score}%` }}
                ></div>
              </div>
              <p className={`mt-2 text-sm font-medium ${getScoreColor(analysisResult.score)}`}>
                {getScoreText(analysisResult.score)}
              </p>
            </div>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="flex items-center text-lg font-semibold text-green-700 mb-3">
                <CheckCircle size={20} className="mr-2" />
                Strengths
              </h4>
              
              {analysisResult.strengths.length > 0 ? (
                <ul className="space-y-2">
                  {analysisResult.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">No specific strengths identified</p>
              )}
            </div>
            
            <div>
              <h4 className="flex items-center text-lg font-semibold text-amber-700 mb-3">
                <AlertCircle size={20} className="mr-2" />
                Areas for Improvement
              </h4>
              
              {analysisResult.improvements.length > 0 ? ( <ul className="space-y-2">
                  {analysisResult.improvements.map((improvement, index) => (
                    <li key={index} className="flex items-start">
                      <AlertCircle size={16} className="text-amber-500 mr-2 mt-1 flex-shrink-0" />
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">No specific improvements needed</p>
              )}
            </div>
          </div>
          
          <div className={`p-6 ${getScoreBackground(analysisResult.score)} border-t border-gray-200`}>
            <h4 className="font-semibold text-gray-800 mb-2">Summary</h4>
            <p className="text-gray-700">
              {analysisResult.score >= 80 ? (
                "Your resume is well-optimized for ATS systems. It contains relevant keywords, proper formatting, and quantifiable achievements. You're likely to pass most ATS screenings."
              ) : analysisResult.score >= 60 ? (
                "Your resume is reasonably well-optimized but could use some improvements. Address the suggestions above to increase your chances of passing ATS screenings."
              ) : (
                "Your resume needs significant improvements to pass ATS screenings. Focus on addressing the suggestions above, particularly adding more relevant keywords and quantifiable achievements."
              )}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
          <BarChart size={48} className="mx-auto text-indigo-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">Ready to Analyze</h3>
          <p className="text-gray-500 mb-6">
            Click the "Analyze Resume" button to evaluate your resume against ATS criteria.
          </p>
          <button
            onClick={onAnalyze}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <BarChart size={16} className="mr-2" />
            Analyze Resume
          </button>
        </div>
      )}
      
      {/* Hidden div for PDF generation */}
      <div ref={resumeTemplateRef} style={{ display: 'none' }}></div>
    </div>
  );
};

export default ResumeAnalyzer;