import {
  Commodity,
  UOM,
  Blend,
  BlendComponent,
  Location,
  CounterParty,
  Capacity,
  ImportResult,
} from "./types";
import {
  dummyUOMs,
  dummyCommodities,
  dummyLocations,
  dummyCounterParties,
  dummyBlends,
  dummyBlendComponents,
  dummyCapacity,
} from "./dummyData";

// Mock response helper
function mockResponse<T>(data: T): Promise<{ data: T }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data });
    }, 300); // Simulate network delay
  });
}

// Local storage for CRUD operations
let uomsData = [...dummyUOMs];
let commoditiesData = [...dummyCommodities];
let locationsData = [...dummyLocations];
let counterPartiesData = [...dummyCounterParties];
let blendsData = [...dummyBlends];
let blendComponentsData = [...dummyBlendComponents];
let capacityData = [...dummyCapacity];

// ID generators
let nextUOMId = Math.max(...uomsData.map((u) => u.id)) + 1;
let nextCommodityId = Math.max(...commoditiesData.map((c) => c.id)) + 1;
let nextLocationId = Math.max(...locationsData.map((l) => l.id)) + 1;
let nextCounterPartyId = Math.max(...counterPartiesData.map((c) => c.id)) + 1;
let nextBlendId = Math.max(...blendsData.map((b) => b.id)) + 1;
let nextBlendComponentId =
  Math.max(...blendComponentsData.map((b) => b.id)) + 1;
let nextCapacityId = Math.max(...capacityData.map((c) => c.id)) + 1;

// UOMs
export const getUOMs = () => mockResponse<UOM[]>(uomsData);
export const getUOM = (id: number) =>
  mockResponse<UOM>(uomsData.find((u) => u.id === id)!);
export const createUOM = (data: Partial<UOM>) => {
  const newUOM: UOM = {
    id: nextUOMId++,
    name: data.name || "",
    description: data.description,
    type: data.type,
    base_uom: data.base_uom,
    is_active: data.is_active ?? true,
    created_at: new Date().toISOString(),
  };
  uomsData.push(newUOM);
  return mockResponse<UOM>(newUOM);
};
export const updateUOM = (id: number, data: Partial<UOM>) => {
  const index = uomsData.findIndex((u) => u.id === id);
  if (index !== -1) {
    uomsData[index] = {
      ...uomsData[index],
      ...data,
      updated_at: new Date().toISOString(),
    };
  }
  return mockResponse<UOM>(uomsData[index]);
};
export const deleteUOM = (id: number) => {
  uomsData = uomsData.filter((u) => u.id !== id);
  return mockResponse<void>(undefined);
};

// Commodities
export const getCommodities = () => mockResponse<Commodity[]>(commoditiesData);
export const getCommodity = (id: number) =>
  mockResponse<Commodity>(commoditiesData.find((c) => c.id === id)!);
export const createCommodity = (data: Partial<Commodity>) => {
  const uom = uomsData.find((u) => u.id === data.uom_id);
  const newCommodity: Commodity = {
    id: nextCommodityId++,
    name: data.name || "",
    description: data.description,
    uom_id: data.uom_id,
    density: data.density,
    energy_uom: data.energy_uom,
    is_active: data.is_active ?? true,
    created_at: new Date().toISOString(),
    uom: uom ? { id: uom.id, name: uom.name } : undefined,
  };
  commoditiesData.push(newCommodity);
  return mockResponse<Commodity>(newCommodity);
};
export const updateCommodity = (id: number, data: Partial<Commodity>) => {
  const index = commoditiesData.findIndex((c) => c.id === id);
  if (index !== -1) {
    const uom = uomsData.find((u) => u.id === data.uom_id);
    commoditiesData[index] = {
      ...commoditiesData[index],
      ...data,
      uom: uom ? { id: uom.id, name: uom.name } : commoditiesData[index].uom,
      updated_at: new Date().toISOString(),
    };
  }
  return mockResponse<Commodity>(commoditiesData[index]);
};
export const deleteCommodity = (id: number) => {
  commoditiesData = commoditiesData.filter((c) => c.id !== id);
  return mockResponse<void>(undefined);
};

// Blends
export const getBlends = () => mockResponse<Blend[]>(blendsData);
export const getBlend = (id: number) =>
  mockResponse<Blend>(blendsData.find((b) => b.id === id)!);
