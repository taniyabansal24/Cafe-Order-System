"use client";

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders');
        const data = await response.json();
        setOrders(data.orders);
      } catch (error) {
        toast.error('Failed to load orders');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
    
    // Set up real-time updates (polling for simplicity)
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      toast.success(`Order ${orderId} marked as ${newStatus}`);
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (isLoading) {
    return <div>Loading orders...</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Current Orders</h1>
      
      {orders.length === 0 ? (
        <p>No active orders</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map(order => (
            <Card key={order.id} className="border-l-4 border-primary">
              <CardHeader>
                <CardTitle className="flex justify-between">
                  <span>Token: {order.tokenNumber}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'PREPARING' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {order.status}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {order.items.map(item => (
                    <div key={item._id} className="flex justify-between">
                      <span>{item.quantity}x {item.name}</span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t mt-4 pt-2 flex justify-between font-bold">
                  <span>Total:</span>
                  <span>₹{order.total}</span>
                </div>
                <div className="flex justify-between mt-4 space-x-2">
                  {order.status === 'PENDING' && (
                    <Button
                      className="flex-1"
                      onClick={() => updateOrderStatus(order.id, 'PREPARING')}
                    >
                      Start Preparing
                    </Button>
                  )}
                  {order.status === 'PREPARING' && (
                    <Button
                      className="flex-1"
                      onClick={() => updateOrderStatus(order.id, 'READY')}
                    >
                      Mark as Ready
                    </Button>
                  )}
                  {order.status === 'READY' && (
                    <Button
                      className="flex-1"
                      onClick={() => updateOrderStatus(order.id, 'COMPLETED')}
                    >
                      Complete Order
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}