import React, { useEffect } from "react";
import { useResources } from "@refinedev/core";

export const DebugResources: React.FC = () => {
  const resources = useResources();

  useEffect(() => {
    console.log("Available resources:", resources);
    console.log("Resources count:", resources.length);
    resources.forEach((resource, index) => {
      console.log(`Resource ${index}:`, {
        name: resource.name,
        list: resource.list,
        meta: resource.meta,
      });
    });
  }, [resources]);

  return (
    <div style={{ padding: 24 }}>
      <h2>Debug: Available Resources</h2>
      <pre>{JSON.stringify(resources, null, 2)}</pre>
    </div>
  );
};
