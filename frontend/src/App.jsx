import { useEffect, useState } from "react";

function App() {
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState(null);
  const [restockAmounts, setRestockAmounts] = useState({});
  const [message, setMessage] = useState("");

  const fetchData = () => {
    fetch("http://localhost:3001/inventory")
      .then((res) => res.json())
      .then((data) => {
        setItems(data.items);

        const initialAmounts = {};
        data.items.forEach((item) => {
          initialAmounts[item.slotId] = restockAmounts[item.slotId] ?? "";
        });
        setRestockAmounts(initialAmounts);
      })
      .catch((err) => console.error(err));

    fetch("http://localhost:3001/inventory/summary")
      .then((res) => res.json())
      .then((data) => setSummary(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchData();
  }, []);

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
    const quantityAdded = Number(restockAmounts[slotId]);

    if (!quantityAdded || quantityAdded <= 0) {
      setMessage("Please enter a valid restock amount greater than 0.");
      return;
    }

    fetch("http://localhost:3001/inventory/restock", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        slotId,
        quantityAdded
      })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setMessage(`Error: ${data.error}`);
        } else {
          setMessage(`Successfully restocked ${slotId} by ${quantityAdded}.`);
          fetchData();
        }
      })
      .catch((err) => {
        console.error(err);
        setMessage("Something went wrong while restocking.");
      });
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
      <h1 style={{ marginBottom: "1rem" }}>
        UMBC Vending Machine Inventory Dashboard
      </h1>

      <button
        onClick={fetchData}
        style={{
          marginBottom: "1rem",
          padding: "0.5rem 1rem",
          borderRadius: "6px",
          border: "none",
          backgroundColor: "#007bff",
          color: "white",
          cursor: "pointer"
        }}
      >
        Refresh Data
      </button>

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
                onClick={() => handleRestock(item.slotId)}
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
        ))}
      </div>
    </div>
  );
}

export default App;