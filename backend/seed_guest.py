import requests
import random
import time

API_URL = "http://localhost:8000"

# Guest credentials
GUEST_EMAIL = "guest@inventoryos.com"
GUEST_PASSWORD = "guest123"

def seed_data():
    print("Seeding guest account data on Render API...")
    
    # 1. Register guest user
    print("Registering guest user...")
    requests.post(f"{API_URL}/api/auth/register", json={
        "email": GUEST_EMAIL,
        "password": GUEST_PASSWORD,
        "name": "Guest User"
    })
    
    # 2. Login to get token
    print("Logging in to get token...")
    login_res = requests.post(
        f"{API_URL}/api/auth/login",
        data={"username": GUEST_EMAIL, "password": GUEST_PASSWORD}
    )
    if login_res.status_code != 200:
        print("Failed to login:", login_res.text)
        return
        
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 3. Create Products
    print("Creating products...")
    products = [
        {"name": "Wireless Noise-Cancelling Headphones", "description": "Premium over-ear headphones with ANC.", "price": 299.99, "sku": "AUDIO-WH-01", "quantity_in_stock": 45},
        {"name": "Mechanical Keyboard (Cherry MX Red)", "description": "Tenkeyless mechanical gaming keyboard.", "price": 129.50, "sku": "PERIPH-KBD-02", "quantity_in_stock": 12},
        {"name": "Ultra-Wide 34-inch Monitor", "description": "Curved 144Hz 1440p gaming monitor.", "price": 499.00, "sku": "DISP-UW-03", "quantity_in_stock": 5},
        {"name": "Ergonomic Office Chair", "description": "Mesh back adjustable desk chair.", "price": 249.00, "sku": "FURN-CHR-01", "quantity_in_stock": 20},
        {"name": "USB-C Hub (7-in-1)", "description": "Multi-port adapter for modern laptops.", "price": 35.99, "sku": "ACC-USB-05", "quantity_in_stock": 150},
        {"name": "Bluetooth Tracker Tags (4-Pack)", "description": "Find your keys, wallet, or backpack.", "price": 89.99, "sku": "SMART-TAG-04", "quantity_in_stock": 0},
        {"name": "Wireless Charging Pad", "description": "15W fast wireless charger for smartphones.", "price": 24.99, "sku": "PWR-WLESS-02", "quantity_in_stock": 80},
        {"name": "Smart Home Hub", "description": "Control your entire home ecosystem.", "price": 119.00, "sku": "SMART-HUB-01", "quantity_in_stock": 15},
    ]
    
    product_ids = []
    for p in products:
        res = requests.post(f"{API_URL}/api/products/", json=p, headers=headers)
        if res.status_code == 200:
            product_ids.append(res.json()["id"])
        time.sleep(0.5)
        
    # Fetch existing products in case they already existed
    res = requests.get(f"{API_URL}/api/products/", headers=headers)
    if res.status_code == 200:
        for prod in res.json():
            if prod["id"] not in product_ids:
                product_ids.append(prod["id"])
        
    if not product_ids:
        print("No products available to create orders.")
        return
        
    # 4. Create Customers
    print("Creating customers...")
    customers = [
        {"name": "Acme Corp", "email": "procurement@acme.com", "phone": "555-0101", "address": "123 Business Rd, New York, NY"},
        {"name": "TechStart Inc", "email": "purchasing@techstart.io", "phone": "555-0102", "address": "456 Innovation Blvd, SF, CA"},
        {"name": "Global Retail", "email": "orders@globalretail.net", "phone": "555-0103", "address": "789 Enterprise Way, Chicago, IL"},
        {"name": "Sarah Jenkins", "email": "s.jenkins@example.com", "phone": "555-0104", "address": "321 Residential St, Austin, TX"},
    ]
    
    customer_ids = []
    for c in customers:
        res = requests.post(f"{API_URL}/api/customers/", json=c, headers=headers)
        if res.status_code == 200:
            customer_ids.append(res.json()["id"])
        time.sleep(0.5)
        
    # Fetch existing customers
    res = requests.get(f"{API_URL}/api/customers/", headers=headers)
    if res.status_code == 200:
        for cust in res.json():
            if cust["id"] not in customer_ids:
                customer_ids.append(cust["id"])
        
    # 5. Create Orders
    print("Creating orders...")
    statuses = ["pending", "completed", "delivered", "cancelled"]
    for i in range(12):
        # Pick 1-3 random products
        num_items = random.randint(1, 3)
        selected_products = random.sample(product_ids, num_items)
        
        items = []
        for pid in selected_products:
            items.append({
                "product_id": pid,
                "quantity": random.randint(1, 5)
            })
            
        order_data = {
            "customer_id": random.choice(customer_ids) if customer_ids else None,
            "status": random.choice(statuses),
            "items": items
        }
        
        requests.post(f"{API_URL}/api/orders/", json=order_data, headers=headers)
        time.sleep(0.5)
        
    print("Successfully seeded guest account on Render!")

if __name__ == "__main__":
    seed_data()
