import React, { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { Plus, Trash2, Save, Download } from 'lucide-react';
import { Resume } from '../types';

interface ResumeBuilderProps {
  onResumeBuilt: (resume: Resume) => void;
  initialResume: Resume | null;
  isSaving: boolean;
  saveError: string | null;
}

const ResumeBuilder: React.FC<ResumeBuilderProps> = ({ 
  onResumeBuilt, 
  initialResume, 
  isSaving,
  saveError 
}) => {
  const defaultValues: Resume = initialResume || {
    name: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    website: '',
    summary: '',
    skills: [''],
    experience: [
      {
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        description: ''
      }
    ],
    education: [
      {
        institution: '',
        degree: '',
        fieldOfStudy: '',
        startDate: '',
        endDate: ''
      }
    ],
    certifications: []
  };
  
  const { register, control, handleSubmit, formState: { errors }, watch } = useForm<Resume>({
    defaultValues
  });
  
  const { 
    fields: skillFields, 
    append: appendSkill, 
    remove: removeSkill 
  } = useFieldArray({
    control,
    name: 'skills'
  });
  
  const { 
    fields: experienceFields, 
    append: appendExperience, 
    remove: removeExperience 
  } = useFieldArray({
    control,
    name: 'experience'
  });
  
  const { 
    fields: educationFields, 
    append: appendEducation, 
    remove: removeEducation 
  } = useFieldArray({
    control,
    name: 'education'
  });
  
  const { 
    fields: certificationFields, 
    append: appendCertification, 
    remove: removeCertification 
  } = useFieldArray({
    control,
    name: 'certifications'
  });
  
  const formValues = watch();
  
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
  
  const onSubmit = (data: Resume) => {
    // Filter out empty skills
    data.skills = data.skills?.filter(skill => skill.trim() !== '') || [];
    
    // Preserve the ID if it exists
    if (initialResume?.id) {
      data.id = initialResume.id;
    }
    
    // Submit the resume data
    onResumeBuilt(data);
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Build Your ATS-Optimized Resume</h2>
      
      {saveError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          {saveError}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Personal Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                {...register('name', { required: 'Name is required' })}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone *
              </label>
              <input
                type="tel"
                {...register('phone', { required: 'Phone is required' })}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                {...register('location')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="City, State"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                LinkedIn
              </label>
              <input
                type="text"
                {...register('linkedin')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="linkedin.com/in/yourprofile"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <input
                type="text"
                {...register('website')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="yourwebsite.com"
              />
            </div>
          </div>
        </div>
        
        {/* Professional Summary */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Professional Summary</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Summary *
            </label>
            <textarea
              {...register('summary', { 
                required: 'Professional summary is required',
                minLength: {
                  value: 50,
                  message: 'Summary should be at least 50 characters'
                }
              })}
              rows={4}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.summary ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="A brief overview of your professional background, key strengths, and career goals"
            ></textarea>
            {errors.summary && (
              <p className="mt-1 text-sm text-red-600">{errors.summary.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Pro tip: Include keywords relevant to the jobs you're applying for to improve ATS matching.
            </p>
          </div>
        </div>
        
        {/* Skills */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Skills</h3>
            <button
              type="button"
              onClick={() => appendSkill('')}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
            >
              <Plus size={16} className="mr-1" />
              Add Skill
            </button>
          </div>
          
          <div className="space-y-3">
            {skillFields.map((field, index) => (
              <div key={field.id} className="flex items-center space-x-2">
                <input
                  {...register(`skills.${index}` as const)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g., JavaScript, Project Management, Data Analysis"
                />
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => removeSkill(index)}
                    className="p-2 text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-gray-500">
            Pro tip: Include a mix of technical skills, soft skills, and industry-specific keywords.
          </p>
        </div>
        
        {/* Work Experience */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Work Experience</h3>
            <button
              type="button"
              onClick={() => appendExperience({
                company: '',
                position: '',
                startDate: '',
                endDate: '',
                description: ''
              })}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
            >
              <Plus size={16} className="mr-1" />
              Add Experience
            </button>
          </div>
          
          <div className="space-y-6">
            {experienceFields.map((field, index) => (
              <div key={field.id} className="p-4 border border-gray-200 rounded-md bg-gray-50">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-700">Experience #{index + 1}</h4>
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeExperience(index)}
                      className="p-1 text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company *
                    </label>
                    <input
                      {...register(`experience.${index}.company` as const, { 
                        required: 'Company is required' 
                      })}
                      className={`w-full px-3 py-2 border rounded-md ${
                        errors.experience?.[index]?.company ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Position *
                    </label>
                    <input
                      {...register(`experience.${index}.position` as const, { 
                        required: 'Position is required' 
                      })}
                      className={`w-full px-3 py-2 border rounded-md ${
                        errors.experience?.[index]?.position ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="month"
                      {...register(`experience.${index}.startDate` as const)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="month"
                      {...register(`experience.${index}.endDate` as const)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    {...register(`experience.${index}.description` as const, { 
                      required: 'Description is required' 
                    })}
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.experience?.[index]?.description ? 'border-red-500' : 'border-gray -300'
                    }`}
                    placeholder="Describe your responsibilities and achievements. Use quantifiable metrics where possible."
                  ></textarea>
                  <p className="mt-1 text-xs text-gray-500">
                    Pro tip: Use action verbs and include measurable achievements (e.g., "Increased sales by 20%").
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Education */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Education</h3>
            <button
              type="button"
              onClick={() => appendEducation({
                institution: '',
                degree: '',
                fieldOfStudy: '',
                startDate: '',
                endDate: ''
              })}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
            >
              <Plus size={16} className="mr-1" />
              Add Education
            </button>
          </div>
          
          <div className="space-y-6">
            {educationFields.map((field, index) => (
              <div key={field.id} className="p-4 border border-gray-200 rounded-md bg-gray-50">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-700">Education #{index + 1}</h4>
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeEducation(index)}
                      className="p-1 text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Institution *
                    </label>
                    <input
                      {...register(`education.${index}.institution` as const, { 
                        required: 'Institution is required' 
                      })}
                      className={`w-full px-3 py-2 border rounded-md ${
                        errors.education?.[index]?.institution ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Degree *
                    </label>
                    <input
                      {...register(`education.${index}.degree` as const, { 
                        required: 'Degree is required' 
                      })}
                      className={`w-full px-3 py-2 border rounded-md ${
                        errors.education?.[index]?.degree ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g., Bachelor of Science, Master's"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Field of Study
                    </label>
                    <input
                      {...register(`education.${index}.fieldOfStudy` as const)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="e.g., Computer Science, Business"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <input
                        type="month"
                        {...register(`education.${index}.startDate` as const)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date
                      </label>
                      <input
                        type="month"
                        {...register(`education.${index}.endDate` as const)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Certifications */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Certifications</h3>
            <button
              type="button"
              onClick={() => appendCertification({
                name: '',
                issuer: '',
                date: '',
                description: ''
              })}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
            >
              <Plus size={16} className="mr-1" />
              Add Certification
            </button>
          </div>
          
          {certificationFields.length === 0 ? (
            <p className="text-gray-500 italic">No certifications added yet.</p>
          ) : (
            <div className="space-y-4">
              {certificationFields.map((field, index) => (
                <div key={field.id} className="p-4 border border-gray-200 rounded-md bg-gray-50">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-700">Certification #{index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeCertification(index)}
                      className="p-1 text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Certification Name *
                      </label>
                      <input
                        {...register(`certifications.${index}.name` as const, { 
                          required: 'Certification name is required' 
                        })}
                        className={`w-full px-3 py-2 border rounded-md ${
                          errors.certifications?.[index]?.name ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Issuing Organization
                      </label>
                      <input
                        {...register(`certifications.${index}.issuer` as const)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date
                      </label>
                      <input
                        type="month"
                        {...register(`certifications.${index}.date` as const)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <input
                        {...register(`certifications.${index}.description` as const)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Brief description of the certification"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Saving Resume...
              </>
            ) : (
              <>
                <Save size={20} className="mr-2" />
                Save & Analyze Resume
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResumeBuilder;