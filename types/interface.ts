export default interface FormData {
  category?: string;
  subcategory?: string;
  relationship?: string;
  relationshipLabel?: string;
  country?: string;
  details?: string;
  timeframe?: string;
  timeframeLabel?: string;
  involvedParties?: Array<{ id: number; name: string; type: string }>;
  description?: string;
  evidence?: Array<{ id: number; name: string; size: number; type: string }>;
  isAnonymous?: boolean;
  fullName?: string;
  rut?: string;
  email?: string;
  phone?: string;
}
