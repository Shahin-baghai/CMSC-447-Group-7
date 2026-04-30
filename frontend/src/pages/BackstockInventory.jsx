import { useEffect, useState } from "react";

function BackstockInventory({ authToken }) {
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState("");
  const [restockAmounts, setRestockAmounts] = useState({});
  const [filter, setFilter] = useState("All");

  const fetchData = () => {
    fetch("http://localhost:3001/backstock", {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || `Inventory request failed (${res.status})`);
        }
        return data;
      })
      .then((data) => {
        const safeItems = Array.isArray(data.items) ? data.items : [];
        setItems(safeItems);

        const initialAmounts = {};
        safeItems.forEach((item) => {
          initialAmounts[item.productId] = restockAmounts[item.productId] ?? "";
        });
        setRestockAmounts(initialAmounts);
      })
      .catch((err) => {
        console.error(err);
        setMessage(`Could not load backstock: ${err.message}`);
      });
  };

  useEffect(() => {
    fetchData();
  }, [authToken]);

  const handleAmountChange = (productId, value) => {
    setRestockAmounts((prev) => ({
      ...prev,
      [productId]: value
    }));
  };

  const handleRestock = (productId) => {
    const quantityAdded = Number(restockAmounts[productId]);

    if (!quantityAdded || quantityAdded <= 0) {
      setMessage("Please enter a valid restock amount greater than 0.");
      return;
    }

    fetch("http://localhost:3001/backstock/restock", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        productId,
        quantityAdded
      })
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || `Backstock restock failed (${res.status})`);
        }
        return data;
      })
      .then((data) => {
        setMessage(data.message || `Successfully restocked product ${productId}.`);
        setRestockAmounts((prev) => ({
          ...prev,
          [productId]: ""
        }));
        fetchData();
      })
      .catch((err) => {
        console.error(err);
        setMessage(`Error: ${err.message}`);
      });
  };

  const getBackstockStatus = (backstock) => {
    if (backstock === 0) return "Out of Stock";
    if (backstock <= 5) return "Low Stock";
    return "In Stock";
  };

  const getStatusStyles = (status) => {
    if (status === "In Stock") {
      return {
        color: "#155724",
        backgroundColor: "#d4edda"
      };
    }

    if (status === "Low Stock") {
      return {
        color: "#856404",
        backgroundColor: "#fff3cd"
      };
    }

    if (status === "Out of Stock") {
      return {
        color: "#721c24",
        backgroundColor: "#f8d7da"
      };
    }

    return {
      color: "#333",
      backgroundColor: "#e9ecef"
    };
  };

  const filteredItems = items.filter((item) => {
    const status = getBackstockStatus(item.stock);
    if (filter === "All") return true;
    return status === filter;
  });

  const summary = {
    totalItems: items.length,
    lowStockItems: items.filter((item) => item.stock > 0 && item.stock <= 5).length,
    outOfStockItems: items.filter((item) => item.stock === 0).length
  };

  const getFilterButtonStyle = (buttonFilter) => ({
    padding: "0.5rem 1rem",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    backgroundColor: filter === buttonFilter ? "#007bff" : "#e0e0e0",
    color: filter === buttonFilter ? "white" : "#333"
  });

  return (
    <div
      style={{
        padding: "2rem",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f4f4f4",
        minHeight: "100vh"
      }}
    >
      <h1 style={{ marginBottom: "1rem" }}>
        UMBC Vending Machine Backstock Dashboard
      </h1>

      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        <button onClick={fetchData} style={getFilterButtonStyle("Refresh")}>
          Refresh Data
        </button>

        <button onClick={() => setFilter("All")} style={getFilterButtonStyle("All")}>
          All Items
        </button>

        <button onClick={() => setFilter("Low Stock")} style={getFilterButtonStyle("Low Stock")}>
          Low Stock
        </button>

        <button
          onClick={() => setFilter("Out of Stock")}
          style={getFilterButtonStyle("Out of Stock")}
        >
          Out of Stock
        </button>
      </div>

      {message && (
        <div
          style={{
            marginBottom: "2rem",
            padding: "0.75rem 1rem",
            backgroundColor: "#ffffff",
            borderLeft: "4px solid #007bff",
            borderRadius: "6px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
          }}
        >
          {message}
        </div>
      )}

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
            backgroundColor: "#ffffff",
            padding: "1rem",
            borderRadius: "12px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            minWidth: "180px",
            borderTop: "4px solid #007bff"
          }}
        >
          <h3 style={{ marginBottom: "0.5rem" }}>Total Items</h3>
          <p style={{ fontSize: "1.5rem", fontWeight: "bold", margin: 0 }}>
            {summary.totalItems}
          </p>
        </div>

        <div
          style={{
            backgroundColor: "#fff3cd",
            padding: "1rem",
            borderRadius: "12px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            minWidth: "180px",
            borderTop: "4px solid #ffc107"
          }}
        >
          <h3 style={{ marginBottom: "0.5rem", color: "#856404" }}>Low Stock</h3>
          <p
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              margin: 0,
              color: "#856404"
            }}
          >
            {summary.lowStockItems}
          </p>
        </div>

        <div
          style={{
            backgroundColor: "#f8d7da",
            padding: "1rem",
            borderRadius: "12px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            minWidth: "180px",
            borderTop: "4px solid #dc3545"
          }}
        >
          <h3 style={{ marginBottom: "0.5rem", color: "#721c24" }}>Out of Stock</h3>
          <p
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              margin: 0,
              color: "#721c24"
            }}
          >
            {summary.outOfStockItems}
          </p>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "1rem"
        }}
      >
        {filteredItems.map((item) => {
          const backstockStatus = getBackstockStatus(item.stock);

          return (
            <div
              key={item.productId}
              style={{
                backgroundColor: "white",
                padding: "1rem",
                borderRadius: "10px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
              }}
            >
              <h3 style={{ marginBottom: "0.5rem" }}>
                {item.productName} (#{item.productId})
              </h3>
              <p><strong>Backstock:</strong> {item.stock}</p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  style={{
                    ...getStatusStyles(backstockStatus),
                    fontWeight: "bold",
                    padding: "0.3rem 0.7rem",
                    borderRadius: "999px",
                    display: "inline-block"
                  }}
                >
                  {backstockStatus}
                </span>
              </p>

              <div style={{ marginTop: "1rem" }}>
                <input
                  type="number"
                  value={restockAmounts[item.productId] ?? ""}
                  onChange={(e) => handleAmountChange(item.productId, e.target.value)}
                  style={{
                    width: "80px",
                    padding: "0.4rem",
                    marginRight: "0.5rem",
                    borderRadius: "6px",
                    border: "1px solid #ccc"
                  }}
                />

                <button
                  onClick={() => handleRestock(item.productId)}
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "6px",
                    border: "none",
                    backgroundColor: "#28a745",
                    color: "white",
                    cursor: "pointer"
                  }}
                >
                  Restock
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default BackstockInventory;
