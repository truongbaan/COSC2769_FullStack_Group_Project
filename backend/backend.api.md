#### `Put /api/orders`
**Function**: Fetch all orders by hubID
````
```typescript
async (req: Request, res: Response) => {
    const orders = await OrderService.getOrders({ page, size }, hubId);
    //Returns all Orders relevant to hubID
    return: id, customer_id, hub_id, status, total_price
````
##response
````
{
    "success": true,
    "message": {
        "data": {
            "orders": [
                {
                    "id": "8e648b53-1aa2-48c7-bb09-72dc019a6fab",
                    "customer_id": "398d0185-8e1e-4268-bf49-5f3a155e74d1",
                    "hub_id": "hcm_hub",
                    "status": "active",
                    "total_price": 16301000
                },
                {
                    "id": "7568be7c-22a7-4284-b9ad-3571e950f0c6",
                    "customer_id": "398d0185-8e1e-4268-bf49-5f3a155e74d1",
                    "hub_id": "hcm_hub",
                    "status": "active",
                    "total_price": 5050000
                }
            ],
            "count": 2,
            "page": 1,
            "size": 10
        }
    }
}
````
#### `Patch /api/orders/:id/status`
**Function**: Change the order status active -> delivered or canceled
```typescript
async (req: Request, res: Response) => {
   const updated = await OrderService.updateStatus(id, status, {
      restrictHubId: shipper.hub_id
    })
    //Returns updateed status of order
    return: return: id, customer_id, hub_id, updated status, total_price
```
**Request:**
````
{
	"status": "delivered"
}
````
**Response**
````
{
    "success": true,
    "message": {
        "message": "Order status updated",
        "data": {
            "order": {
                "id": "8e648b53-1aa2-48c7-bb09-72dc019a6fab",
                "customer_id": "398d0185-8e1e-4268-bf49-5f3a155e74d1",
                "hub_id": "hcm_hub",
                "status": "delivered",
                "total_price": 16301000
            }
        }
    }
}

````
#### `Put /api/orders/:id/items`
**Function**: Change the order status active -> delivered or canceled
```typescript
async (req: Request, res: Response) => {
   const updated = await OrderService.updateStatus(id, status, {
      restrictHubId: shipper.hub_id
    })
    //Returns updateed status of order
    return: return: id, customer_id, hub_id, updated status, total_price
```
**Request:**
````
set id: 7568be7c-22a7-4284-b9ad-3571e950f0c6
````
**Response**
````
{
    "success": true,
    "message": {
        "order_id": "7568be7c-22a7-4284-b9ad-3571e950f0c6",
        "customer": {
            "name": "The Anh Customer",
            "address": "the anh house"
        },
        "items": [
            {
                "order_id": "7568be7c-22a7-4284-b9ad-3571e950f0c6",
                "product_id": "5fcb3c27-59f1-48bc-8bbc-57dd1ebaca04",
                "product_name": "Mot Mon Do Re Tien So 3",
                "quantity": 2,
                "price_at_order_time": 25000,
                "total": 50000,
                "image": "https://udgzhggwprkrqkmtthfi.supabase.co/storage/v1/object/public/productimages/mot%20tam%20anh%20cho%20mon%20do%20nay"
            },
            {
                "order_id": "7568be7c-22a7-4284-b9ad-3571e950f0c6",
                "product_id": "24ca7ecf-d618-4ac3-85c5-ea176cc66d8e",
                "product_name": "Luxury Smart Watch",
                "quantity": 2,
                "price_at_order_time": 2500000,
                "total": 5000000,
                "image": "https://udgzhggwprkrqkmtthfi.supabase.co/storage/v1/object/public/productimages/luxurywatch.jpg"
            }
        ],
        "count": 2
    }
}
````
==============================================================================================================================================================
#### `GET /api/cart`
**Function**: Fetch all orders by hubID
```typescript
async (req: Request, res: Response) => {
    const items = await ShoppingCartService.getCart({ page, size }, req.user_id)
    //Returns all the product in shopping cart
    return: id, customer_id, product_id, quantity
```

**response**: 
```
{
    "success": true,
    "message": {
        "items": [
            {
                "id": "5dcb1f2b-0a65-4ea3-99b8-814cdf0eb375",
                "product_id": "24ca7ecf-d618-4ac3-85c5-ea176cc66d8e",
                "name": "Luxury Smart Watch",
                "quantity": 2,
                "price": 2500000,
                "subtotal": 5000000,
                "image": "https://udgzhggwprkrqkmtthfi.supabase.co/storage/v1/object/public/productimages/luxurywatch.jpg"
            },
            {
                "id": "1bb58f32-95e9-447d-bf86-4e4bfaa8d985",
                "product_id": "lksdlfkjsalfdjkksdlj",
                "name": "condom",
                "quantity": 2,
                "price": 100000,
                "subtotal": 200000,
                "image": "https://udgzhggwprkrqkmtthfi.supabase.co/storage/v1/object/public/productimages/PinkKondom.jpg"
            }
        ],
        "count": 2,
        "page": 1,
        "size": 10
    }
}
```

#### `DELETE /api/cart/removeItem/:id`
**Function**: delete product by productId
```typescript
async function deleteCartItemByIdController(req: Request, res: Response) {
    const deleted = await ShoppingCartService.deleteItemById(id, userId);
    //Returns all the product in shopping cart
    return: id, customer_id, product_id, quantity
```
**request (JSON)**:
```
product id: 24ca7ecf-d618-4ac3-85c5-ea176cc66d8e
```

**response**:
```
{
    "success": true,
    "message": {
        "data": {
            "removed": true,
            "id": "24ca7ecf-d618-4ac3-85c5-ea176cc66d8e"
        }
    }
}
```

### "POST api/cart/checkout/"
**function**: checkout product in cart
```typescript

```
**request**:
```
http://localhost:5000/api/cart/checkout
```

**response**:
```
```
### "POST api/products/:id/addToCart"
**function**: checkout product in cart

**request (JSON)**:
```
{
  "product_id": "lksdlfkjsalfdjkksdlj"
}
```

**response**:
```
{
    "success": true,
    "message": {
        "item": {
            "id": "bff433cc-f40a-4f1a-8c54-f01d80bb5c8c",
            "customer_id": "b297d44d-cc6c-4643-9fd0-18963e49db15",
            "product_id": "lksdlfkjsalfdjkksdlj",
            "quantity": 1
        }
    }
}
```

==========================================================================================================================================================
#### `GET /api/products`
**Function**: Fetch all products
```typescript
async (req: Request, res: Response) => {
    const items = await ShoppingCartService.getCart({ page, size }, req.user_id)
    //Returns all the products
```


#### `GET /api/products/:productId`
**Function**: Fetch all products
```typescript
async (req: Request, res: Response) => {
    const product = await ProductService.getProductById(productId);
    //Returns single product object
```

#### `POST /api/products/:productId`
**Function**: Create a new product
```typescript
async (req: Request, res: Response) => {
    const created = await ProductService.createProduct(payload);
```