export const createBlend = (data: Partial<Blend>) => {
  const newBlend: Blend = {
    id: nextBlendId++,
    name: data.name || "",
    commodity_id: data.commodity_id,
    description: data.description,
    is_active: data.is_active ?? true,
    created_at: new Date().toISOString(),
  };
  blendsData.push(newBlend);
  return mockResponse<Blend>(newBlend);
};
export const createBlendWithComponents = (data: {
  name: string;
  commodity_id: number;
  description?: string;
  is_active?: boolean;
  components: Array<{ component_commodity_id: number; percentage: number }>;
}) => {
  const newBlend: Blend = {
    id: nextBlendId++,
    name: data.name,
    commodity_id: data.commodity_id,
    description: data.description,
    is_active: data.is_active ?? true,
    created_at: new Date().toISOString(),
  };
  blendsData.push(newBlend);

  // Add components
  data.components.forEach((comp) => {
    const commodity = commoditiesData.find(
      (c) => c.id === comp.component_commodity_id,
    );
    const newComponent: BlendComponent = {
      id: nextBlendComponentId++,
      blend_id: newBlend.id,
      component_commodity_id: comp.component_commodity_id,
      percentage: comp.percentage,
      is_active: true,
      created_at: new Date().toISOString(),
      commodity: commodity,
      blend: newBlend,
    };
    blendComponentsData.push(newComponent);
  });

  return mockResponse<Blend>(newBlend);
};
export const updateBlend = (id: number, data: Partial<Blend>) => {
  const index = blendsData.findIndex((b) => b.id === id);
  if (index !== -1) {
    blendsData[index] = {
      ...blendsData[index],
      ...data,
      updated_at: new Date().toISOString(),
    };
  }
  return mockResponse<Blend>(blendsData[index]);
};
export const deleteBlend = (id: number) => {
  blendsData = blendsData.filter((b) => b.id !== id);
  blendComponentsData = blendComponentsData.filter((bc) => bc.blend_id !== id);
  return mockResponse<void>(undefined);
};

// Blend Components
export const getBlendComponents = () =>
  mockResponse<BlendComponent[]>(blendComponentsData);
export const getBlendComponentsByBlend = (blendId: number) =>
  mockResponse<BlendComponent[]>(
    blendComponentsData.filter((bc) => bc.blend_id === blendId),
  );
export const getBlendComponent = (id: number) =>
  mockResponse<BlendComponent>(blendComponentsData.find((bc) => bc.id === id)!);
export const createBlendComponent = (data: Partial<BlendComponent>) => {
  const commodity = commoditiesData.find(
    (c) => c.id === data.component_commodity_id,
  );
  const blend = blendsData.find((b) => b.id === data.blend_id);
  const newComponent: BlendComponent = {
    id: nextBlendComponentId++,
    blend_id: data.blend_id || 0,
    component_commodity_id: data.component_commodity_id || 0,
    percentage: data.percentage || 0,
    is_active: data.is_active ?? true,
    created_at: new Date().toISOString(),
    commodity: commodity,
    blend: blend,
  };
  blendComponentsData.push(newComponent);
  return mockResponse<BlendComponent>(newComponent);
};
export const updateBlendComponent = (
  id: number,
  data: Partial<BlendComponent>,
): Promise<{ data: BlendComponent }> => {
  const index = blendComponentsData.findIndex((bc) => bc.id === id);
  if (index !== -1) {
    const commodity = commoditiesData.find(
      (c) => c.id === data.component_commodity_id,
    );
    const blend = blendsData.find((b) => b.id === data.blend_id);
    blendComponentsData[index] = {
      ...blendComponentsData[index],
      ...data,
      commodity: commodity || blendComponentsData[index].commodity,
      blend: blend || blendComponentsData[index].blend,
      updated_at: new Date().toISOString(),
    };
  }
  return mockResponse<BlendComponent>(blendComponentsData[index]);
};
export const deleteBlendComponent = (id: number) => {
  blendComponentsData = blendComponentsData.filter((bc) => bc.id !== id);
  return mockResponse<void>(undefined);
};

// Locations
export const getLocations = () => mockResponse<Location[]>(locationsData);
export const getLocation = (id: number) =>
  mockResponse<Location>(locationsData.find((l) => l.id === id)!);
