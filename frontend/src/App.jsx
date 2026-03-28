import { useEffect, useState } from "react";

function App() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3001/inventory")
      .then((res) => res.json())
      .then((data) => {
        setItems(data.items);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1>Inventory Dashboard</h1>

      {items.map((item) => (
        <div key={item.slotId} style={{ marginBottom: "1rem" }}>
          <strong>{item.productName}</strong> ({item.slotId})  
          <br />
          Quantity: {item.quantity}  
          <br />
          Status: {item.status}
        </div>
      ))}
    </div>
  );
}

export default App;