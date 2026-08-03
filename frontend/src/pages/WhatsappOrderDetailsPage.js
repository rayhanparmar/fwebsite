import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function WhatsappOrderDetailsPage() {
  const { orderId } = useParams();
  const { api } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
  }, []);

  async function loadOrder() {
    try {
        const res = await api.get(`/admin/whatsapp-orders/${orderId}`);
        setOrder(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-10">
        Loading...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto p-10">
        Order not found.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-10">

      <h1 className="text-3xl font-bold mb-8">
        WhatsApp Order Details
      </h1>

      <div className="border rounded p-6 space-y-3">

        <p><b>Order ID:</b> {order.orderId}</p>

        <p><b>Customer:</b> {order.customer_name}</p>

        <p><b>Phone:</b> {order.phone}</p>

        <p><b>Email:</b> {order.email}</p>

        <p><b>Product:</b> {order.product_category}</p>

        <p><b>Metal:</b> {order.metal}</p>

        <p><b>Stone:</b> {order.stone}</p>

        <p><b>Weight:</b> {order.approx_weight}</p>

        <p><b>Size:</b> {order.size}</p>

        <p><b>Priority:</b> {order.priority}</p>

        <p><b>Status:</b> {order.status}</p>

      </div>

    </div>
  );
}