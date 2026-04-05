const db = require("../db");

// updates machine slot with new product and capacity
exports.updateMachineSlot = async (slotId, productId, capacity) => {
  await db.promise().query(
    "UPDATE machine SET product_id = ?, capacity = ? WHERE slot_id = ?",
    [productId, capacity, slotId]
  );
};

// restocks machine slot by adding quantity and reducing backstock
exports.restockMachineSlot = async (slotId, quantityAdded) => {
  const conn = await db.promise().getConnection();

  try {
    await conn.beginTransaction();

    // locks the machine slot row for update
    const [rows] = await conn.query(
      "SELECT product_id, quantity, capacity FROM machine WHERE slot_id = ? FOR UPDATE",
      [slotId]
    );

    // if slot not found, rollback and return error
    if (rows.length === 0) {
      await conn.rollback();
      return { error: "Slot not found" };
    }

    const { product_id, quantity, capacity } = rows[0];

    // checks capacity, returns error if restock would exceed capacity
    if (quantity + quantityAdded > capacity) {
      await conn.rollback();
      return { error: "Exceeds capacity" };
    }

    // checks backstock, returns error if not enough backstock to restock
    const [brows] = await conn.query(
      "SELECT stock FROM backstock WHERE product_id = ?",
      [product_id]
    );

    // if product not found in backstock, return error
    if (brows[0].stock < quantityAdded) {
      await conn.rollback();
      return { error: "Not enough backstock" };
    }

    // updates machine slot quantity and reduces backstock
    await conn.query(`
      UPDATE machine m
      JOIN backstock b ON m.product_id = b.product_id
      SET m.quantity = m.quantity + ?, b.stock = b.stock - ?
      WHERE m.slot_id = ?
    `, [quantityAdded, quantityAdded, slotId]);

    await conn.commit();

    return { success: true };

  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};