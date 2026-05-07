const db = require("../db");
const { recordActivity } = require("./restockLogService");

// updates machine slot with new product and capacity
exports.updateMachineSlot = async (slotId, { productId, quantity, capacity }) => {
  const fields = [];
  const values = [];

  if (productId !== undefined) {
    fields.push("product_id = ?");
    values.push(productId || null);
  }

  if (quantity !== undefined) {
    fields.push("quantity = ?");
    values.push(quantity);
  }

  if (capacity !== undefined) {
    fields.push("capacity = ?");
    values.push(capacity);
  }

  if (fields.length === 0) {
    return { error: "No updates provided" };
  }

  values.push(slotId);

  const [result] = await db.promise().query(
    `UPDATE machine SET ${fields.join(", ")} WHERE slot_id = ?`,
    values
  );

  if (result.affectedRows === 0) {
    return { error: "Slot not found" };
  }

  const [rows] = await db.promise().query(
    `SELECT
      slot_id AS slotId,
      product_id AS productId,
      quantity,
      capacity
     FROM machine
     WHERE slot_id = ?`,
    [slotId]
  );

  return rows[0];
};

// adjusts machine quantity and updates backstock in the opposite direction
exports.adjustMachineSlot = async (slotId, quantityChange, actingUser = null) => {
  const conn = await db.promise().getConnection();
  let activityEntry = null;

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

    if (actingUser) {
      const amount = Math.abs(quantityChange);
      const direction = quantityChange > 0 ? "added" : "removed";

      activityEntry = {
        actingUser,
        actionType: quantityChange > 0 ? "machine_stock_added" : "machine_stock_removed",
        summary: `${actingUser.username} ${direction} ${amount} items ${quantityChange > 0 ? "to" : "from"} slot ${slotId}`,
        target: {
          type: "machine-slot",
          id: slotId
        },
        details: {
          slotId,
          productId: product_id,
          quantityChange,
          previousQuantity: quantity,
          nextQuantity
        }
      };
    }

  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }

  if (activityEntry) {
    await recordActivity(activityEntry);
  }

  return { success: true };
};

// restocks machine slot by adding quantity and reducing backstock
exports.restockMachineSlot = async (slotId, quantityAdded, actingUser = null) => {
  return this.adjustMachineSlot(slotId, quantityAdded, actingUser);
};
