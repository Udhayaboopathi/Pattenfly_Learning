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
  TextArea,
  FormSelect,
  FormSelectOption,
  Checkbox,
  Split,
  SplitItem,
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
  getLocations,
  createLocation,
  updateLocation,
  deleteLocation,
  getCounterParties,
  exportLocations,
  importLocations,
} from "../api";
import { Location, LocationFormData, CounterParty } from "../types";

const Locations: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [counterParties, setCounterParties] = useState<CounterParty[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [openImportDialog, setOpenImportDialog] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [currentLocation, setCurrentLocation] = useState<LocationFormData>({
    name: "",
    location_type: "",
    address: "",
    counterparty_id: "",
    is_active: true,
  });

  useEffect(() => {
    fetchLocations();
    fetchCounterParties();
  }, []);

  const fetchCounterParties = async () => {
    try {
      const response = await getCounterParties();
      setCounterParties(response.data);
    } catch (err) {
      console.error("Failed to fetch counter parties:", err);
    }
  };

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await getLocations();
      setLocations(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch locations.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (location: Location | null = null) => {
    if (location) {
      setEditMode(true);
      setCurrentLocation({
        id: location.id,
        name: location.name || "",
        location_type: location.location_type || "",
        address: location.address || "",
        counterparty_id: location.counterparty_id?.toString() || "",
        is_active: location.is_active ?? true,
      });
    } else {
      setEditMode(false);
      setCurrentLocation({
        name: "",
        location_type: "",
        address: "",
        counterparty_id: "",
        is_active: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentLocation({
      name: "",
      location_type: "",
      address: "",
      counterparty_id: "",
      is_active: true,
    });
  };

  const handleSave = async () => {
    try {
      const payload = {
        name: currentLocation.name,
        location_type: currentLocation.location_type || undefined,
        address: currentLocation.address || undefined,
        counterparty_id: currentLocation.counterparty_id
          ? parseInt(currentLocation.counterparty_id)
          : undefined,
        is_active: currentLocation.is_active,
      };

      if (editMode && currentLocation.id) {
        await updateLocation(currentLocation.id, payload);
      } else {
        await createLocation(payload);
      }

      handleCloseDialog();
      fetchLocations();
    } catch (err: any) {
      console.error("Save failed:", err);
      setError(err.response?.data?.detail || "Failed to save location.");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this location?")) {
      try {
        await deleteLocation(id);
        fetchLocations();
      } catch (err: any) {
        setError(err.response?.data?.detail || "Failed to delete location.");
      }
    }
  };

  const getCounterPartyName = (cpId: number | null | undefined) => {
    if (!cpId) return "-";
    const cp = counterParties.find((c) => c.id === cpId);
    return cp ? cp.name : "-";
  };

  return (
    <PageSection>
      <Title headingLevel="h1" size="2xl" style={{ marginBottom: "1rem" }}>
        Locations
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
              Add Location
            </Button>
          </ToolbarItem>
          <ToolbarItem>
            <ExportButton
              onExport={exportLocations}
              filename="locations.xlsx"
            />
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
        <Table aria-label="Locations table">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Type</Th>
              <Th>Address</Th>
              <Th>Counter Party</Th>
              <Th>Active</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {locations.map((location) => (
              <Tr key={location.id}>
                <Td dataLabel="Name">{location.name}</Td>
                <Td dataLabel="Type">{location.location_type || "-"}</Td>
                <Td dataLabel="Address">{location.address || "-"}</Td>
                <Td dataLabel="Counter Party">
                  {getCounterPartyName(location.counterparty_id)}
                </Td>
                <Td dataLabel="Active">{location.is_active ? "Yes" : "No"}</Td>
                <Td dataLabel="Actions">
                  <Split hasGutter>
                    <SplitItem>
                      <Button
                        variant="plain"
                        icon={<PencilAltIcon />}
                        onClick={() => handleOpenDialog(location)}
                      />
                    </SplitItem>
                    <SplitItem>
                      <Button
                        variant="plain"
                        icon={<TrashIcon />}
                        onClick={() => handleDelete(location.id)}
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
        variant={ModalVariant.medium}
        isOpen={openDialog}
        onClose={handleCloseDialog}
      >
        <ModalHeader title={editMode ? "Edit Location" : "Add Location"} />
        <ModalBody>
          <Form>
            <FormGroup label="Name" isRequired fieldId="location-name">
              <TextInput
                id="location-name"
                value={currentLocation.name}
                onChange={(_event, value) =>
                  setCurrentLocation({ ...currentLocation, name: value })
                }
                isRequired
              />
            </FormGroup>
            <FormGroup label="Location Type" fieldId="location-type">
              <TextInput
                id="location-type"
                value={currentLocation.location_type}
                onChange={(_event, value) =>
                  setCurrentLocation({
                    ...currentLocation,
                    location_type: value,
                  })
                }
                placeholder="e.g., terminal, refinery, storage"
              />
            </FormGroup>
            <FormGroup label="Address" fieldId="location-address">
              <TextArea
                id="location-address"
                value={currentLocation.address}
                onChange={(_event, value) =>
                  setCurrentLocation({ ...currentLocation, address: value })
                }
              />
            </FormGroup>
            <FormGroup label="Counter Party" fieldId="location-counterparty">
              <FormSelect
                id="location-counterparty"
                value={currentLocation.counterparty_id}
                onChange={(_event, value) =>
                  setCurrentLocation({
                    ...currentLocation,
                    counterparty_id: value,
                  })
                }
              >
                <FormSelectOption value="" label="Select Counter Party" />
                {counterParties.map((cp) => (
                  <FormSelectOption
                    key={cp.id}
                    value={cp.id.toString()}
                    label={cp.name}
                  />
                ))}
              </FormSelect>
            </FormGroup>
            <FormGroup fieldId="location-active">
              <Checkbox
                id="location-active"
                label="Active"
                isChecked={currentLocation.is_active}
                onChange={(_event, checked) =>
                  setCurrentLocation({ ...currentLocation, is_active: checked })
                }
              />
            </FormGroup>
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
        onImport={importLocations}
        entityName="Locations"
        entityKey="locations"
        onSuccess={fetchLocations}
      />
    </PageSection>
  );
};

export default Locations;
