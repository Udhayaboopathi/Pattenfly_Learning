import React, { useEffect, useState } from "react";
import {
  PageSection,
  Title,
  Card,
  CardTitle,
  CardBody,
  Gallery,
  GalleryItem,
  Spinner,
  Alert,
  Content,
} from "@patternfly/react-core";
import {
  getCommodities,
  getUOMs,
  getBlends,
  getLocations,
  getCounterParties,
  getCapacity,
} from "../api";

interface DashboardStats {
  commodities: number;
  uoms: number;
  blends: number;
  locations: number;
  counterParties: number;
  capacity: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    commodities: 0,
    uoms: 0,
    blends: 0,
    locations: 0,
    counterParties: 0,
    capacity: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [
          commoditiesRes,
          uomsRes,
          blendsRes,
          locationsRes,
          counterPartiesRes,
          capacityRes,
        ] = await Promise.all([
          getCommodities(),
          getUOMs(),
          getBlends(),
          getLocations(),
          getCounterParties(),
          getCapacity(),
        ]);

        setStats({
          commodities: commoditiesRes.data.length,
          uoms: uomsRes.data.length,
          blends: blendsRes.data.length,
          locations: locationsRes.data.length,
          counterParties: counterPartiesRes.data.length,
          capacity: capacityRes.data.length,
        });
        setError(null);
      } catch (err) {
        setError("Failed to load dashboard statistics.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const StatCard: React.FC<{ title: string; value: number; color: string }> = ({
    title,
    value,
    color,
  }) => (
    <Card>
      <CardTitle>{title}</CardTitle>
      <CardBody>
        <Content>
          <p
            style={{ fontSize: "2.5rem", fontWeight: "bold", color, margin: 0 }}
          >
            {value}
          </p>
        </Content>
      </CardBody>
    </Card>
  );

  return (
    <PageSection>
      <Title headingLevel="h1" size="2xl" style={{ marginBottom: "1.5rem" }}>
        Dashboard
      </Title>

      {error && (
        <Alert
          variant="danger"
          title={error}
          style={{ marginBottom: "1rem" }}
        />
      )}

      {loading ? (
        <div
          style={{ display: "flex", justifyContent: "center", padding: "2rem" }}
        >
          <Spinner size="xl" />
        </div>
      ) : (
        <Gallery hasGutter minWidths={{ default: "250px" }}>
          <GalleryItem>
            <StatCard
              title="Commodities"
              value={stats.commodities}
              color="#0066cc"
            />
          </GalleryItem>
          <GalleryItem>
            <StatCard
              title="Units of Measure"
              value={stats.uoms}
              color="#38812f"
            />
          </GalleryItem>
          <GalleryItem>
            <StatCard title="Blends" value={stats.blends} color="#6a1b9a" />
          </GalleryItem>
          <GalleryItem>
            <StatCard
              title="Locations"
              value={stats.locations}
              color="#f0ab00"
            />
          </GalleryItem>
          <GalleryItem>
            <StatCard
              title="Counter Parties"
              value={stats.counterParties}
              color="#c9190b"
            />
          </GalleryItem>
          <GalleryItem>
            <StatCard
              title="Capacity Records"
              value={stats.capacity}
              color="#004368"
            />
          </GalleryItem>
        </Gallery>
      )}
    </PageSection>
  );
};

export default Dashboard;
