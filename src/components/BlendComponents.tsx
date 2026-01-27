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
  Split,
  SplitItem,
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
  getBlendComponentsByBlend,
  createBlendComponent,
  updateBlendComponent,
  deleteBlendComponent,
  getBlends,
  getCommodities,
  exportBlendComponents,
  importBlendComponents,
} from "../api";
import {
  BlendComponent,
  BlendComponentFormData,
  Blend,
  Commodity,
} from "../types";

const BlendComponents: React.FC = () => {
  const [blendComponents, setBlendComponents] = useState<BlendComponent[]>([]);
  const [blends, setBlends] = useState<Blend[]>([]);
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [openImportDialog, setOpenImportDialog] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [selectedCommodity, setSelectedCommodity] = useState<Commodity | null>(
    null,
  );
  const [currentComponent, setCurrentComponent] =
    useState<BlendComponentFormData>({
      blend_id: "",
      component_commodity_id: "",
      percentage: "",
      is_active: true,
    });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [blendsRes, commoditiesRes] = await Promise.all([
        getBlends(),
        getCommodities(),
      ]);
      setBlends(blendsRes.data);
      setCommodities(commoditiesRes.data);

      // Fetch all blend components
      const allComponents: BlendComponent[] = [];
      for (const blend of blendsRes.data) {
        try {
          const compRes = await getBlendComponentsByBlend(blend.id);
          allComponents.push(...compRes.data);
        } catch (err) {
          console.error(
            `Failed to fetch components for blend ${blend.id}:`,
            err,
          );
        }
      }
      setBlendComponents(allComponents);
      setError(null);
    } catch (err) {
      setError("Failed to fetch data.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (component: BlendComponent | null = null) => {
    if (component) {
      setEditMode(true);
      setCurrentComponent({
        id: component.id,
        blend_id: component.blend_id?.toString() || "",
        component_commodity_id:
          component.component_commodity_id?.toString() || "",
        percentage: component.percentage?.toString() || "",
        is_active: component.is_active ?? true,
      });
      // Set selected commodity for display
      const commodity = commodities.find(
        (c) => c.id === component.component_commodity_id,
      );
      setSelectedCommodity(commodity || null);
    } else {
      setEditMode(false);
      setCurrentComponent({
        blend_id: "",
        component_commodity_id: "",
        percentage: "",
        is_active: true,
      });
      setSelectedCommodity(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCommodity(null);
    setCurrentComponent({
      blend_id: "",
      component_commodity_id: "",
      percentage: "",
      is_active: true,
    });
  };

  const handleCommodityChange = (value: string) => {
    setCurrentComponent({ ...currentComponent, component_commodity_id: value });
    const commodity = commodities.find((c) => c.id.toString() === value);
    setSelectedCommodity(commodity || null);
  };

  const handleSave = async () => {
    try {
      const payload = {
        blend_id: parseInt(currentComponent.blend_id),
        component_commodity_id: parseInt(
          currentComponent.component_commodity_id,
        ),
        percentage: parseFloat(currentComponent.percentage),
        is_active: currentComponent.is_active,
      };

      if (editMode && currentComponent.id) {
        await updateBlendComponent(currentComponent.id, payload);
      } else {
        await createBlendComponent(payload);
      }

      handleCloseDialog();
      fetchData();
    } catch (err: any) {
      console.error("Save failed:", err);
      setError(err.response?.data?.detail || "Failed to save blend component.");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this component?")) {
      try {
        await deleteBlendComponent(id);
        fetchData();
      } catch (err: any) {
        setError(err.response?.data?.detail || "Failed to delete component.");
      }
    }
  };

  const getBlendName = (blendId: number) => {
    const blend = blends.find((b) => b.id === blendId);
    return blend ? blend.name : "-";
  };

  const getCommodityName = (commodityId: number) => {
    const commodity = commodities.find((c) => c.id === commodityId);
    return commodity ? commodity.name : "-";
  };

  return (
    <PageSection>
      <Title headingLevel="h1" size="2xl" style={{ marginBottom: "1rem" }}>
        Blend Components
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
              Add Component
            </Button>
          </ToolbarItem>
          <ToolbarItem>
            <ExportButton
              onExport={exportBlendComponents}
              filename="blend_components.xlsx"
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
        <Table aria-label="Blend components table">
          <Thead>
            <Tr>
              <Th>Blend</Th>
              <Th>Component Commodity</Th>
              <Th>Percentage</Th>
              <Th>Active</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {blendComponents.map((component) => (
              <Tr key={component.id}>
                <Td dataLabel="Blend">{getBlendName(component.blend_id)}</Td>
                <Td dataLabel="Component Commodity">
                  {getCommodityName(component.component_commodity_id)}
                </Td>
                <Td dataLabel="Percentage">{component.percentage}%</Td>
                <Td dataLabel="Active">{component.is_active ? "Yes" : "No"}</Td>
                <Td dataLabel="Actions">
                  <Split hasGutter>
                    <SplitItem>
                      <Button
                        variant="plain"
                        icon={<PencilAltIcon />}
                        onClick={() => handleOpenDialog(component)}
                      />
                    </SplitItem>
                    <SplitItem>
                      <Button
                        variant="plain"
                        icon={<TrashIcon />}
                        onClick={() => handleDelete(component.id)}
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
        <ModalHeader
          title={editMode ? "Edit Blend Component" : "Add Blend Component"}
        />
        <ModalBody>
          <Form>
            <FormGroup label="Blend" isRequired fieldId="component-blend">
              <FormSelect
                id="component-blend"
                value={currentComponent.blend_id}
                onChange={(_event, value) =>
                  setCurrentComponent({ ...currentComponent, blend_id: value })
                }
                isRequired
              >
                <FormSelectOption value="" label="Select Blend" />
                {blends.map((blend) => (
                  <FormSelectOption
                    key={blend.id}
                    value={blend.id.toString()}
                    label={blend.name}
                  />
                ))}
              </FormSelect>
            </FormGroup>
            <FormGroup
              label="Component Commodity"
              isRequired
              fieldId="component-commodity"
            >
              <FormSelect
                id="component-commodity"
                value={currentComponent.component_commodity_id}
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
              <Card style={{ marginTop: "1rem", marginBottom: "1rem" }}>
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
                    <p>
                      <strong>Energy UOM:</strong>{" "}
                      {selectedCommodity.energy_uom || "-"}
                    </p>
                  </Content>
                </CardBody>
              </Card>
            )}

            <FormGroup
              label="Percentage"
              isRequired
              fieldId="component-percentage"
            >
              <TextInput
                id="component-percentage"
                type="number"
                value={currentComponent.percentage}
                onChange={(_event, value) =>
                  setCurrentComponent({
                    ...currentComponent,
                    percentage: value,
                  })
                }
                isRequired
                min={0}
                max={100}
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
        onImport={importBlendComponents}
        entityName="Blend Components"
        entityKey="blend_components"
        onSuccess={fetchData}
      />
    </PageSection>
  );
};

export default BlendComponents;
