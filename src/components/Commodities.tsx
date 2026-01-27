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
  getCommodities,
  createCommodity,
  updateCommodity,
  deleteCommodity,
  getUOMs,
  exportCommodities,
  importCommodities,
} from "../api";
import { Commodity, UOM, CommodityFormData } from "../types";

const Commodities: React.FC = () => {
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [uoms, setUOMs] = useState<UOM[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [openImportDialog, setOpenImportDialog] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [currentCommodity, setCurrentCommodity] = useState<CommodityFormData>({
    name: "",
    description: "",
    uom_id: "",
    density: "",
    energy_uom: "",
    is_active: true,
  });

  useEffect(() => {
    fetchCommodities();
    fetchUOMs();
  }, []);

  const fetchUOMs = async () => {
    try {
      const response = await getUOMs();
      setUOMs(response.data);
    } catch (err) {
      console.error("Failed to fetch UOMs:", err);
    }
  };

  const fetchCommodities = async () => {
    try {
      setLoading(true);
      const response = await getCommodities();
      setCommodities(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch commodities.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (commodity: Commodity | null = null) => {
    if (commodity) {
      setEditMode(true);
      setCurrentCommodity({
        id: commodity.id,
        name: commodity.name || "",
        description: commodity.description || "",
        uom_id: commodity.uom_id?.toString() || "",
        density: commodity.density?.toString() || "",
        energy_uom: commodity.energy_uom || "",
        is_active: commodity.is_active ?? true,
      });
    } else {
      setEditMode(false);
      setCurrentCommodity({
        name: "",
        description: "",
        uom_id: "",
        density: "",
        energy_uom: "",
        is_active: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentCommodity({
      name: "",
      description: "",
      uom_id: "",
      density: "",
      energy_uom: "",
      is_active: true,
    });
  };

  const handleSave = async () => {
    try {
      const payload = {
        name: currentCommodity.name,
        description: currentCommodity.description || undefined,
        uom_id: currentCommodity.uom_id
          ? parseInt(String(currentCommodity.uom_id))
          : undefined,
        density: currentCommodity.density
          ? parseFloat(String(currentCommodity.density))
          : undefined,
        energy_uom: currentCommodity.energy_uom || undefined,
        is_active: currentCommodity.is_active,
      };

      if (editMode && currentCommodity.id) {
        await updateCommodity(currentCommodity.id, payload);
      } else {
        await createCommodity(payload);
      }

      handleCloseDialog();
      fetchCommodities();
    } catch (err: any) {
      console.error("Save failed:", err);
      setError(err.response?.data?.detail || "Failed to save commodity.");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this commodity?")) {
      try {
        await deleteCommodity(id);
        fetchCommodities();
      } catch (err: any) {
        setError(err.response?.data?.detail || "Failed to delete commodity.");
      }
    }
  };

  const getUOMName = (uomId: number | null | undefined) => {
    if (!uomId) return "-";
    const uom = uoms.find((u) => u.id === uomId);
    return uom ? uom.name : "-";
  };

  return (
    <PageSection>
      <Title headingLevel="h1" size="2xl" style={{ marginBottom: "1rem" }}>
        Commodities
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
              Add Commodity
            </Button>
          </ToolbarItem>
          <ToolbarItem>
            <ExportButton
              onExport={exportCommodities}
              filename="commodities.xlsx"
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
        <Table aria-label="Commodities table">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Description</Th>
              <Th>UOM</Th>
              <Th>Density</Th>
              <Th>Energy UOM</Th>
              <Th>Active</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {commodities.map((commodity) => (
              <Tr key={commodity.id}>
                <Td dataLabel="Name">{commodity.name}</Td>
                <Td dataLabel="Description">{commodity.description || "-"}</Td>
                <Td dataLabel="UOM">{getUOMName(commodity.uom_id)}</Td>
                <Td dataLabel="Density">{commodity.density ?? "-"}</Td>
                <Td dataLabel="Energy UOM">{commodity.energy_uom || "-"}</Td>
                <Td dataLabel="Active">{commodity.is_active ? "Yes" : "No"}</Td>
                <Td dataLabel="Actions">
                  <Split hasGutter>
                    <SplitItem>
                      <Button
                        variant="plain"
                        icon={<PencilAltIcon />}
                        onClick={() => handleOpenDialog(commodity)}
                      />
                    </SplitItem>
                    <SplitItem>
                      <Button
                        variant="plain"
                        icon={<TrashIcon />}
                        onClick={() => handleDelete(commodity.id)}
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
        <ModalHeader title={editMode ? "Edit Commodity" : "Add Commodity"} />
        <ModalBody>
          <Form>
            <FormGroup label="Name" isRequired fieldId="commodity-name">
              <TextInput
                id="commodity-name"
                value={currentCommodity.name}
                onChange={(_event, value) =>
                  setCurrentCommodity({ ...currentCommodity, name: value })
                }
                isRequired
              />
            </FormGroup>
            <FormGroup label="Description" fieldId="commodity-description">
              <TextArea
                id="commodity-description"
                value={currentCommodity.description}
                onChange={(_event, value) =>
                  setCurrentCommodity({
                    ...currentCommodity,
                    description: value,
                  })
                }
              />
            </FormGroup>
            <FormGroup label="Unit of Measure" fieldId="commodity-uom">
              <FormSelect
                id="commodity-uom"
                value={currentCommodity.uom_id}
                onChange={(_event, value) =>
                  setCurrentCommodity({ ...currentCommodity, uom_id: value })
                }
              >
                <FormSelectOption value="" label="Select UOM" />
                {uoms.map((uom) => (
                  <FormSelectOption
                    key={uom.id}
                    value={uom.id.toString()}
                    label={uom.name}
                  />
                ))}
              </FormSelect>
            </FormGroup>
            <FormGroup label="Density" fieldId="commodity-density">
              <TextInput
                id="commodity-density"
                type="number"
                value={currentCommodity.density}
                onChange={(_event, value) =>
                  setCurrentCommodity({ ...currentCommodity, density: value })
                }
              />
            </FormGroup>
            <FormGroup label="Energy UOM" fieldId="commodity-energy-uom">
              <TextInput
                id="commodity-energy-uom"
                value={currentCommodity.energy_uom}
                onChange={(_event, value) =>
                  setCurrentCommodity({
                    ...currentCommodity,
                    energy_uom: value,
                  })
                }
              />
            </FormGroup>
            <FormGroup fieldId="commodity-active">
              <Checkbox
                id="commodity-active"
                label="Active"
                isChecked={currentCommodity.is_active}
                onChange={(_event, checked) =>
                  setCurrentCommodity({
                    ...currentCommodity,
                    is_active: checked,
                  })
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
        onImport={importCommodities}
        entityName="Commodities"
        entityKey="commodities"
        onSuccess={fetchCommodities}
      />
    </PageSection>
  );
};

export default Commodities;
