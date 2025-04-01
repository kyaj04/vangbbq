from flask import Flask, request, Response, jsonify, send_from_directory
import json
import atexit
from datetime import datetime
from queue import Queue


app = Flask(__name__)

from flask import Flask, jsonify, request, Response
from queue import Queue
from datetime import datetime
import atexit
import json

app = Flask(__name__)

# In-memory storage (replace with a database for production)
myorders = []
clients = []
menu_clients = []
order_clients = []
menu_items = [
    {"category": "Meats", "name": "Pork", "price": 13, "image": "img/porkm.jpg", "des": "No Rice"},
    {"category": "Meats", "name": "Sausage", "price": 13, "image": "img/sausagem.jpg", "des": "No Rice"},
    {"category": "Meats", "name": "Chicken", "price": 13, "image": "img/chickenm.jpg", "des": "No Rice"},
    {"category": "Meats", "name": "Sweet Pork", "price": 13, "image": "img/sweetpork.jpg", "des": "No Rice"},
    {
        "category": "Meats and Rice",
        "name": "Pork Rice Combo",
        "price": 15,
        "image": "img/porkricem.jpg",
        "des": " Farm-raised, selected flavorful lean cuts. Skin that shatters with crispness, united with tenderness beneath. A combination that redefines utterly craveable."
      },
      {
        "category": "Meats and Rice",
        "name": "Sausage Rice Combo",
        "price": 15,
        "image": "img/sausagericem.jpg",
        "des": "A symphony of savory lean pork, infused with invigorating herbs, ginger's warmth, and traditional spices. Dominate your cravings with our signature dish."
      },
      {
        "category": "Meats and Rice",
        "name": "Chicken Rice Combo",
        "price": 15,
        "image": "img/chickenricem.jpg",
        "des": "Bite into the rich, smoky flavors of our BBQ chicken thighs, where bold flavors meets tenderness in perfect harmony. This isn't just chicken; it's a sensory journey."
      },
            {
        "category": "Meats and Rice",
        "name": "Sweet Pork Rice Combo",
        "price": 15,
        "image": "img/sweetporkrice.jpg",
        "des": "Using traditional Hmong ingredients, this dish is great for any gatherings. Pork cooked till mouth-watering tenderness, along with eggs. "
      },
      {
        "category": "Appetizers",
        "name": "Mango + Chili Ember Blend",
        "price": 5,
        "image": "img/mangom.jpg",
        "des": "Experience the vibrant sweetness of mango, elevated by our in-house signature pepper blend. Where sweet and spicy meets a carefully crafted kick. It's a revelation that will awaken your taste buds."
      },
      {
        "category": "Appetizers",
        "name": "Pickle + Chili Ember Blend",
        "price": 3,
        "image": "img/pickelm.jpg",
        "des": "Prepare for a jolt of flavor. Crisp pickles are infused with a bracing sourness, then ignited by our in-house signature pepper blend. This combination results in a uniquely addictive flavor profile."
      },
      {
        "category": "Appetizers",
        "name": "Tapioca Coconut Dessert",
        "price": 5,
        "image": "img/naamvaabm.jpg",
        "des": "Our tapioca coconut dessert is pure comfort. Sweet, creamy coconut milk mingles with soft tapioca, evoking warm childhood memories. Simple yet very satisfying."
      },
      {
        "category": "Appetizers",
        "name": "Sticky Rice",
        "price": 5,
        "image": "img/stickyricem.jpg",
        "des": "Our sticky rice blend is the ultimate culinary companion. Its subtly sweet, satisfyingly chewy texture. Scoop it alongside savory meats, soak up flavorful sauces, or enjoy it as a sweet side. It's the perfect foundation for any flavor adventure."
      },
      {
        "category": "Beverages",
        "name": "Drinks",
        "price": 1,
        "image": "img/beveragesm.jpg",
        "des": "Don't forget the drinks. Enjoy cold refreshing beverages alongside your meal or snack."
      },
      {
        "category": "Beverages",
        "name": "Lime/Grenadine Drinks",
        "price": 5,
        "image": "img/rgdrinkm.jpg",
        "des": "A simple mix drink that complements well with any snack time occasions."
      }
]


# Serve static files for both index.html and orders.html
@app.route('/', defaults={'path': 'index.html'})
@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

