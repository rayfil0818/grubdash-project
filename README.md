# grubdash-project

A backend API for managing dishes and orders in the GrubDash food delivery app.

## Structure

- **src/dishes/dishes.controller.js**: Handlers and middleware for creating, reading, updating, and listing dishes (no deletion).
- **src/dishes/dishes.router.js**: Routes for `/dishes` and `/dishes/:dishId`, connecting to dish handlers.
- **src/orders/orders.controller.js**: Handlers and middleware for creating, reading, updating, deleting, and listing orders.
- **src/orders/orders.router.js**: Routes for `/orders` and `/orders/:orderId`, connecting to order handlers.
- **src/utils/nextId.js**: Generates unique IDs for dishes and orders.

## API Endpoints

### Dishes
- **/dishes**
  - `POST`: Create a dish
  - `GET`: List all dishes
  - `PUT`: Update a dish
- **/dishes/:dishId**
  - `GET`: Retrieve a dish
  - `PUT`: Update a dish

### Orders
- **/orders**
  - `POST`: Create an order
  - `GET`: List all orders
  - `PUT`: Update an order
  - `DELETE`: Delete an order
- **/orders/:orderId**
  - `GET`: Retrieve an order
  - `PUT`: Update an order
  - `DELETE`: Delete an order
