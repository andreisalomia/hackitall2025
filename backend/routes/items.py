from flask import Blueprint, request, jsonify
from db import db

items_bp = Blueprint('items', __name__)

@items_bp.route('/items', methods=['GET'])
def get_items():
    items = list(db.items.find({}, {"_id": 0}))
    return jsonify(items)

@items_bp.route('/items', methods=['POST'])
def create_item():
    data = request.json
    db.items.insert_one(data)
    return jsonify({"message": "saved"}), 201