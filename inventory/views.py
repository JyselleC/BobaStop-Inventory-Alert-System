from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Q
from .models import Product
from .serializers import ProductSerializer, ProductCreateSerializer
from twilio.rest import Client
from django.conf import settings

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ProductCreateSerializer
        return ProductSerializer
    
    @action(detail=False, methods=['get'])
    def suppliers(self, request):
        """Get all unique suppliers"""
        suppliers = Product.objects.values_list('supplier', flat=True).distinct()
        return Response(list(suppliers))
    
    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        """Get products with low stock"""
        low_stock_products = Product.objects.filter(
            quantity__lte=models.F('restock_threshold')
        )
        serializer = self.get_serializer(low_stock_products, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get inventory statistics"""
        total_products = Product.objects.count()
        low_stock_count = Product.objects.filter(
            quantity__lte=models.F('restock_threshold')
        ).count()
        out_of_stock_count = Product.objects.filter(quantity=0).count()
        
        suppliers_count = Product.objects.values('supplier').distinct().count()
        
        return Response({
            'total_products': total_products,
            'low_stock_items': low_stock_count,
            'out_of_stock_items': out_of_stock_count,
            'suppliers_count': suppliers_count
        })
    
    @action(detail=False, methods=['post'])
    def send_low_stock_alert(self, request):
        """Send SMS alert for low stock items"""
        try:
            # Get low stock products
            low_stock_products = Product.objects.filter(
                quantity__lte=models.F('restock_threshold')
            )
            
            if not low_stock_products.exists():
                return Response({'message': 'No low stock items found'})
            
            # Create alert message
            product_names = [p.name for p in low_stock_products[:5]]  # Limit to 5 items
            message = f"🧋 Boba Stop Alert: Low stock items: {', '.join(product_names)}"
            if low_stock_products.count() > 5:
                message += f" and {low_stock_products.count() - 5} more items."
            
            # Send SMS using Twilio
            client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
            
            message = client.messages.create(
                body=message,
                from_=settings.TWILIO_PHONE_NUMBER,
                to=settings.ALERT_RECIPIENT
            )
            
            return Response({
                'message': 'Alert sent successfully',
                'items_count': low_stock_products.count()
            })
            
        except Exception as e:
            return Response(
                {'error': f'Failed to send alert: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
