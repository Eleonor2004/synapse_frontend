// --- Authentication Types ---
export interface TokenResponse {
  access_token: string;
  token_type: string;
}

// --- User Types ---
export interface User {
  username: string;
  full_name: string | null;
  role: 'analyst' | 'admin';
  is_active: boolean;
}

// --- Graph Types ---
export interface GraphNode {
  id: string;
  label: string;
  properties: { [key: string]: any }; // A dictionary of any properties
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  properties: { [key: string]: any };
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// --- ListingSet Types ---
export interface ListingSet {
  id: string;
  name: string;
  description: string | null;
  owner_username: string;
  createdAt: string; // We receive this as an ISO string from the API
}