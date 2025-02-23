const API_BASE_URL = 'http://localhost:8080/api/v1';

export interface Company {
  id: string;
  name: string;
  industry: string;
  breach?: {
    breach_type: string;
    effect_score: number;
    description: string;
    timestamp: string;
  } | null;
}

export interface CompanyResponse extends Company {
  company_id: string;
}

export type BreachTypeEnum =
  | 'VIOLATING_TERMS'
  | 'FRAUD'
  | 'DEFAULT'
  | 'SUSPICIOUS_ACTIVITY'
  | 'ILLEGAL_ACTIVITY'
  | 'DATA_LEAK';

export interface BreachType {
  company_id: string;
  breach_type: BreachTypeEnum;
  effect_score: number;
  description: string;
  timestamp: string;
}

export const api = {
  // Company endpoints
  createCompany: async (company: Company) => {
    const response = await fetch(`${API_BASE_URL}/companies/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(company),
    });
    if (!response.ok) {
      throw new Error('Failed to create company');
    }
    return response.json();
  },

  // Breach type endpoints
  createBreachType: async (breachType: BreachType) => {
    const response = await fetch(`${API_BASE_URL}/breaches/${breachType.company_id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(breachType),
    });
    if (!response.ok) {
      throw new Error('Failed to create breach type');
    }
    return response.json();
  },
};
