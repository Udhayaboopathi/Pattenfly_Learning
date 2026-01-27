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
  getCounterParties,
  createCounterParty,
  updateCounterParty,
  deleteCounterParty,
  exportCounterParties,
  importCounterParties,
} from "../api";
import { CounterParty, CounterPartyFormData } from "../types";

const CounterParties: React.FC = () => {
  const [counterParties, setCounterParties] = useState<CounterParty[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [openImportDialog, setOpenImportDialog] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [currentCounterParty, setCurrentCounterParty] =
    useState<CounterPartyFormData>({
      name: "",
      type: "",
      contact_info: "",
      credit_status: "",
      is_active: true,
    });

  useEffect(() => {
    fetchCounterParties();
  }, []);

  const fetchCounterParties = async () => {
    try {
      setLoading(true);
      const response = await getCounterParties();
      setCounterParties(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch counter parties.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (cp: CounterParty | null = null) => {
    if (cp) {
      setEditMode(true);
      setCurrentCounterParty({
        id: cp.id,
        name: cp.name || "",
        type: cp.type || "",
        contact_info: cp.contact_info || "",
        credit_status: cp.credit_status || "",
        is_active: cp.is_active ?? true,
      });
    } else {
      setEditMode(false);
      setCurrentCounterParty({
        name: "",
        type: "",
        contact_info: "",
        credit_status: "",
        is_active: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentCounterParty({
      name: "",
      type: "",
      contact_info: "",
      credit_status: "",
      is_active: true,
    });
  };

  const handleSave = async () => {
    try {
      const payload = {
        name: currentCounterParty.name,
        type: currentCounterParty.type || undefined,
        contact_info: currentCounterParty.contact_info || undefined,
        credit_status: currentCounterParty.credit_status || undefined,
        is_active: currentCounterParty.is_active,
      };

      if (editMode && currentCounterParty.id) {
        await updateCounterParty(currentCounterParty.id, payload);
      } else {
        await createCounterParty(payload);
      }

      handleCloseDialog();
      fetchCounterParties();
    } catch (err: any) {
      console.error("Save failed:", err);
      setError(err.response?.data?.detail || "Failed to save counter party.");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this counter party?")) {
      try {
        await deleteCounterParty(id);
        fetchCounterParties();
      } catch (err: any) {
        setError(
          err.response?.data?.detail || "Failed to delete counter party.",
        );
      }
    }
  };

  const getCreditStatusColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "green";
      case "pending":
        return "orange";
      case "rejected":
        return "red";
      default:
        return "grey";
    }
  };

  return (
    <PageSection>
      <Title headingLevel="h1" size="2xl" style={{ marginBottom: "1rem" }}>
        Counter Parties
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
              Add Counter Party
            </Button>
          </ToolbarItem>
          <ToolbarItem>
            <ExportButton
              onExport={exportCounterParties}
              filename="counterparties.xlsx"
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
        <Table aria-label="Counter Parties table">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Type</Th>
              <Th>Contact Info</Th>
              <Th>Credit Status</Th>
              <Th>Active</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {counterParties.map((cp) => (
              <Tr key={cp.id}>
                <Td dataLabel="Name">{cp.name}</Td>
                <Td dataLabel="Type">{cp.type || "-"}</Td>
                <Td dataLabel="Contact Info">{cp.contact_info || "-"}</Td>
                <Td dataLabel="Credit Status">
                  {cp.credit_status ? (
                    <Label color={getCreditStatusColor(cp.credit_status)}>
                      {cp.credit_status}
                    </Label>
                  ) : (
                    "-"
                  )}
                </Td>
                <Td dataLabel="Active">{cp.is_active ? "Yes" : "No"}</Td>
                <Td dataLabel="Actions">
                  <Split hasGutter>
                    <SplitItem>
                      <Button
                        variant="plain"
                        icon={<PencilAltIcon />}
                        onClick={() => handleOpenDialog(cp)}
                      />
                    </SplitItem>
                    <SplitItem>
                      <Button
                        variant="plain"
                        icon={<TrashIcon />}
                        onClick={() => handleDelete(cp.id)}
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
          title={editMode ? "Edit Counter Party" : "Add Counter Party"}
        />
        <ModalBody>
          <Form>
            <FormGroup label="Name" isRequired fieldId="cp-name">
              <TextInput
                id="cp-name"
                value={currentCounterParty.name}
                onChange={(_event, value) =>
                  setCurrentCounterParty({
                    ...currentCounterParty,
                    name: value,
                  })
                }
                isRequired
              />
            </FormGroup>
            <FormGroup label="Type" fieldId="cp-type">
              <TextInput
                id="cp-type"
                value={currentCounterParty.type}
                onChange={(_event, value) =>
                  setCurrentCounterParty({
                    ...currentCounterParty,
                    type: value,
                  })
                }
                placeholder="e.g., supplier, customer, broker"
              />
            </FormGroup>
            <FormGroup label="Contact Info" fieldId="cp-contact">
              <TextArea
                id="cp-contact"
                value={currentCounterParty.contact_info}
                onChange={(_event, value) =>
                  setCurrentCounterParty({
                    ...currentCounterParty,
                    contact_info: value,
                  })
                }
              />
            </FormGroup>
            <FormGroup label="Credit Status" fieldId="cp-credit">
              <FormSelect
                id="cp-credit"
                value={currentCounterParty.credit_status}
                onChange={(_event, value) =>
                  setCurrentCounterParty({
                    ...currentCounterParty,
                    credit_status: value,
                  })
                }
              >
                <FormSelectOption value="" label="Select Credit Status" />
                <FormSelectOption value="approved" label="Approved" />
                <FormSelectOption value="pending" label="Pending" />
                <FormSelectOption value="rejected" label="Rejected" />
              </FormSelect>
            </FormGroup>
            <FormGroup fieldId="cp-active">
              <Checkbox
                id="cp-active"
                label="Active"
                isChecked={currentCounterParty.is_active}
                onChange={(_event, checked) =>
                  setCurrentCounterParty({
                    ...currentCounterParty,
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
        onImport={importCounterParties}
        entityName="Counter Parties"
        entityKey="counterparties"
        onSuccess={fetchCounterParties}
      />
    </PageSection>
  );
};

export default CounterParties;