export const createLocation = (data: Partial<Location>) => {
  const newLocation: Location = {
    id: nextLocationId++,
    name: data.name || "",
    location_type: data.location_type,
    address: data.address,
    counterparty_id: data.counterparty_id,
    is_active: data.is_active ?? true,
    created_at: new Date().toISOString(),
  };
  locationsData.push(newLocation);
  return mockResponse<Location>(newLocation);
};
export const updateLocation = (id: number, data: Partial<Location>) => {
  const index = locationsData.findIndex((l) => l.id === id);
  if (index !== -1) {
    locationsData[index] = {
      ...locationsData[index],
      ...data,
      updated_at: new Date().toISOString(),
    };
  }
  return mockResponse<Location>(locationsData[index]);
};
export const deleteLocation = (id: number) => {
  locationsData = locationsData.filter((l) => l.id !== id);
  return mockResponse<void>(undefined);
};

// Counter Parties
export const getCounterParties = () =>
  mockResponse<CounterParty[]>(counterPartiesData);
export const getCounterParty = (id: number) =>
  mockResponse<CounterParty>(counterPartiesData.find((cp) => cp.id === id)!);
export const createCounterParty = (data: Partial<CounterParty>) => {
  const newCounterParty: CounterParty = {
    id: nextCounterPartyId++,
    name: data.name || "",
    type: data.type,
    contact_info: data.contact_info,
    credit_status: data.credit_status,
    is_active: data.is_active ?? true,
    created_at: new Date().toISOString(),
  };
  counterPartiesData.push(newCounterParty);
  return mockResponse<CounterParty>(newCounterParty);
};
export const updateCounterParty = (id: number, data: Partial<CounterParty>) => {
  const index = counterPartiesData.findIndex((cp) => cp.id === id);
  if (index !== -1) {
    counterPartiesData[index] = {
      ...counterPartiesData[index],
      ...data,
      updated_at: new Date().toISOString(),
    };
  }
  return mockResponse<CounterParty>(counterPartiesData[index]);
};
export const deleteCounterParty = (id: number) => {
  counterPartiesData = counterPartiesData.filter((cp) => cp.id !== id);
  return mockResponse<void>(undefined);
};

// Capacity
export const getCapacity = () => mockResponse<Capacity[]>(capacityData);
export const getCapacityItem = (id: number) =>
  mockResponse<Capacity>(capacityData.find((c) => c.id === id)!);
export const createCapacity = (data: Partial<Capacity>) => {
  const commodity = commoditiesData.find((c) => c.id === data.commodity_id);
  const location = locationsData.find((l) => l.id === data.location_id);
  const newCapacity: Capacity = {
    id: nextCapacityId++,
    commodity_id: data.commodity_id,
    location_id: data.location_id,
    capacity_type: data.capacity_type,
    quantity: data.quantity,
    start_date: data.start_date,
    end_date: data.end_date,
    is_active: data.is_active ?? true,
    created_at: new Date().toISOString(),
    commodity: commodity,
    location: location,
  };
  capacityData.push(newCapacity);
  return mockResponse<Capacity>(newCapacity);
};
export const updateCapacity = (id: number, data: Partial<Capacity>) => {
  const index = capacityData.findIndex((c) => c.id === id);
  if (index !== -1) {
    const commodity = commoditiesData.find((c) => c.id === data.commodity_id);
    const location = locationsData.find((l) => l.id === data.location_id);
    capacityData[index] = {
      ...capacityData[index],
      ...data,
      commodity: commodity || capacityData[index].commodity,
      location: location || capacityData[index].location,
      updated_at: new Date().toISOString(),
    };
  }
  return mockResponse<Capacity>(capacityData[index]);
};
export const deleteCapacity = (id: number) => {
  capacityData = capacityData.filter((c) => c.id !== id);
  return mockResponse<void>(undefined);
};

// Dependent Data Lookup APIs
export const getCommodityDetails = (id: number) => getCommodity(id);
export const getLocationDetails = (id: number) => getLocation(id);

// Validation APIs
export const validateCapacity = (_data: Partial<Capacity>) =>
  mockResponse({ valid: true, errors: [] });
export const validateBlendProportion = (blendId: number) => {
  const components = blendComponentsData.filter(
    (bc) => bc.blend_id === blendId,
  );
  const total = components.reduce((sum, c) => sum + c.percentage, 0);
  return mockResponse({
    valid: total === 100,
    total,
    message: total === 100 ? "Valid" : `Total is ${total}%, should be 100%`,
  });
};

