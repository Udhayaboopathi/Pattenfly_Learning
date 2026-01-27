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
  Label,
  Content,
  Card,
  CardTitle,
  CardBody,
} from "@patternfly/react-core";
import { Table, Thead, Tr, Th, Tbody, Td } from "@patternfly/react-table";
import {
  PlusCircleIcon,
  PencilAltIcon,
  TrashIcon,
  UploadIcon,
  EyeIcon,
} from "@patternfly/react-icons";
import ExportButton from "./ExportButton";
import EnhancedImportDialog from "./EnhancedImportDialog";
import {
  getBlends,
  createBlend,
  updateBlend,
  deleteBlend,
  getBlendComponentsByBlend,
  getCommodities,
  exportBlends,
  importBlends,
} from "../api";
import { Blend, BlendFormData, BlendComponent, Commodity } from "../types";

const Blends: React.FC = () => {
  const [blends, setBlends] = useState<Blend[]>([]);
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [openViewDialog, setOpenViewDialog] = useState<boolean>(false);
  const [openImportDialog, setOpenImportDialog] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [selectedBlend, setSelectedBlend] = useState<Blend | null>(null);
  const [blendComponents, setBlendComponents] = useState<BlendComponent[]>([]);
  const [currentBlend, setCurrentBlend] = useState<BlendFormData>({
    name: "",
    commodity_id: "",
    description: "",
    is_active: true,
  });

  useEffect(() => {
    fetchBlends();
    fetchCommodities();
  }, []);

  const fetchCommodities = async () => {
    try {
      const response = await getCommodities();
      setCommodities(response.data);
    } catch (err) {
      console.error("Failed to fetch commodities:", err);
    }
  };

  const fetchBlends = async () => {
    try {
      setLoading(true);
      const response = await getBlends();
      setBlends(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch blends.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBlendComponents = async (blendId: number) => {
    try {
      const response = await getBlendComponentsByBlend(blendId);
      setBlendComponents(response.data);
    } catch (err) {
      console.error("Failed to fetch blend components:", err);
      setBlendComponents([]);
    }
  };

  const handleOpenDialog = (blend: Blend | null = null) => {
    if (blend) {
      setEditMode(true);
      setCurrentBlend({
        id: blend.id,
        name: blend.name || "",
        commodity_id: blend.commodity_id?.toString() || "",
        description: blend.description || "",
        is_active: blend.is_active ?? true,
      });
    } else {
      setEditMode(false);
      setCurrentBlend({
        name: "",
        commodity_id: "",
        description: "",
        is_active: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentBlend({
      name: "",
      commodity_id: "",
      description: "",
      is_active: true,
    });
  };

  const handleViewBlend = async (blend: Blend) => {
    setSelectedBlend(blend);
    await fetchBlendComponents(blend.id);
    setOpenViewDialog(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        name: currentBlend.name,
        commodity_id: currentBlend.commodity_id
          ? parseInt(currentBlend.commodity_id)
          : undefined,
        description: currentBlend.description || undefined,
        is_active: currentBlend.is_active,
      };

      if (editMode && currentBlend.id) {
        await updateBlend(currentBlend.id, payload);
      } else {
        await createBlend(payload);
      }

      handleCloseDialog();
      fetchBlends();
    } catch (err: any) {
      console.error("Save failed:", err);
      setError(err.response?.data?.detail || "Failed to save blend.");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this blend?")) {
      try {
        await deleteBlend(id);
        fetchBlends();
      } catch (err: any) {
        setError(err.response?.data?.detail || "Failed to delete blend.");
      }
    }
  };

  const getCommodityName = (commodityId: number | null | undefined) => {
    if (!commodityId) return "-";
    const commodity = commodities.find((c) => c.id === commodityId);
    return commodity ? commodity.name : "-";
  };

  return (
    <PageSection>
      <Title headingLevel="h1" size="2xl" style={{ marginBottom: "1rem" }}>
        Blends
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
              Add Blend
            </Button>
          </ToolbarItem>
          <ToolbarItem>
            <ExportButton onExport={exportBlends} filename="blends.xlsx" />
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
        <Table aria-label="Blends table">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Commodity</Th>
              <Th>Description</Th>
              <Th>Active</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {blends.map((blend) => (
              <Tr key={blend.id}>
                <Td dataLabel="Name">{blend.name}</Td>
                <Td dataLabel="Commodity">
                  {getCommodityName(blend.commodity_id)}
                </Td>
                <Td dataLabel="Description">{blend.description || "-"}</Td>
                <Td dataLabel="Active">
                  <Label color={blend.is_active ? "green" : "grey"}>
                    {blend.is_active ? "Active" : "Inactive"}
                  </Label>
                </Td>
                <Td dataLabel="Actions">
                  <Split hasGutter>
                    <SplitItem>
                      <Button
                        variant="plain"
                        icon={<EyeIcon />}
                        onClick={() => handleViewBlend(blend)}
                      />
                    </SplitItem>
                    <SplitItem>
                      <Button
                        variant="plain"
                        icon={<PencilAltIcon />}
                        onClick={() => handleOpenDialog(blend)}
                      />
                    </SplitItem>
                    <SplitItem>
                      <Button
                        variant="plain"
                        icon={<TrashIcon />}
                        onClick={() => handleDelete(blend.id)}
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
        <ModalHeader title={editMode ? "Edit Blend" : "Add Blend"} />
        <ModalBody>
          <Form>
            <FormGroup label="Name" isRequired fieldId="blend-name">
              <TextInput
                id="blend-name"
                value={currentBlend.name}
                onChange={(_event, value) =>
                  setCurrentBlend({ ...currentBlend, name: value })
                }
                isRequired
              />
            </FormGroup>
            <FormGroup label="Commodity" fieldId="blend-commodity">
              <FormSelect
                id="blend-commodity"
                value={currentBlend.commodity_id}
                onChange={(_event, value) =>
                  setCurrentBlend({ ...currentBlend, commodity_id: value })
                }
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
            <FormGroup label="Description" fieldId="blend-description">
              <TextArea
                id="blend-description"
                value={currentBlend.description}
                onChange={(_event, value) =>
                  setCurrentBlend({ ...currentBlend, description: value })
                }
              />
            </FormGroup>
            <FormGroup fieldId="blend-active">
              <Checkbox
                id="blend-active"
                label="Active"
                isChecked={currentBlend.is_active}
                onChange={(_event, checked) =>
                  setCurrentBlend({ ...currentBlend, is_active: checked })
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

      {/* View Blend Modal */}
      <Modal
        variant={ModalVariant.large}
        isOpen={openViewDialog}
        onClose={() => setOpenViewDialog(false)}
      >
        <ModalHeader title={`Blend: ${selectedBlend?.name}`} />
        <ModalBody>
          {selectedBlend && (
            <div>
              <Card style={{ marginBottom: "1rem" }}>
                <CardTitle>Blend Details</CardTitle>
                <CardBody>
                  <Content>
                    <p>
                      <strong>Name:</strong> {selectedBlend.name}
                    </p>
                    <p>
                      <strong>Commodity:</strong>{" "}
                      {getCommodityName(selectedBlend.commodity_id)}
                    </p>
                    <p>
                      <strong>Description:</strong>{" "}
                      {selectedBlend.description || "-"}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      {selectedBlend.is_active ? "Active" : "Inactive"}
                    </p>
                  </Content>
                </CardBody>
              </Card>

              <Title
                headingLevel="h3"
                size="lg"
                style={{ marginBottom: "0.5rem" }}
              >
                Components
              </Title>
              {blendComponents.length > 0 ? (
                <Table aria-label="Blend components" variant="compact">
                  <Thead>
                    <Tr>
                      <Th>Component</Th>
                      <Th>Percentage</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {blendComponents.map((component) => (
                      <Tr key={component.id}>
                        <Td dataLabel="Component">
                          {getCommodityName(component.component_commodity_id)}
                        </Td>
                        <Td dataLabel="Percentage">{component.percentage}%</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              ) : (
                <Alert
                  variant="info"
                  title="No components defined for this blend"
                  isInline
                />
              )}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="primary" onClick={() => setOpenViewDialog(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

      {/* Import Dialog */}
      <EnhancedImportDialog
        open={openImportDialog}
        onClose={() => setOpenImportDialog(false)}
        onImport={importBlends}
        entityName="Blends"
        entityKey="blends"
        onSuccess={fetchBlends}
      />
    </PageSection>
  );
};

export default Blends;
