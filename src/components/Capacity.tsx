import React, { useState, useEffect } from "react";
import {
  PageSection,
  Title,
  Button,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  Spinner,
  Alert,
  AlertGroup,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  Form,
  FormGroup,
  TextInput,
  FormSelect,
  FormSelectOption,
  Checkbox,
  Split,
  SplitItem,
  Grid,
  GridItem,
  Card,
  CardTitle,
  CardBody,
  Content,
} from "@patternfly/react-core";
import { Table, Thead, Tr, Th, Tbody, Td } from "@patternfly/react-table";
import {
  PlusCircleIcon,
  PencilAltIcon,
  TrashIcon,
  UploadIcon,
} from "@patternfly/react-icons";
import ExportButton from "./ExportButton";
import EnhancedImportDialog from "./EnhancedImportDialog";
import {
  getCapacity,
  createCapacity,
  updateCapacity,
  deleteCapacity,
  getCommodities,
  getLocations,
  exportCapacity,
  importCapacity,
} from "../api";
import {
  Capacity as CapacityType,
  CapacityFormData,
  Commodity,
  Location,
} from "../types";

const Capacity: React.FC = () => {
  const [capacities, setCapacities] = useState<CapacityType[]>([]);
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [openImportDialog, setOpenImportDialog] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [selectedCommodity, setSelectedCommodity] = useState<Commodity | null>(
    null,
  );
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null,
  );
  const [currentCapacity, setCurrentCapacity] = useState<CapacityFormData>({
    commodity_id: "",
    location_id: "",
    capacity_type: "",
    quantity: "",
    start_date: "",
    end_date: "",
    is_active: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [capacityRes, commoditiesRes, locationsRes] = await Promise.all([
        getCapacity(),
        getCommodities(),
        getLocations(),
      ]);
      setCapacities(capacityRes.data);
      setCommodities(commoditiesRes.data);
      setLocations(locationsRes.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch data.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (capacity: CapacityType | null = null) => {
    if (capacity) {
      setEditMode(true);
      setCurrentCapacity({
        id: capacity.id,
        commodity_id: capacity.commodity_id?.toString() || "",
        location_id: capacity.location_id?.toString() || "",
        capacity_type: capacity.capacity_type || "",
        quantity: capacity.quantity?.toString() || "",
        start_date: capacity.start_date || "",
        end_date: capacity.end_date || "",
        is_active: capacity.is_active ?? true,
      });
      const commodity = commodities.find((c) => c.id === capacity.commodity_id);
      const location = locations.find((l) => l.id === capacity.location_id);
      setSelectedCommodity(commodity || null);
      setSelectedLocation(location || null);
    } else {
      setEditMode(false);
      setCurrentCapacity({
        commodity_id: "",
        location_id: "",
        capacity_type: "",
        quantity: "",
        start_date: "",
        end_date: "",
        is_active: true,
      });
      setSelectedCommodity(null);
      setSelectedLocation(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCommodity(null);
    setSelectedLocation(null);
    setCurrentCapacity({
      commodity_id: "",
      location_id: "",
      capacity_type: "",
      quantity: "",
      start_date: "",
      end_date: "",
      is_active: true,
    });
  };

  const handleCommodityChange = (value: string) => {
    setCurrentCapacity({ ...currentCapacity, commodity_id: value });
    const commodity = commodities.find((c) => c.id.toString() === value);
    setSelectedCommodity(commodity || null);
  };

  const handleLocationChange = (value: string) => {
    setCurrentCapacity({ ...currentCapacity, location_id: value });
    const location = locations.find((l) => l.id.toString() === value);
    setSelectedLocation(location || null);
  };

  const handleSave = async () => {
    try {
      const payload = {
        commodity_id: currentCapacity.commodity_id
          ? parseInt(currentCapacity.commodity_id)
          : undefined,
        location_id: currentCapacity.location_id
          ? parseInt(currentCapacity.location_id)
          : undefined,
        capacity_type: currentCapacity.capacity_type || undefined,
        quantity: currentCapacity.quantity
          ? parseFloat(currentCapacity.quantity)
          : undefined,
        start_date: currentCapacity.start_date || undefined,
        end_date: currentCapacity.end_date || undefined,
        is_active: currentCapacity.is_active,
      };

      if (editMode && currentCapacity.id) {
        await updateCapacity(currentCapacity.id, payload);
      } else {
        await createCapacity(payload);
      }

      handleCloseDialog();
      fetchData();
    } catch (err: any) {
      console.error("Save failed:", err);
      setError(err.response?.data?.detail || "Failed to save capacity.");
    }
  };

  const handleDelete = async (id: number) => {
    if (
      window.confirm("Are you sure you want to delete this capacity record?")
    ) {
      try {
        await deleteCapacity(id);
        fetchData();
      } catch (err: any) {
        setError(err.response?.data?.detail || "Failed to delete capacity.");
      }
    }
  };

  const getCommodityName = (commodityId: number | null | undefined) => {
    if (!commodityId) return "-";
    const commodity = commodities.find((c) => c.id === commodityId);
    return commodity ? commodity.name : "-";
  };

  const getLocationName = (locationId: number | null | undefined) => {
    if (!locationId) return "-";
    const location = locations.find((l) => l.id === locationId);
    return location ? location.name : "-";
  };

  return (
    <PageSection>
      <Title headingLevel="h1" size="2xl" style={{ marginBottom: "1rem" }}>
        Capacity
      </Title>

      {error && (
        <AlertGroup>
          <Alert
            variant="danger"
            title={error}
            actionClose={
              <Button variant="plain" onClick={() => setError(null)}>
                ×
              </Button>
            }
          />
        </AlertGroup>
      )}

      <Toolbar>
        <ToolbarContent>
          <ToolbarItem>
            <Button
              variant="primary"
              icon={<PlusCircleIcon />}
              onClick={() => handleOpenDialog()}
            >
              Add Capacity
            </Button>
          </ToolbarItem>
          <ToolbarItem>
            <ExportButton onExport={exportCapacity} filename="capacity.xlsx" />
          </ToolbarItem>
          <ToolbarItem>
            <Button
              variant="secondary"
              icon={<UploadIcon />}
              onClick={() => setOpenImportDialog(true)}
            >
              Import
            </Button>
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>

      {loading ? (
        <div
          style={{ display: "flex", justifyContent: "center", padding: "2rem" }}
        >
          <Spinner size="xl" />
        </div>
      ) : (
        <Table aria-label="Capacity table">
          <Thead>
            <Tr>
              <Th>Commodity</Th>
              <Th>Location</Th>
              <Th>Type</Th>
              <Th>Quantity</Th>
              <Th>Start Date</Th>
              <Th>End Date</Th>
              <Th>Active</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {capacities.map((capacity) => (
              <Tr key={capacity.id}>
                <Td dataLabel="Commodity">
                  {getCommodityName(capacity.commodity_id)}
                </Td>
                <Td dataLabel="Location">
                  {getLocationName(capacity.location_id)}
                </Td>
                <Td dataLabel="Type">{capacity.capacity_type || "-"}</Td>
                <Td dataLabel="Quantity">{capacity.quantity ?? "-"}</Td>
                <Td dataLabel="Start Date">{capacity.start_date || "-"}</Td>
                <Td dataLabel="End Date">{capacity.end_date || "-"}</Td>
                <Td dataLabel="Active">{capacity.is_active ? "Yes" : "No"}</Td>
                <Td dataLabel="Actions">
                  <Split hasGutter>
                    <SplitItem>
                      <Button
                        variant="plain"
                        icon={<PencilAltIcon />}
                        onClick={() => handleOpenDialog(capacity)}
                      />
                    </SplitItem>
                    <SplitItem>
                      <Button
                        variant="plain"
                        icon={<TrashIcon />}
                        onClick={() => handleDelete(capacity.id)}
                        isDanger
                      />
                    </SplitItem>
                  </Split>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}

      {/* Add/Edit Modal */}
      <Modal
        variant={ModalVariant.large}
        isOpen={openDialog}
        onClose={handleCloseDialog}
      >
        <ModalHeader title={editMode ? "Edit Capacity" : "Add Capacity"} />
        <ModalBody>
          <Form>
            <Grid hasGutter>
              <GridItem span={6}>
                <FormGroup
                  label="Commodity"
                  isRequired
                  fieldId="capacity-commodity"
                >
                  <FormSelect
                    id="capacity-commodity"
                    value={currentCapacity.commodity_id}
                    onChange={(_event, value) => handleCommodityChange(value)}
                    isRequired
                  >
                    <FormSelectOption value="" label="Select Commodity" />
                    {commodities.map((commodity) => (
                      <FormSelectOption
                        key={commodity.id}
                        value={commodity.id.toString()}
                        label={commodity.name}
                      />
                    ))}
                  </FormSelect>
                </FormGroup>

                {selectedCommodity && (
                  <Card style={{ marginTop: "1rem" }}>
                    <CardTitle>Commodity Details</CardTitle>
                    <CardBody>
                      <Content>
                        <p>
                          <strong>Name:</strong> {selectedCommodity.name}
                        </p>
                        <p>
                          <strong>Description:</strong>{" "}
                          {selectedCommodity.description || "-"}
                        </p>
                        <p>
                          <strong>Density:</strong>{" "}
                          {selectedCommodity.density ?? "-"}
                        </p>
                      </Content>
                    </CardBody>
                  </Card>
                )}
              </GridItem>

              <GridItem span={6}>
                <FormGroup
                  label="Location"
                  isRequired
                  fieldId="capacity-location"
                >
                  <FormSelect
                    id="capacity-location"
                    value={currentCapacity.location_id}
                    onChange={(_event, value) => handleLocationChange(value)}
                    isRequired
                  >
                    <FormSelectOption value="" label="Select Location" />
                    {locations.map((location) => (
                      <FormSelectOption
                        key={location.id}
                        value={location.id.toString()}
                        label={location.name}
                      />
                    ))}
                  </FormSelect>
                </FormGroup>

                {selectedLocation && (
                  <Card style={{ marginTop: "1rem" }}>
                    <CardTitle>Location Details</CardTitle>
                    <CardBody>
                      <Content>
                        <p>
                          <strong>Name:</strong> {selectedLocation.name}
                        </p>
                        <p>
                          <strong>Type:</strong>{" "}
                          {selectedLocation.location_type || "-"}
                        </p>
                        <p>
                          <strong>Address:</strong>{" "}
                          {selectedLocation.address || "-"}
                        </p>
                      </Content>
                    </CardBody>
                  </Card>
                )}
              </GridItem>

              <GridItem span={6}>
                <FormGroup label="Capacity Type" fieldId="capacity-type">
                  <TextInput
                    id="capacity-type"
                    value={currentCapacity.capacity_type}
                    onChange={(_event, value) =>
                      setCurrentCapacity({
                        ...currentCapacity,
                        capacity_type: value,
                      })
                    }
                    placeholder="e.g., storage, throughput"
                  />
                </FormGroup>
              </GridItem>

              <GridItem span={6}>
                <FormGroup label="Quantity" fieldId="capacity-quantity">
                  <TextInput
                    id="capacity-quantity"
                    type="number"
                    value={currentCapacity.quantity}
                    onChange={(_event, value) =>
                      setCurrentCapacity({
                        ...currentCapacity,
                        quantity: value,
                      })
                    }
                  />
                </FormGroup>
              </GridItem>

              <GridItem span={6}>
                <FormGroup label="Start Date" fieldId="capacity-start-date">
                  <TextInput
                    id="capacity-start-date"
                    type="date"
                    value={currentCapacity.start_date}
                    onChange={(_event, value) =>
                      setCurrentCapacity({
                        ...currentCapacity,
                        start_date: value,
                      })
                    }
                  />
                </FormGroup>
              </GridItem>

              <GridItem span={6}>
                <FormGroup label="End Date" fieldId="capacity-end-date">
                  <TextInput
                    id="capacity-end-date"
                    type="date"
                    value={currentCapacity.end_date}
                    onChange={(_event, value) =>
                      setCurrentCapacity({
                        ...currentCapacity,
                        end_date: value,
                      })
                    }
                  />
                </FormGroup>
              </GridItem>

              <GridItem span={12}>
                <FormGroup fieldId="capacity-active">
                  <Checkbox
                    id="capacity-active"
                    label="Active"
                    isChecked={currentCapacity.is_active}
                    onChange={(_event, checked) =>
                      setCurrentCapacity({
                        ...currentCapacity,
                        is_active: checked,
                      })
                    }
                  />
                </FormGroup>
              </GridItem>
            </Grid>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button variant="primary" onClick={handleSave}>
            {editMode ? "Update" : "Create"}
          </Button>
          <Button variant="link" onClick={handleCloseDialog}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      {/* Import Dialog */}
      <EnhancedImportDialog
        open={openImportDialog}
        onClose={() => setOpenImportDialog(false)}
        onImport={importCapacity}
        entityName="Capacity"
        entityKey="capacity"
        onSuccess={fetchData}
      />
    </PageSection>
  );
};

export default Capacity;