// Export APIs - Generate CSV blobs
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const generateCSV = (data: any[], columns: string[]): Blob => {
  const header = columns.join(",");
  const rows = data.map((item) =>
    columns
      .map((col) => {
        const value = item[col];
        if (value === null || value === undefined) return "";
        if (typeof value === "string" && value.includes(","))
          return `"${value}"`;
        return String(value);
      })
      .join(","),
  );
  return new Blob([header + "\n" + rows.join("\n")], { type: "text/csv" });
};

export const exportCommodities = () =>
  mockResponse(
    generateCSV(commoditiesData, [
      "id",
      "name",
      "description",
      "uom_id",
      "density",
      "energy_uom",
      "is_active",
    ]),
  );
export const exportCapacity = () =>
  mockResponse(
    generateCSV(capacityData, [
      "id",
      "commodity_id",
      "location_id",
      "capacity_type",
      "quantity",
      "start_date",
      "end_date",
      "is_active",
    ]),
  );
export const exportBlends = () =>
  mockResponse(
    generateCSV(blendsData, [
      "id",
      "name",
      "commodity_id",
      "description",
      "is_active",
    ]),
  );
export const exportBlendComponents = () =>
  mockResponse(
    generateCSV(blendComponentsData, [
      "id",
      "blend_id",
      "component_commodity_id",
      "percentage",
      "is_active",
    ]),
  );
export const exportUOMs = () =>
  mockResponse(
    generateCSV(uomsData, [
      "id",
      "name",
      "description",
      "type",
      "base_uom",
      "is_active",
    ]),
  );
export const exportLocations = () =>
  mockResponse(
    generateCSV(locationsData, [
      "id",
      "name",
      "location_type",
      "address",
      "counterparty_id",
      "is_active",
    ]),
  );
export const exportCounterParties = () =>
  mockResponse(
    generateCSV(counterPartiesData, [
      "id",
      "name",
      "type",
      "contact_info",
      "credit_status",
      "is_active",
    ]),
  );

// Import APIs - Mock implementation
export const importCapacity = (_formData: FormData) =>
  mockResponse<ImportResult>({
    successful: [{ row: 1, data: {} }],
    failed: [],
    summary: { total: 1, successful: 1, failed: 0 },
  });
export const importBlends = (_formData: FormData) =>
  mockResponse<ImportResult>({
    successful: [{ row: 1, data: {} }],
    failed: [],
    summary: { total: 1, successful: 1, failed: 0 },
  });
export const importEntity = (_entityKey: string, _formData: FormData) =>
  mockResponse<ImportResult>({
    successful: [{ row: 1, data: {} }],
    failed: [],
    summary: { total: 1, successful: 1, failed: 0 },
  });

// Template Download APIs
export const downloadTemplate = (entityKey: string) => {
  const templates: Record<string, string[]> = {
    commodities: [
      "name",
      "description",
      "uom_id",
      "density",
      "energy_uom",
      "is_active",
    ],
    uoms: ["name", "description", "type", "base_uom", "is_active"],
    locations: [
      "name",
      "location_type",
      "address",
      "counterparty_id",
      "is_active",
    ],
    counter_parties: [
      "name",
      "type",
      "contact_info",
      "credit_status",
      "is_active",
    ],
    blends: ["name", "commodity_id", "description", "is_active"],
    blend_components: [
      "blend_id",
      "component_commodity_id",
      "percentage",
      "is_active",
    ],
    capacity: [
      "commodity_id",
      "location_id",
      "capacity_type",
      "quantity",
      "start_date",
      "end_date",
      "is_active",
    ],
  };
  const columns = templates[entityKey] || ["column1", "column2"];
  return mockResponse(new Blob([columns.join(",")], { type: "text/csv" }));
};

// Convenience methods for specific entities
export const importCommodities = (formData: FormData) =>
  importEntity("commodities", formData);
export const importUOMs = (formData: FormData) =>
  importEntity("uoms", formData);
export const importLocations = (formData: FormData) =>
  importEntity("locations", formData);
export const importCounterParties = (formData: FormData) =>
  importEntity("counter_parties", formData);
export const importBlendComponents = (formData: FormData) =>
  importEntity("blend_components", formData);

export default {};
