from flask import Blueprint, request, jsonify
from app.services.storage_service import StorageService
from app.services.print_service import PrintEngine
from app.services.order_service import OrderService
from app.core.config import Settings

# Defining the Photo Blueprint
photo_bp = Blueprint('photo_api', __name__)
storage_service = StorageService()
print_engine = PrintEngine()
order_service = OrderService()

@photo_bp.route('/process_photos', methods=['POST'])
def process_photos():
    """Endpoint to save individual captured photos from the frontend."""
    try:
        data = request.get_json(force=True, silent=True) or {}
        order_id = data.get('order_id')
        images = data.get('images', [])
        layout_id = data.get('layout', '1000022813')

        if not order_id or not images:
            return jsonify({"status": "error", "message": "Missing Data"}), 400

        saved_urls = []
        for img_base64 in images:
            file_path = storage_service.save_base64_image(img_base64, order_id)
            if file_path:
                saved_urls.append(f"/{file_path}")

        # Fetching layout details to return to the editor
        layout_details = Settings.get_layout_details(str(layout_id))
        all_settings = Settings.load()
        
        # Determine paper size for frontend scaling
        paper_size = "6x2"
        for size, layouts in all_settings.get('active_layouts', {}).items():
            if str(layout_id) in layouts:
                paper_size = size
                break

        return jsonify({
            "status": "success",
            "photo_urls": saved_urls,
            "layout_details": layout_details,
            "paper_size": paper_size
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@photo_bp.route('/process_final', methods=['POST'])
def process_final():
    """Endpoint to generate the final high-resolution print file."""
    try:
        data = request.get_json(force=True, silent=True) or {}
        order_id = data.get('order_id')
        layout_id = data.get('layout_id')
        final_image_base64 = data.get('final_image')

        if not final_image_base64 or not order_id:
            return jsonify({"status": "error", "message": "Incomplete Data"}), 400

        # Generate final image and update order status to completed
        image_url = print_engine.generate_final_print(final_image_base64, order_id, layout_id)
        order_service.update_order_status(order_id, 'completed')
        
        return jsonify({"status": "success", "image_url": image_url})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

