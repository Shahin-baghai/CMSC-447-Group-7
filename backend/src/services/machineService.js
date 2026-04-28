const db = require("../db");
const { recordEmployeeRestock } = require("./restockLogService");

// updates machine slot with new product and capacity
exports.updateMachineSlot = async (slotId, productId, capacity) => {
  await db.promise().query(
    "UPDATE machine SET product_id = ?, capacity = ? WHERE slot_id = ?",
    [productId, capacity, slotId]
  );
};

// adjusts machine quantity and updates backstock in the opposite direction
exports.adjustMachineSlot = async (slotId, quantityChange, actingUser = null) => {
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

    // prevents adjusting slots that do not currently have a product assigned
    if (!product_id) {
      await conn.rollback();
      return { error: "Cannot adjust an empty slot" };
    }

    const nextQuantity = quantity + quantityChange;

    if (nextQuantity < 0) {
      await conn.rollback();
      return { error: "Quantity cannot go below 0" };
    }

    if (nextQuantity > capacity) {
      await conn.rollback();
      return { error: "Exceeds capacity" };
    }

    const [brows] = await conn.query(
      "SELECT stock FROM backstock WHERE product_id = ?",
      [product_id]
    );

    // if product is missing from backstock or stock is too low, return an error
    if (brows.length === 0) {
      await conn.rollback();
      return { error: "Backstock record not found" };
    }

    const currentBackstock = brows[0].stock;
    const nextBackstock = currentBackstock - quantityChange;

    if (nextBackstock < 0) {
      await conn.rollback();
      return { error: "Not enough backstock" };
    }

    await conn.query(`
      UPDATE machine m
      JOIN backstock b ON m.product_id = b.product_id
      SET m.quantity = m.quantity + ?, b.stock = b.stock - ?
      WHERE m.slot_id = ?
    `, [quantityChange, quantityChange, slotId]);

    await conn.commit();

    if (actingUser?.role === "employee" && quantityChange > 0) {
      await recordEmployeeRestock({
        username: actingUser.username,
        userId: actingUser.userId,
        role: actingUser.role,
        slotId,
        productId: product_id,
        quantityAdded: quantityChange,
        timestamp: new Date().toISOString()
      });
    }

    return { success: true };

  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

// restocks machine slot by adding quantity and reducing backstock
exports.restockMachineSlot = async (slotId, quantityAdded, actingUser = null) => {
  return this.adjustMachineSlot(slotId, quantityAdded, actingUser);
};
