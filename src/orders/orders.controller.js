// Import necessary libraries and data
const path = require("path");
const orders = require(path.resolve("src/data/orders-data"));
const nextId = require("../utils/nextId");

// Middleware to check if request has all required fields for an order
function hasRequiredFields(req, res, next) {
  const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;

  // Array of validation rules
  const validations = [
    {
      property: "deliverTo",
      value: deliverTo,
      validation: value => value && value.length > 0,
      message: "Order must include a deliverTo",
    },
    {
      property: "mobileNumber",
      value: mobileNumber,
      validation: value => value && value.length > 0,
      message: "Order must include a mobileNumber",
    },
    {
      property: "dishes",
      value: dishes,
      validation: value => Array.isArray(value) && value.length > 0,
      message: "Order must include at least one dish",
    },
  ];

  // Iterate over validations and perform each one
  for (const { property, value, validation, message } of validations) {
    if (!validation(value)) {
      return next({ status: 400, message });
    }
  }

  // Additional validation for each dish in the order
  for (const [index, dish] of dishes.entries()) {
    if (
      !dish.quantity ||
      !Number.isInteger(dish.quantity) ||
      dish.quantity <= 0
    ) {
      return next({
        status: 400,
        message: `Dish ${index} must have a quantity that is an integer greater than 0`,
      });
    }
  }

  next();
}

// Middleware to check if order exists
function orderExists(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);
  if (foundOrder) {
    res.locals.order = foundOrder;
    next();
  } else {
    next({
      status: 404,
      message: `Order id not found: ${orderId}`,
    });
  }
}

// Middleware checks if the ID in the request body matches the ID in the route parameters
function idMatches(req, res, next) {
  const { orderId } = req.params;
  const { data: { id } = {} } = req.body;

  if (!id || id === orderId) {
    next();
  } else {
    next({
      status: 400,
      message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`,
    });
  }
}

// Middleware checks if the status of the order is valid
function statusIsValid(req, res, next) {
  const { data: { status } = {} } = req.body;

  if (
    status &&
    ["pending", "preparing", "out-for-delivery", "delivered"].includes(status)
  ) {
    next();
  } else {
    next({
      status: 400,
      message: "Order must have a status of pending, preparing, out-for-delivery, delivered",
    });
  }
}

// Middleware checks if the status of the order is "pending"
function statusIsPending(req, res, next) {
  const order = res.locals.order;
  if (order.status !== "pending") {
    return next({
      status: 400,
      message: "An order cannot be deleted unless it is pending",
    });
  }

  next();
}

// Handler functions
// List all orders
function list(req, res) {
  res.json({ data: orders });
}

// Read a specific order, using the order stored in res.locals by the orderExists middleware
function read(req, res) {
  res.json({ data: res.locals.order });
}

// Create a new order and respond with it
function create(req, res) {
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  const newOrder = {
    id: nextId(),
    deliverTo,
    mobileNumber,
    status,
    dishes};
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

// Update an existing order, using the order stored in res.locals by the orderExists middleware
function update(req, res) {
  const order = res.locals.order;
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;

  if (order.status === "delivered") {
    return next({
      status: 400,
      message: "A delivered order cannot be changed",
    });
  }

  order.deliverTo = deliverTo;
  order.mobileNumber = mobileNumber;
  order.status = status;
  order.dishes = dishes;

  res.json({ data: order });
}

// Delete an existing order
function destroy(req, res) {
  const { orderId } = req.params;
  const index = orders.findIndex((order) => order.id === orderId);
  orders.splice(index, 1);
  res.sendStatus(204);
}


module.exports = {
  list,
  create: [hasRequiredFields, create],
  read: [orderExists, read],
  update: [orderExists, idMatches, hasRequiredFields, statusIsValid, update],
  delete: [orderExists, statusIsPending, destroy],
};