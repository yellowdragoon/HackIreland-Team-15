import { v4 as uuidv4 } from 'uuid';

const API_BASE_URL = 'http://localhost:8080/api/v1';

const headers = {
  'Content-Type': 'application/json',
};

export interface User {
  passport_string: string;
  name: string;
  ref_score: number;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
}

export interface NewCompany {
  name: string;
  industry: string;
}

export type BreachTypeEnum =
  | 'VIOLATING_TERMS'
  | 'FRAUD'
  | 'DEFAULT'
  | 'SUSPICIOUS_ACTIVITY'
  | 'ILLEGAL_ACTIVITY'
  | 'DATA_LEAK';

export interface CompanyBreachType {
  breach_type: BreachTypeEnum;
  effect_score: number;
  description: string;
  timestamp: string;
}

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'API request failed');
  }
  return response.json();
};

export const api = {
  get: async (endpoint: string) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers,
    });
    return handleResponse(response);
  },

  post: async (endpoint: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Company management
  createCompany: async (company: NewCompany): Promise<Company> => {
    const newCompany: Company = { ...company, id: uuidv4() };
    return api.post('/companies', newCompany);
  },

  getCompany: async (id: string): Promise<Company> => {
    return api.get(`/companies/${id}`);
  },

  listCompanies: async (): Promise<Company[]> => {
    return api.get('/companies');
  },

  // Breach management
  createBreach: async (company: Company, breach: CompanyBreachType): Promise<void> => {
    return api.post(`/breaches/${company.id}`, breach);
  },

  getCompanyBreach: async (companyId: string): Promise<CompanyBreachType[]> => {
    return api.get(`/breaches/${companyId}`);
  },

  getHighImpactBreaches: async (effectThreshold: number): Promise<CompanyBreachType[]> => {
    return api.get(`/breaches/high-impact/${effectThreshold}`);
  },

  // User risk assessment
  getUserRisk: async (passportString: string): Promise<number> => {
    return api.get(`/users/risk/${passportString}`);
  },

  getUserScore: async (passportString: string): Promise<number> => {
    return api.get(`/users/score/${passportString}`);
  }
};
