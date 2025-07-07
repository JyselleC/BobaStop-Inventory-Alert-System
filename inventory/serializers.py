from rest_framework import serializers
from .models import Product

class ProductSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'quantity', 'restock_threshold', 
                 'supplier', 'last_updated', 'status']
    
    def get_status(self, obj):
        if obj.quantity <= 0:
            return "Out of Stock"
        elif obj.quantity <= obj.restock_threshold:
            return "Low Stock"
        else:
            return "In Stock"

class ProductCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['name', 'description', 'quantity', 'restock_threshold', 'supplier']
