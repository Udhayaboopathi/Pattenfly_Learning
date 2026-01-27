// Type definitions for all data models

export interface UOM {
  id: number;
  name: string;
  description?: string;
  type?: string;
  base_uom?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Commodity {
  id: number;
  name: string;
  description?: string;
  uom_id?: number;
  density?: number;
  energy_uom?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  uom?: {
    id: number;
    name: string;
  };
}

export interface Location {
  id: number;
  name: string;
  location_type?: string;
  address?: string;
  counterparty_id?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CounterParty {
  id: number;
  name: string;
  type?: string;
  contact_info?: string;
  credit_status?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Blend {
  id: number;
  name: string;
  commodity_id?: number;
  description?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BlendComponent {
  id: number;
  blend_id: number;
  component_commodity_id: number;
  percentage: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  commodity?: Commodity;
  blend?: Blend;
}

export interface Capacity {
  id: number;
  commodity_id?: number;
  location_id?: number;
  capacity_type?: string;
  quantity?: number;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  commodity?: Commodity;
  location?: Location;
}

// API response types
export interface ImportResult {
  successful?: Array<{
    row: number;
    data: Record<string, any>;
  }>;
  failed?: Array<{
    row: number;
    data: Record<string, any>;
    error: string;
  }>;
  summary?: {
    total: number;
    successful: number;
    failed: number;
  };
  message?: string;
  errors?: Array<{
    row?: number;
    field: string;
    message: string;
    value?: string;
  }>;
}

export interface ApiError {
  detail?:
    | {
        message?: string;
        failed?: Array<{
          row: number;
          data: Record<string, any>;
          error: string;
        }>;
      }
    | string;
}

// Props interfaces for components
export interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
  onImport: (formData: FormData) => Promise<any>;
  title: string;
  templateColumns?: string[];
}

export interface EnhancedImportDialogProps {
  open: boolean;
  onClose: () => void;
  onImport: (formData: FormData) => Promise<any>;
  onSuccess?: () => void;
  entityKey: string;
  entityName: string;
  templateColumns?: string[];
}

export interface ExportButtonProps {
  onExport: () => Promise<any>;
  filename: string;
  disabled?: boolean;
}

// Form data types
export interface CommodityFormData {
  id?: number;
  name: string;
  description: string;
  uom_id: number | string;
  density: string | number;
  energy_uom: string;
  is_active: boolean;
}

export interface UOMFormData {
  id?: number;
  name: string;
  description: string;
  type: string;
  base_uom: string | number;
  is_active: boolean;
}

export interface BlendFormData {
  id?: number;
  name: string;
  commodity_id: string;
  description: string;
  is_active: boolean;
}

export interface LocationFormData {
  id?: number;
  name: string;
  location_type: string;
  address: string;
  counterparty_id: string;
  is_active: boolean;
}

export interface CounterPartyFormData {
  id?: number;
  name: string;
  type: string;
  contact_info: string;
  credit_status: string;
  is_active: boolean;
}

export interface CapacityFormData {
  id?: number;
  commodity_id: string;
  location_id: string;
  capacity_type: string;
  quantity: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export interface BlendComponentFormData {
  id?: number;
  blend_id: string;
  component_commodity_id: string;
  percentage: string;
  is_active: boolean;
}
