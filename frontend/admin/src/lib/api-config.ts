export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
export const API_ENDPOINTS = {
    users: `${API_BASE_URL}/api/v1/users`,
    companies: `${API_BASE_URL}/api/v1/companies`,
    breachEvents: {
        unresolved: `${API_BASE_URL}/api/v1/breach-events/unresolved`,
        resolve: (id: string) => `${API_BASE_URL}/api/v1/breach-events/${id}/resolve`,
    },
    userInfo: {
        devices: {
            suspicious: `${API_BASE_URL}/api/v1/user-info/devices/suspicious`,
            all: (userId: string) => `${API_BASE_URL}/api/v1/user-info/devices/${userId}`,
        },
        riskScore: (userId: string) => `${API_BASE_URL}/api/v1/user-info/risk-score/${userId}`,
    },
};