@app.route('/menu', methods=['GET', 'POST'])
def menu():
    global menu_items

    if request.method == 'GET':
        return jsonify(menu_items)

    elif request.method == 'POST':
        data = request.get_json()

        # Check if it's an update request (list) or add request (single item)
        if isinstance(data, list):
            # Update the whole menu (after deletion on frontend)
            menu_items = data
            notify_clients(data_type="menu")  
            return jsonify({"message": "Menu updated successfully"})
        elif isinstance(data, dict):
            # Add a single item
            menu_items.append(data)
            notify_clients(data_type="menu")  
            return jsonify(menu_items)

        return jsonify({"error": "Invalid data format"}), 400

    return jsonify(menu_items)

# Get orders excluding deleted ones
@app.route('/get_orders', methods=['GET', 'POST'])
def get_orders():
    global myorders
    if request.method == 'GET':
        filtered_orders = [order for order in myorders if order.get('status') != 'deleted']
        return jsonify(filtered_orders)
    elif request.method == 'POST':
        myorders = request.get_json()
        return jsonify({'message': 'Orders updated successfully'}), 200
    notify_clients(data_type="orders") #notify clients with order data.

# Add new order
@app.route('/add_order', methods=['POST'])
def add_order():
    data = request.json

    # Find the latest order number
    max_order_number = max((order['orderNumber'] for order in myorders), default=0)

    # Check if the order number already exists
    if any(order['orderNumber'] == data['orderNumber'] for order in myorders):
        data['orderNumber'] = max_order_number + 1
        print(f"Order number conflict resolved. Assigned new order number: {data['orderNumber']}")
    else:
        # Ensure it’s the next in line if no conflict
        data['orderNumber'] = max(data['orderNumber'], max_order_number + 1)

    # Append the order and return success
    myorders.append(data)
    notify_clients(data_type="orders") #notify clients with order data.
    return jsonify({"status": "success", "orderNumber": data['orderNumber']})

@app.route('/get_max_order', methods=['GET'])
def get_max_order():
    max_order_number = max((order['orderNumber'] for order in myorders), default=0)
    print(f"maxnumber: {max_order_number}")
    return jsonify({"maxOrderNumber": max_order_number})
    notify_clients(data_type="orders") #notify clients with order data.

# Save orders to file on shutdown
def save_orders_to_file():
    if myorders:
        date_str = datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
        filename = f'orders_{date_str}.json'
        with open(filename, 'w') as f:
            json.dump(myorders, f, indent=4)
        print(f"Orders saved to {filename}")

# Register the function to run at server shutdown
atexit.register(save_orders_to_file)

@app.route('/notify_order_completed', methods=['POST'])
def notify_order_completed():
    print("Received a request to /notify_order_completed")

    try:
        data = request.json
        print("Request data:", data)  # Debug the received data
        
        if not data or 'message' not in data:
            print("Invalid data received")
            return jsonify({"status": "error", "message": "Invalid data"}), 400

        message = data.get('message', '')
        print("Message:", message)

        if message == "order completed":
            print("Order completed message received, notifying clients...")
            notify_clients(data_type="orders")  # Notify clients with order data
        else:
            print("Unexpected message received:", message)

        return jsonify({"status": "success"}), 200
    
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

def notify_clients(data_type="menu"):
    target_clients = menu_clients if data_type == "menu" else order_clients
    print("Clients:", target_clients)

    for client in target_clients:
        try:
            data = menu_items if data_type == "menu" else myorders
            client.put(json.dumps(data))
            print(f"Data sent to {data_type} clients: {data}")
        except Exception as e:
            print(f"Error notifying {data_type} clients: {e}")
            
@app.route('/events/<data_type>')
def events(data_type):
    if data_type not in ["menu", "orders"]:
        return "Invalid data type", 400

    def event_stream():
        queue = Queue()
        if data_type == "menu":
            menu_clients.append(queue)
        elif data_type == "orders":
            order_clients.append(queue)
        print(f"Client connected for {data_type}, Total clients: {len(menu_clients) if data_type == 'menu' else len(order_clients)}")

        try:
            while True:
                data = queue.get()
                yield f"data: {data}\n\n"
        except GeneratorExit:
            if data_type == "menu":
                menu_clients.remove(queue)
            elif data_type == "orders":
                order_clients.remove(queue)
            print(f"Client disconnected from {data_type}")

    return Response(event_stream(), content_type='text/event-stream')


if __name__ == '__main__':
    app.run(host='192.168.137.1', port=3000, debug=True)