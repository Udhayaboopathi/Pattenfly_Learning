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
  getUOMs,
  createUOM,
  updateUOM,
  deleteUOM,
  exportUOMs,
  importUOMs,
} from "../api";
import { UOM, UOMFormData } from "../types";

const UOMs: React.FC = () => {
  const [uoms, setUOMs] = useState<UOM[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [openImportDialog, setOpenImportDialog] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [currentUOM, setCurrentUOM] = useState<UOMFormData>({
    name: "",
    type: "",
    base_uom: "",
    description: "",
    is_active: true,
  });

  useEffect(() => {
    fetchUOMs();
  }, []);

  const fetchUOMs = async () => {
    try {
      setLoading(true);
      const response = await getUOMs();
      setUOMs(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch UOMs.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (uom: UOM | null = null) => {
    if (uom) {
      setEditMode(true);
      setCurrentUOM({
        id: uom.id,
        name: uom.name || "",
        type: uom.type || "",
        base_uom: uom.base_uom?.toString() || "",
        description: uom.description || "",
        is_active: uom.is_active ?? true,
      });
    } else {
      setEditMode(false);
      setCurrentUOM({
        name: "",
        type: "",
        base_uom: "",
        description: "",
        is_active: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentUOM({
      name: "",
      type: "",
      base_uom: "",
      description: "",
      is_active: true,
    });
  };

  const handleSave = async () => {
    try {
      const payload = {
        name: currentUOM.name,
        type: currentUOM.type || undefined,
        base_uom: currentUOM.base_uom
          ? parseFloat(String(currentUOM.base_uom))
          : undefined,
        description: currentUOM.description || undefined,
        is_active: currentUOM.is_active,
      };

      if (editMode && currentUOM.id) {
        await updateUOM(currentUOM.id, payload);
      } else {
        await createUOM(payload);
      }

      handleCloseDialog();
      fetchUOMs();
    } catch (err: any) {
      console.error("Save failed:", err);
      setError(err.response?.data?.detail || "Failed to save UOM.");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this UOM?")) {
      try {
        await deleteUOM(id);
        fetchUOMs();
      } catch (err: any) {
        setError(err.response?.data?.detail || "Failed to delete UOM.");
      }
    }
  };

  return (
    <PageSection>
      <Title headingLevel="h1" size="2xl" style={{ marginBottom: "1rem" }}>
        Units of Measure
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
              Add UOM
            </Button>
          </ToolbarItem>
          <ToolbarItem>
            <ExportButton onExport={exportUOMs} filename="uoms.xlsx" />
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
        <Table aria-label="UOMs table">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Type</Th>
              <Th>Base UOM</Th>
              <Th>Description</Th>
              <Th>Active</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {uoms.map((uom) => (
              <Tr key={uom.id}>
                <Td dataLabel="Name">{uom.name}</Td>
                <Td dataLabel="Type">{uom.type || "-"}</Td>
                <Td dataLabel="Base UOM">{uom.base_uom ?? "-"}</Td>
                <Td dataLabel="Description">{uom.description || "-"}</Td>
                <Td dataLabel="Active">{uom.is_active ? "Yes" : "No"}</Td>
                <Td dataLabel="Actions">
                  <Split hasGutter>
                    <SplitItem>
                      <Button
                        variant="plain"
                        icon={<PencilAltIcon />}
                        onClick={() => handleOpenDialog(uom)}
                      />
                    </SplitItem>
                    <SplitItem>
                      <Button
                        variant="plain"
                        icon={<TrashIcon />}
                        onClick={() => handleDelete(uom.id)}
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
        <ModalHeader title={editMode ? "Edit UOM" : "Add UOM"} />
        <ModalBody>
          <Form>
            <FormGroup label="Name" isRequired fieldId="uom-name">
              <TextInput
                id="uom-name"
                value={currentUOM.name}
                onChange={(_event, value) =>
                  setCurrentUOM({ ...currentUOM, name: value })
                }
                isRequired
              />
            </FormGroup>
            <FormGroup label="Type" fieldId="uom-type">
              <TextInput
                id="uom-type"
                value={currentUOM.type}
                onChange={(_event, value) =>
                  setCurrentUOM({ ...currentUOM, type: value })
                }
                placeholder="e.g., volume, mass, energy"
              />
            </FormGroup>
            <FormGroup label="Base UOM Factor" fieldId="uom-base">
              <TextInput
                id="uom-base"
                type="number"
                value={currentUOM.base_uom}
                onChange={(_event, value) =>
                  setCurrentUOM({ ...currentUOM, base_uom: value })
                }
              />
            </FormGroup>
            <FormGroup label="Description" fieldId="uom-description">
              <TextArea
                id="uom-description"
                value={currentUOM.description}
                onChange={(_event, value) =>
                  setCurrentUOM({ ...currentUOM, description: value })
                }
              />
            </FormGroup>
            <FormGroup fieldId="uom-active">
              <Checkbox
                id="uom-active"
                label="Active"
                isChecked={currentUOM.is_active}
                onChange={(_event, checked) =>
                  setCurrentUOM({ ...currentUOM, is_active: checked })
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
        onImport={importUOMs}
        entityName="UOMs"
        entityKey="uoms"
        onSuccess={fetchUOMs}
      />
    </PageSection>
  );
};

export default UOMs;
