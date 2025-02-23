const API_BASE_URL = 'http://localhost:8080/api/v1';

// For demo purposes - replace with actual auth
const DEMO_CREDENTIALS = {
  email: 'demo@example.com',
  password: 'demo123'
};

let authToken: string | null = null;

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
  // Auth
  login: async (email: string, password: string): Promise<void> => {
    // For demo purposes
    if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
      authToken = 'demo_token';
      return;
    }
    throw new Error('Invalid email or password');
  },

  logout: () => {
    authToken = null;
  },
  // Company management
  createCompany: async (company: Company): Promise<Company> => {
    const response = await fetch(`${API_BASE_URL}/companies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(company),
    });
    return handleResponse(response);
  },

  getCompany: async (id: string): Promise<Company> => {
    const response = await fetch(`${API_BASE_URL}/companies/${id}`);
    return handleResponse(response);
  },

  listCompanies: async (): Promise<Company[]> => {
    const response = await fetch(`${API_BASE_URL}/companies`);
    return handleResponse(response);
  },

  // Breach management
  createBreach: async (companyId: string, breach: CompanyBreachType) => {
    const response = await fetch(`${API_BASE_URL}/breaches/${companyId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(breach),
    });
    return handleResponse(response);
  },

  getCompanyBreach: async (companyId: string) => {
    const response = await fetch(`${API_BASE_URL}/breaches/${companyId}`);
    return handleResponse(response);
  },

  getHighImpactBreaches: async (effectThreshold: number) => {
    const response = await fetch(`${API_BASE_URL}/breaches/high-impact/${effectThreshold}`);
    return handleResponse(response);
  },

  // User risk assessment
  getUserRisk: async (passportString: string) => {
    const response = await fetch(`${API_BASE_URL}/users/risk/${passportString}`);
    return handleResponse(response);
  },

  getUserScore: async (passportString: string) => {
    const response = await fetch(`${API_BASE_URL}/users/score/${passportString}`);
    return handleResponse(response);
  },
};
