import React, { useState } from "react";
import { Button, Spinner } from "@patternfly/react-core";
import { DownloadIcon } from "@patternfly/react-icons";
import { ExportButtonProps } from "../types";

const ExportButton: React.FC<ExportButtonProps> = ({
  onExport,
  filename,
  disabled = false,
}) => {
  const [loading, setLoading] = useState<boolean>(false);

  const handleExport = async () => {
    try {
      setLoading(true);
      const response = await onExport();

      const downloadFilename = filename;

      const blob =
        response.data instanceof Blob
          ? response.data
          : new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = downloadFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="secondary"
      onClick={handleExport}
      isDisabled={disabled || loading}
      icon={loading ? <Spinner size="sm" /> : <DownloadIcon />}
    >
      {loading ? "Exporting..." : "Export"}
    </Button>
  );
};

export default ExportButton;
