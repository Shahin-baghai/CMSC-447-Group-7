import { useEffect, useState } from "react";

function Reports({ authToken }) {
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchReport = () => {
    setIsLoading(true);
    setError("");

    fetch("http://localhost:3001/purchases/report", {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || `Report request failed (${res.status})`);
        }
        return data;
      })
      .then((data) => {
        setReport(data);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const summary = report?.summary || {
    totalPurchases: 0,
    totalRevenue: 0,
    purchasesToday: 0,
    revenueToday: 0
  };

  const formatCurrency = (value) =>
    Number(value || 0).toLocaleString("en-US", {
      style: "currency",
      currency: "USD"
    });

  const formatDate = (value) => {
    if (!value) return "N/A";
    return new Date(value).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  return (
    <div
      style={{
        padding: "2rem",
        minHeight: "100vh",
        backgroundColor: "#f4f4f4"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
          flexWrap: "wrap",
          marginBottom: "1.5rem"
        }}
      >
        <div>
          <h1 style={{ marginBottom: "0.35rem" }}>Reports Dashboard</h1>
          <p style={{ margin: 0, color: "#666" }}>
            Track sales activity, top products, and inventory issues in one place.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchReport}
          style={{
            padding: "0.75rem 1rem",
            borderRadius: "10px",
            border: "none",
            backgroundColor: "#0c0c0c",
            color: "#fff",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          Refresh Report
        </button>
      </div>

      {error && (
        <div
          style={{
            marginBottom: "1.5rem",
            padding: "0.85rem 1rem",
            borderRadius: "10px",
            backgroundColor: "#f8d7da",
            color: "#721c24"
          }}
        >
          Could not load reports: {error}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1rem",
          marginBottom: "1.75rem"
        }}
      >
        <ReportCard title="Total Purchases" value={summary.totalPurchases} accent="#007bff" />
        <ReportCard title="Total Revenue" value={formatCurrency(summary.totalRevenue)} accent="#28a745" />
        <ReportCard title="Purchases Today" value={summary.purchasesToday} accent="#fdb414" />
        <ReportCard title="Revenue Today" value={formatCurrency(summary.revenueToday)} accent="#da2128" />
      </div>

      {isLoading ? (
        <div style={{ padding: "2rem", backgroundColor: "#fff", borderRadius: "14px" }}>
          Loading reports...
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "1rem"
          }}
        >
          <Panel title="Top Products">
            {report?.topProducts?.length ? (
              report.topProducts.map((product) => (
                <Row
                  key={product.productName}
                  label={`${product.productName} (${product.purchaseCount} sold)`}
                  value={formatCurrency(product.revenue)}
                />
              ))
            ) : (
              <EmptyState text="No purchase data yet." />
            )}
          </Panel>

          <Panel title="Inventory Alerts">
            {report?.inventoryAlerts?.length ? (
              report.inventoryAlerts.map((item) => (
                <div
                  key={item.slotId}
                  style={{
                    padding: "0.85rem 0",
                    borderBottom: "1px solid #eee"
                  }}
                >
                  <div style={{ fontWeight: "bold" }}>
                    {item.productName} ({item.slotId})
                  </div>
                  <div style={{ color: "#666", marginTop: "0.25rem" }}>
                    Machine: {item.quantity}/{item.capacity} | Backstock: {item.backstock ?? 0}
                  </div>
                </div>
              ))
            ) : (
              <EmptyState text="No low-stock or out-of-stock items right now." />
            )}
          </Panel>

          <Panel title="Recent Purchases">
            {report?.recentPurchases?.length ? (
              report.recentPurchases.map((purchase) => (
                <div
                  key={purchase.purchaseId}
                  style={{
                    padding: "0.85rem 0",
                    borderBottom: "1px solid #eee"
                  }}
                >
                  <div style={{ fontWeight: "bold" }}>{purchase.productName}</div>
                  <div style={{ color: "#666", marginTop: "0.25rem" }}>
                    {formatDate(purchase.date)} at {purchase.time} | {formatCurrency(purchase.price)}
                  </div>
                </div>
              ))
            ) : (
              <EmptyState text="No recent purchases recorded." />
            )}
          </Panel>

          <Panel title="Daily Sales">
            {report?.dailySales?.length ? (
              report.dailySales.map((day) => (
                <Row
                  key={String(day.date)}
                  label={`${formatDate(day.date)} (${day.purchaseCount} purchases)`}
                  value={formatCurrency(day.revenue)}
                />
              ))
            ) : (
              <EmptyState text="No daily sales data available." />
            )}
          </Panel>

          <Panel title="Employee Restock Log">
            {report?.employeeRestocks?.length ? (
              report.employeeRestocks.map((entry, index) => (
                <div
                  key={`${entry.timestamp}-${entry.userId || index}`}
                  style={{
                    padding: "0.85rem 0",
                    borderBottom: "1px solid #eee"
                  }}
                >
                  <div style={{ fontWeight: "bold" }}>
                    {entry.username} restocked slot {entry.slotId}
                  </div>
                  <div style={{ color: "#666", marginTop: "0.25rem" }}>
                    Quantity added: {entry.quantityAdded} | Product ID: {entry.productId}
                  </div>
                  <div style={{ color: "#666", marginTop: "0.25rem" }}>
                    {new Date(entry.timestamp).toLocaleString("en-US")}
                  </div>
                </div>
              ))
            ) : (
              <EmptyState text="No employee restocks logged yet." />
            )}
          </Panel>
        </div>
      )}
    </div>
  );
}

function ReportCard({ title, value, accent }) {
  return (
    <div
      style={{
        backgroundColor: "#fff",
        padding: "1rem",
        borderRadius: "14px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        borderTop: `4px solid ${accent}`
      }}
    >
      <div style={{ color: "#666", marginBottom: "0.5rem" }}>{title}</div>
      <div style={{ fontSize: "1.8rem", fontWeight: "bold" }}>{value}</div>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <section
      style={{
        backgroundColor: "#fff",
        padding: "1.2rem",
        borderRadius: "14px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)"
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: "0.75rem" }}>{title}</h2>
      {children}
    </section>
  );
}

function Row({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: "1rem",
        padding: "0.85rem 0",
        borderBottom: "1px solid #eee"
      }}
    >
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function EmptyState({ text }) {
  return <div style={{ color: "#666", padding: "0.5rem 0" }}>{text}</div>;
}

export default Reports;
