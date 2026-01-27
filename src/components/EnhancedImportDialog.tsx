import React, { useState } from "react";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  Button,
  Alert,
  Spinner,
  Content,
  ExpandableSection,
  HelperText,
  HelperTextItem,
  Stack,
  StackItem,
} from "@patternfly/react-core";
import { Table, Thead, Tr, Th, Tbody, Td } from "@patternfly/react-table";
import { UploadIcon, DownloadIcon } from "@patternfly/react-icons";
import { downloadTemplate } from "../api";
import { EnhancedImportDialogProps, ImportResult } from "../types";

const EnhancedImportDialog: React.FC<EnhancedImportDialogProps> = ({
  open,
  onClose,
  onImport,
  entityName,
  entityKey,
  onSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [downloadingTemplate, setDownloadingTemplate] =
    useState<boolean>(false);
  const [errorsExpanded, setErrorsExpanded] = useState<boolean>(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validTypes = [
        "text/csv",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];
      if (
        !validTypes.includes(file.type) &&
        !file.name.match(/\.(csv|xlsx|xls)$/)
      ) {
        alert("Invalid file type. Please upload a CSV or Excel file.");
        return;
      }
      setSelectedFile(file);
      setResult(null);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      setDownloadingTemplate(true);
      const response = await downloadTemplate(entityKey);

      const filename = `${entityKey}_import_template.csv`;

      const blob =
        response.data instanceof Blob
          ? response.data
          : new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download template:", error);
      alert("Failed to download template. Please try again.");
    } finally {
      setDownloadingTemplate(false);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      alert("Please select a file to import.");
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await onImport(formData);
      setResult(response.data);

      if (response.data.successful > 0 && response.data.failed === 0) {
        setTimeout(() => {
          handleClose();
          if (onSuccess) onSuccess();
        }, 3000);
      }
    } catch (error: any) {
      console.error("Import failed:", error);
      const errorData = error.response?.data?.detail || error.response?.data;

      if (typeof errorData === "object" && errorData.errors) {
        setResult(errorData);
      } else {
        setResult({
          message:
            typeof errorData === "string"
              ? errorData
              : "Import failed. Please check your file and try again.",
          summary: { successful: 0, failed: 1, total: 1 },
          errors: [],
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setResult(null);
    setErrorsExpanded(false);
    onClose();
  };

  const getAlertVariant = () => {
    if (result?.summary?.failed === 0 || result?.failed?.length === 0) {
      return "success";
    }
    if (result?.summary?.successful === 0 || result?.successful?.length === 0) {
      return "danger";
    }
    return "warning";
  };

  return (
    <Modal variant={ModalVariant.medium} isOpen={open} onClose={handleClose}>
      <ModalHeader title={`Import ${entityName}`} />
      <ModalBody>
        <Stack hasGutter>
          <StackItem>
            <Content>
              <p>
                Download the template, fill in your data, and upload the
                completed file.
              </p>
            </Content>
            <Button
              variant="secondary"
              icon={
                downloadingTemplate ? <Spinner size="sm" /> : <DownloadIcon />
              }
              onClick={handleDownloadTemplate}
              isDisabled={downloadingTemplate}
              style={{ marginTop: "0.5rem" }}
            >
              {downloadingTemplate ? "Downloading..." : "Download Template"}
            </Button>
          </StackItem>

          <StackItem>
            <div
              style={{
                border: "2px dashed #ccc",
                borderRadius: "4px",
                padding: "1.5rem",
                textAlign: "center",
                backgroundColor: "#f9f9f9",
              }}
            >
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                style={{ display: "none" }}
                id="import-file-input"
              />
              <label htmlFor="import-file-input">
                <Button
                  variant="primary"
                  component="span"
                  icon={<UploadIcon />}
                >
                  Select File
                </Button>
              </label>
              {selectedFile && (
                <Content style={{ marginTop: "1rem" }}>
                  <p>
                    Selected: <strong>{selectedFile.name}</strong>
                  </p>
                </Content>
              )}
            </div>
          </StackItem>

          {loading && (
            <StackItem>
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <Spinner size="md" />
                <span>Processing import...</span>
              </div>
            </StackItem>
          )}

          {result && (
            <StackItem>
              <Alert
                variant={getAlertVariant()}
                title={result.message || "Import completed"}
              >
                <Content>
                  <p>
                    {(result.summary?.successful ||
                      result.successful?.length ||
                      0) > 0 &&
                      `✓ ${result.summary?.successful || result.successful?.length} records imported successfully. `}
                    {(result.summary?.failed || result.failed?.length || 0) >
                      0 &&
                      `✗ ${result.summary?.failed || result.failed?.length} records failed.`}
                  </p>
                </Content>
              </Alert>

              {result.errors && result.errors.length > 0 && (
                <ExpandableSection
                  toggleText={`View ${result.errors.length} Error(s)`}
                  onToggle={(_event, isExpanded) =>
                    setErrorsExpanded(isExpanded)
                  }
                  isExpanded={errorsExpanded}
                  style={{ marginTop: "1rem" }}
                >
                  <Table aria-label="Import errors" variant="compact">
                    <Thead>
                      <Tr>
                        <Th>Row</Th>
                        <Th>Field</Th>
                        <Th>Error</Th>
                        <Th>Value</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {result.errors.map((error, idx) => (
                        <Tr key={idx}>
                          <Td dataLabel="Row">{error.row || "-"}</Td>
                          <Td dataLabel="Field">{error.field}</Td>
                          <Td dataLabel="Error">{error.message}</Td>
                          <Td dataLabel="Value">{error.value || "-"}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </ExpandableSection>
              )}
            </StackItem>
          )}

          <StackItem>
            <HelperText>
              <HelperTextItem>
                💡 <strong>Tips:</strong> Use the template to ensure correct
                column format. Required fields must have values. Supported
                formats: CSV, Excel (.xlsx, .xls)
              </HelperTextItem>
            </HelperText>
          </StackItem>
        </Stack>
      </ModalBody>
      <ModalFooter>
        <Button
          key="import"
          variant="primary"
          onClick={handleImport}
          isDisabled={!selectedFile || loading}
          isLoading={loading}
        >
          {loading ? "Importing..." : "Import"}
        </Button>
        <Button
          key="cancel"
          variant="link"
          onClick={handleClose}
          isDisabled={loading}
        >
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default EnhancedImportDialog;
