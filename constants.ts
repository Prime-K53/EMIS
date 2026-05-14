
export const MALAWI_REGIONS = ['Northern', 'Central', 'Southern'] as const;

export const MALAWI_DISTRICTS: Record<string, string[]> = {
  'Northern': ['Chitipa', 'Karonga', 'Likoma', 'Mzimba', 'Nkhata Bay', 'Rumphi'],
  'Central': ['Dedza', 'Dowa', 'Kasungu', 'Lilongwe', 'Mchinji', 'Nkhotakota', 'Ntcheu', 'Ntchisi', 'Salima'],
  'Southern': ['Balaka', 'Blantyre', 'Chikwawa', 'Chiradzulu', 'Machinga', 'Mangochi', 'Mulanje', 'Mwanza', 'Neno', 'Nsanje', 'Phalombe', 'Thyolo', 'Zomba']
};

export const SCHOOL_LEVELS = ['Primary', 'Secondary', 'Technical', 'Special Needs', 'Tertiary'] as const;
export const SCHOOL_STATUSES = ['active', 'inactive', 'closed', 'merged'] as const;
export const OWNERSHIP_TYPES = ['Government', 'Faith-Based', 'Private', 'Community', 'NGO'] as const;
export const ACCESSIBILITY_TYPES = ['Tarred Road', 'Earth Road', 'Footpath'] as const;
