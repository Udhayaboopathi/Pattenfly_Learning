import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  PageSection,
  Title,
  Button,
  Form,
  FormGroup,
  TextInput,
  TextArea,
  FormSelect,
  FormSelectOption,
  Checkbox,
  Card,
  CardTitle,
  CardBody,
  Alert,
  Spinner,
  Split,
  SplitItem,
  Grid,
  GridItem,
  Content,
  FormHelperText,
  HelperText,
  HelperTextItem,
} from "@patternfly/react-core";
import { Table, Thead, Tr, Th, Tbody, Td } from "@patternfly/react-table";
import {
  PlusCircleIcon,
  TrashIcon,
  ArrowLeftIcon,
} from "@patternfly/react-icons";
import { createBlend, createBlendComponent, getCommodities } from "../api";
import { Commodity } from "../types";

interface BlendComponentInput {
  component_commodity_id: string;
  percentage: string;
}

const CreateBlend: React.FC = () => {
  const navigate = useNavigate();
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const [blendData, setBlendData] = useState({
    name: "",
    commodity_id: "",
    description: "",
    is_active: true,
  });

  const [components, setComponents] = useState<BlendComponentInput[]>([
    { component_commodity_id: "", percentage: "" },
  ]);

  const [formErrors, setFormErrors] = useState<{
    name?: string;
    commodity_id?: string;
    components?: string;
    percentage?: string;
  }>({});

  useEffect(() => {
    fetchCommodities();
  }, []);

  const fetchCommodities = async () => {
    try {
      setLoading(true);
      const response = await getCommodities();
      setCommodities(response.data);
    } catch (err) {
      setError("Failed to fetch commodities.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: typeof formErrors = {};

    if (!blendData.name.trim()) {
      errors.name = "Name is required";
    }

    if (!blendData.commodity_id) {
      errors.commodity_id = "Commodity is required";
    }

    const validComponents = components.filter(
      (c) => c.component_commodity_id && c.percentage,
    );

    if (validComponents.length === 0) {
      errors.components = "At least one component is required";
    }

    const totalPercentage = validComponents.reduce(
      (sum, c) => sum + parseFloat(c.percentage || "0"),
      0,
    );

    if (totalPercentage !== 100) {
      errors.percentage = `Total percentage must equal 100% (currently ${totalPercentage}%)`;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const addComponent = () => {
    setComponents([
      ...components,
      { component_commodity_id: "", percentage: "" },
    ]);
  };

  const removeComponent = (index: number) => {
    if (components.length > 1) {
      setComponents(components.filter((_, i) => i !== index));
    }
  };

  const updateComponent = (
    index: number,
    field: keyof BlendComponentInput,
    value: string,
  ) => {
    const updated = [...components];
    updated[index][field] = value;
    setComponents(updated);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Create the blend
      const blendPayload = {
        name: blendData.name,
        commodity_id: parseInt(blendData.commodity_id),
        description: blendData.description || undefined,
        is_active: blendData.is_active,
      };

      const blendResponse = await createBlend(blendPayload);
      const blendId = blendResponse.data.id;

      // Create blend components
      const validComponents = components.filter(
        (c) => c.component_commodity_id && c.percentage,
      );

      for (const component of validComponents) {
        await createBlendComponent({
          blend_id: blendId,
          component_commodity_id: parseInt(component.component_commodity_id),
          percentage: parseFloat(component.percentage),
          is_active: true,
        });
      }

      setSuccess(true);
      setTimeout(() => {
        navigate("/blends");
      }, 2000);
    } catch (err: any) {
      console.error("Failed to create blend:", err);
      setError(err.response?.data?.detail || "Failed to create blend.");
    } finally {
      setSaving(false);
    }
  };

  const getTotalPercentage = () => {
    return components.reduce(
      (sum, c) => sum + parseFloat(c.percentage || "0"),
      0,
    );
  };

  if (loading) {
    return (
      <PageSection>
        <div
          style={{ display: "flex", justifyContent: "center", padding: "2rem" }}
        >
          <Spinner size="xl" />
        </div>
      </PageSection>
    );
  }

  return (
    <PageSection>
      <Split hasGutter style={{ marginBottom: "1rem" }}>
        <SplitItem>
          <Button
            variant="link"
            icon={<ArrowLeftIcon />}
            onClick={() => navigate("/blends")}
          >
            Back to Blends
          </Button>
        </SplitItem>
      </Split>

      <Title headingLevel="h1" size="2xl" style={{ marginBottom: "1.5rem" }}>
        Create New Blend
      </Title>

      {error && (
        <Alert
          variant="danger"
          title={error}
          actionClose={
            <Button variant="plain" onClick={() => setError(null)}>
              ×
            </Button>
          }
          style={{ marginBottom: "1rem" }}
        />
      )}

      {success && (
        <Alert
          variant="success"
          title="Blend created successfully! Redirecting..."
          style={{ marginBottom: "1rem" }}
        />
      )}

      <Grid hasGutter>
        <GridItem span={6}>
          <Card>
            <CardTitle>Blend Information</CardTitle>
            <CardBody>
              <Form>
                <FormGroup label="Name" isRequired fieldId="blend-name">
                  <TextInput
                    id="blend-name"
                    value={blendData.name}
                    onChange={(_event, value) =>
                      setBlendData({ ...blendData, name: value })
                    }
                    validated={formErrors.name ? "error" : "default"}
                    isRequired
                  />
                  {formErrors.name && (
                    <FormHelperText>
                      <HelperText>
                        <HelperTextItem variant="error">
                          {formErrors.name}
                        </HelperTextItem>
                      </HelperText>
                    </FormHelperText>
                  )}
                </FormGroup>

                <FormGroup
                  label="Commodity"
                  isRequired
                  fieldId="blend-commodity"
                >
                  <FormSelect
                    id="blend-commodity"
                    value={blendData.commodity_id}
                    onChange={(_event, value) =>
                      setBlendData({ ...blendData, commodity_id: value })
                    }
                    validated={formErrors.commodity_id ? "error" : "default"}
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
                  {formErrors.commodity_id && (
                    <FormHelperText>
                      <HelperText>
                        <HelperTextItem variant="error">
                          {formErrors.commodity_id}
                        </HelperTextItem>
                      </HelperText>
                    </FormHelperText>
                  )}
                </FormGroup>

                <FormGroup label="Description" fieldId="blend-description">
                  <TextArea
                    id="blend-description"
                    value={blendData.description}
                    onChange={(_event, value) =>
                      setBlendData({ ...blendData, description: value })
                    }
                  />
                </FormGroup>

                <FormGroup fieldId="blend-active">
                  <Checkbox
                    id="blend-active"
                    label="Active"
                    isChecked={blendData.is_active}
                    onChange={(_event, checked) =>
                      setBlendData({ ...blendData, is_active: checked })
                    }
                  />
                </FormGroup>
              </Form>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem span={6}>
          <Card>
            <CardTitle>
              <Split>
                <SplitItem isFilled>Blend Components</SplitItem>
                <SplitItem>
                  <Button
                    variant="link"
                    icon={<PlusCircleIcon />}
                    onClick={addComponent}
                  >
                    Add Component
                  </Button>
                </SplitItem>
              </Split>
            </CardTitle>
            <CardBody>
              {formErrors.components && (
                <Alert
                  variant="danger"
                  title={formErrors.components}
                  isInline
                  style={{ marginBottom: "1rem" }}
                />
              )}
              {formErrors.percentage && (
                <Alert
                  variant="warning"
                  title={formErrors.percentage}
                  isInline
                  style={{ marginBottom: "1rem" }}
                />
              )}

              <Table aria-label="Blend components" variant="compact">
                <Thead>
                  <Tr>
                    <Th>Commodity</Th>
                    <Th>Percentage</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {components.map((component, index) => (
                    <Tr key={index}>
                      <Td dataLabel="Commodity">
                        <FormSelect
                          value={component.component_commodity_id}
                          onChange={(_event, value) =>
                            updateComponent(
                              index,
                              "component_commodity_id",
                              value,
                            )
                          }
                          aria-label={`Component ${index + 1} commodity`}
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
                      </Td>
                      <Td dataLabel="Percentage">
                        <TextInput
                          type="number"
                          value={component.percentage}
                          onChange={(_event, value) =>
                            updateComponent(index, "percentage", value)
                          }
                          aria-label={`Component ${index + 1} percentage`}
                          min={0}
                          max={100}
                        />
                      </Td>
                      <Td dataLabel="Actions">
                        <Button
                          variant="plain"
                          icon={<TrashIcon />}
                          onClick={() => removeComponent(index)}
                          isDisabled={components.length === 1}
                          isDanger
                        />
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>

              <Content style={{ marginTop: "1rem" }}>
                <p>
                  <strong>Total Percentage:</strong>{" "}
                  <span
                    style={{
                      color: getTotalPercentage() === 100 ? "green" : "red",
                      fontWeight: "bold",
                    }}
                  >
                    {getTotalPercentage()}%
                  </span>
                </p>
              </Content>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem span={12}>
          <Split hasGutter>
            <SplitItem>
              <Button
                variant="primary"
                onClick={handleSubmit}
                isDisabled={saving}
                isLoading={saving}
              >
                {saving ? "Creating..." : "Create Blend"}
              </Button>
            </SplitItem>
            <SplitItem>
              <Button variant="secondary" onClick={() => navigate("/blends")}>
                Cancel
              </Button>
            </SplitItem>
          </Split>
        </GridItem>
      </Grid>
    </PageSection>
  );
};

export default CreateBlend;
