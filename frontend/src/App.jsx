import { useEffect, useState } from "react";

function App() {
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3001/inventory")
      .then((res) => res.json())
      .then((data) => {
        setItems(data.items);
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    fetch("http://localhost:3001/inventory/summary")
      .then((res) => res.json())
      .then((data) => setSummary(data))
      .catch((err) => console.error(err));
  }, []);

  const getStatusColor = (status) => {
    if (status === "In Stock") return "green";
    if (status === "Low Stock") return "orange";
    if (status === "Out of Stock") return "red";
    return "black";
  };

  return (
    <div
      style={{
        padding: "2rem",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f4f4f4",
        minHeight: "100vh"
      }}
    >
      <h1 style={{ marginBottom: "2rem" }}>UMBC Vending Machine Inventory Dashboard</h1>

      {summary && (
        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginBottom: "2rem",
            flexWrap: "wrap"
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "1rem",
              borderRadius: "10px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              minWidth: "180px"
            }}
          >
            <h3>Total Items</h3>
            <p>{summary.totalItems}</p>
          </div>

          <div
            style={{
              backgroundColor: "white",
              padding: "1rem",
              borderRadius: "10px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              minWidth: "180px"
            }}
          >
            <h3>Low Stock</h3>
            <p>{summary.lowStockItems}</p>
          </div>

          <div
            style={{
              backgroundColor: "white",
              padding: "1rem",
              borderRadius: "10px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              minWidth: "180px"
            }}
          >
            <h3>Out of Stock</h3>
            <p>{summary.outOfStockItems}</p>
          </div>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "1rem"
        }}
      >
        {items.map((item) => (
          <div
            key={item.slotId}
            style={{
              backgroundColor: "white",
              padding: "1rem",
              borderRadius: "10px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
            }}
          >
            <h3 style={{ marginBottom: "0.5rem" }}>
              {item.productName} ({item.slotId})
            </h3>
            <p><strong>Price:</strong> ${item.price}</p>
            <p><strong>Quantity:</strong> {item.quantity}</p>
            <p><strong>Capacity:</strong> {item.capacity}</p>
            <p><strong>Backstock:</strong> {item.backstock}</p>
            <p>
              <strong>Status:</strong>{" "}
              <span style={{ color: getStatusColor(item.status), fontWeight: "bold" }}>
                {item.status}
              </span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;