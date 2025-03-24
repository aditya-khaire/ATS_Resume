export interface Education {
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface Experience {
  company: string;
  position: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  achievements?: string[];
}

export interface Certification {
  name: string;
  issuer?: string;
  date?: string;
  description?: string;
}

export interface Resume {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  website?: string;
  summary?: string;
  skills?: string[];
  experience?: Experience[];
  education?: Education[];
  certifications?: Certification[];
  projects?: {
    name: string;
    description?: string;
    technologies?: string[];
    link?: string;
  }[];
}

export interface AnalysisResult {
  score: number;
  strengths: string[];
  improvements: string[];
}