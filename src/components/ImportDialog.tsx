import React, { useState } from "react";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  Button,
  Alert,
  Content,
  ExpandableSection,
  Label,
  Stack,
  StackItem,
} from "@patternfly/react-core";
import { Table, Thead, Tr, Th, Tbody, Td } from "@patternfly/react-table";
import {
  UploadIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@patternfly/react-icons";
import { ImportDialogProps, ImportResult } from "../types";

const ImportDialog: React.FC<ImportDialogProps> = ({
  open,
  onClose,
  onImport,
  title,
  templateColumns = [],
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState<boolean>(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [failedExpanded, setFailedExpanded] = useState<boolean>(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      const fileType = selectedFile.name.split(".").pop()?.toLowerCase();
      if (!fileType || !["xlsx", "xls", "csv"].includes(fileType)) {
        setError("Please select a valid Excel (.xlsx, .xls) or CSV file");
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError(null);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setImporting(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await onImport(formData);
      setResult(response.data);

      if (
        response.data.successful &&
        response.data.successful.length > 0 &&
        (!response.data.failed || response.data.failed.length === 0)
      ) {
        setTimeout(() => {
          handleClose();
        }, 3000);
      }
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.detail?.message ||
        err.response?.data?.detail ||
        "Import failed";
      setError(errorMsg);

      if (err.response?.data?.detail?.failed) {
        setResult({ failed: err.response.data.detail.failed, successful: [] });
      }
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setImporting(false);
    setResult(null);
    setError(null);
    setFailedExpanded(false);
    onClose();
  };

  const downloadTemplate = () => {
    const csvContent =
      templateColumns.join(",") +
      "\n" +
      templateColumns.map(() => "").join(",");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, "_")}_template.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Modal variant={ModalVariant.medium} isOpen={open} onClose={handleClose}>
      <ModalHeader title={title} />
      <ModalBody>
        <Stack hasGutter>
          <StackItem>
            <Alert variant="info" title="Required Columns" isInline>
              <Content>
                <p>{templateColumns.join(", ")}</p>
              </Content>
              <Button
                variant="link"
                onClick={downloadTemplate}
                style={{ marginTop: "0.5rem", padding: 0 }}
              >
                Download Template
              </Button>
            </Alert>
          </StackItem>

          <StackItem>
            <input
              accept=".xlsx,.xls,.csv"
              style={{ display: "none" }}
              id="import-file-input"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="import-file-input">
              <Button variant="primary" component="span" icon={<UploadIcon />}>
                Choose File
              </Button>
            </label>
            {file && (
              <Content style={{ marginTop: "0.5rem" }}>
                <p>
                  Selected: <strong>{file.name}</strong> (
                  {(file.size / 1024).toFixed(2)} KB)
                </p>
              </Content>
            )}
          </StackItem>

          {error && (
            <StackItem>
              <Alert
                variant="danger"
                title={error}
                actionClose={
                  <Button variant="plain" onClick={() => setError(null)}>
                    ×
                  </Button>
                }
              />
            </StackItem>
          )}

          {result && (
            <StackItem>
              {result.successful && result.successful.length > 0 && (
                <Alert
                  variant="success"
                  title={`Successfully imported ${result.successful.length} records`}
                  customIcon={<CheckCircleIcon />}
                />
              )}

              {result.failed && result.failed.length > 0 && (
                <div style={{ marginTop: "1rem" }}>
                  <ExpandableSection
                    toggleText={`${result.failed.length} Failed Records`}
                    onToggle={(_event, isExpanded) =>
                      setFailedExpanded(isExpanded)
                    }
                    isExpanded={failedExpanded}
                  >
                    <Table aria-label="Failed records" variant="compact">
                      <Thead>
                        <Tr>
                          <Th>Row</Th>
                          <Th>Data</Th>
                          <Th>Error</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {result.failed.map((item, idx) => (
                          <Tr key={idx}>
                            <Td dataLabel="Row">{item.row}</Td>
                            <Td dataLabel="Data">
                              {item.data && typeof item.data === "object"
                                ? Object.entries(item.data)
                                    .map(([k, v]) => `${k}: ${v}`)
                                    .join(", ")
                                : String(item.data || "-")}
                            </Td>
                            <Td dataLabel="Error">
                              <Label
                                color="red"
                                icon={<ExclamationCircleIcon />}
                              >
                                {item.error}
                              </Label>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </ExpandableSection>
                </div>
              )}
            </StackItem>
          )}
        </Stack>
      </ModalBody>
      <ModalFooter>
        <Button
          key="import"
          variant="primary"
          onClick={handleImport}
          isDisabled={!file || importing}
          isLoading={importing}
        >
          {importing ? "Importing..." : "Import"}
        </Button>
        <Button
          key="cancel"
          variant="link"
          onClick={handleClose}
          isDisabled={importing}
        >
          {result && result.successful && result.successful.length > 0
            ? "Close"
            : "Cancel"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ImportDialog;
