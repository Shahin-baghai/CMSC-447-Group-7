// Calculates inventory status based on quantity and capacity
function calculateStatus(quantity, capacity) {
    if (quantity <= 0) {
        return "Out of Stock";
    }
    if (quantity <= Math.min(3, Math.floor(capacity * 0.3))) {
        return "Low Stock";
    } 
    return "In Stock";
}

module.exports = calculateStatus;