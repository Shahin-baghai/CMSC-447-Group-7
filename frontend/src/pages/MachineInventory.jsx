import { useEffect, useState } from "react";

function MachineInventory({ authToken, currentUser }) {
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState(null);
  const [restockAmounts, setRestockAmounts] = useState({});
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("All");

  const fetchData = () => {
    fetch("http://localhost:3001/inventory", {
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
          initialAmounts[item.slotId] = restockAmounts[item.slotId] ?? "";
        });
        setRestockAmounts(initialAmounts);
      })
      .catch((err) => {
        console.error(err);
        setItems([]);
        setSummary(null);
        setMessage(`Could not load inventory: ${err.message}`);
      });

    fetch("http://localhost:3001/inventory/summary", {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || `Summary request failed (${res.status})`);
        }
        return data;
      })
      .then((data) => setSummary(data))
      .catch((err) => {
        console.error(err);
        setSummary(null);
      });
  };

  useEffect(() => {
    fetchData();
  }, [authToken]);

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

  const handleAmountChange = (slotId, value) => {
    setRestockAmounts((prev) => ({
      ...prev,
      [slotId]: value
    }));
  };

  const handleRestock = (slotId) => {
    const rawValue = restockAmounts[slotId];
    const quantityAdded = Number(rawValue);

    if (rawValue === "" || Number.isNaN(quantityAdded) || quantityAdded <= 0) {
      setMessage("Please enter a valid restock amount greater than 0.");
      return;
    }

    fetch("http://localhost:3001/machine/restock", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        slotId,
        quantityAdded
      })
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || `Restock request failed (${res.status})`);
        }
        return data;
      })
      .then((data) => {
        setMessage(data.message || `Successfully restocked ${slotId} by ${quantityAdded}.`);
        setRestockAmounts((prev) => ({
          ...prev,
          [slotId]: ""
        }));
        fetchData();
      })
      .catch((err) => {
        console.error(err);
        setMessage(`Error: ${err.message}`);
      });
  };

  const handleAdjust = (slotId, direction) => {
    const rawValue = restockAmounts[slotId];
    const amount = Number(rawValue);

    if (rawValue === "" || Number.isNaN(amount) || amount <= 0) {
      setMessage("Please enter a valid stock adjustment greater than 0.");
      return;
    }

    fetch("http://localhost:3001/machine/adjust", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        slotId,
        quantityChange: direction === "add" ? amount : -amount
      })
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || `Adjust request failed (${res.status})`);
        }
        return data;
      })
      .then((data) => {
        setMessage(data.message || `Successfully adjusted ${slotId}.`);
        setRestockAmounts((prev) => ({
          ...prev,
          [slotId]: ""
        }));
        fetchData();
      })
      .catch((err) => {
        console.error(err);
        setMessage(`Error: ${err.message}`);
      });
  };

  const filteredItems = (Array.isArray(items) ? items : []).filter((item) => {
    if (filter === "All") return true;
    return item.status === filter;
  });

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
        UMBC Vending Machine Inventory Dashboard
      </h1>
      <p style={{ marginTop: 0, color: "#666" }}>
        Signed in as <strong>{currentUser?.username}</strong> ({currentUser?.role}).
      </p>

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
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "1rem"
        }}
      >
        {filteredItems.map((item) => (
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
              <span
                style={{
                  ...getStatusStyles(item.status),
                  fontWeight: "bold",
                  padding: "0.3rem 0.7rem",
                  borderRadius: "999px",
                  display: "inline-block"
                }}
              >
                {item.status}
              </span>
            </p>

            <div style={{ marginTop: "1rem" }}>
              <input
                type="number"
                min="1"
                value={restockAmounts[item.slotId] ?? ""}
                onChange={(e) => handleAmountChange(item.slotId, e.target.value)}
                style={{
                  width: "80px",
                  padding: "0.4rem",
                  marginRight: "0.5rem",
                  borderRadius: "6px",
                  border: "1px solid #ccc"
                }}
              />

              <button
                onClick={() => handleAdjust(item.slotId, "add")}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: "#28a745",
                  color: "white",
                  cursor: "pointer"
                }}
              >
                Add
              </button>

              <button
                onClick={() => handleAdjust(item.slotId, "remove")}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: "#dc3545",
                  color: "white",
                  cursor: "pointer",
                  marginLeft: "0.5rem"
                }}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MachineInventory;
