import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
    User,
    Package,
    Gem,
    Calendar,
    FileText,
    ImageIcon,
    Video,
    MessageSquare,
    ShieldCheck
} from "lucide-react";

function SizeCard({ title, value }) {
    return (
        <div className="bg-gray-50 rounded-lg border p-4">
            <p className="text-sm text-gray-500">{title}</p>
            <p className="font-semibold mt-1">{value}</p>
        </div>
    );
}

export default function WhatsappOrderDetailsPage() {
  const { orderId } = useParams();
  const { api } = useAuth();

  const [order, setOrder] = useState(null);
const [loading, setLoading] = useState(true);

const [status, setStatus] = useState("");
const [priority, setPriority] = useState("");
const [assignedTo, setAssignedTo] = useState("");
const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    loadOrder();
  }, [orderId, api]);

  const loadOrder = async () => {
    try {
        const res = await api.get(`/admin/whatsapp-orders/${orderId}`);
        setOrder(res.data);

        setStatus(res.data.status || "");
setPriority(res.data.priority || "");
setAssignedTo(res.data.assignedTo || "");
setAdminNotes(res.data.admin_notes || "");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  const saveChanges = async () => {

    try {

        await api.put(`/admin/whatsapp-orders/${orderId}`, {

            status,

            priority,

            assignedTo,

            admin_notes: adminNotes

        });

        alert("Order updated successfully!");

        loadOrder();

    } catch (err) {

        console.error(err);

        alert("Unable to update order.");

    }

};

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
    <div className="bg-[#F9FAFB] min-h-screen py-10">
    
    <div className="max-w-7xl mx-auto px-6">
    
    <div className="bg-white border rounded-xl shadow-sm p-8">
    
    <div className="flex justify-between items-center">
    
    <div>
    
    <h1 className="text-3xl font-bold">
    {order.orderId}
    </h1>
    
    <p className="text-gray-500 mt-2">
    WhatsApp Manufacturing Order
    </p>
    
    </div>
    
    <div className="flex gap-3">
    
    <span className="px-4 py-2 rounded-full bg-yellow-100 text-yellow-800 font-medium">
    {order.status}
    </span>
    
    <span className="px-4 py-2 rounded-full bg-blue-100 text-blue-800 font-medium">
    {order.priority}
    </span>
    
    </div>
    
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">

<div className="border rounded-xl p-6">

<div className="flex items-center gap-2 mb-5">

<User className="w-5 h-5"/>

<h2 className="font-semibold text-lg">
Customer Information
</h2>

</div>

<div className="space-y-3">

<p><b>Name:</b> {order.customer_name}</p>

<p><b>Order Date:</b> {order.order_date}</p>

<p><b>Due Date:</b> {order.due_date}</p>

<p><b>Reference:</b> {order.party_reference_order_id}</p>

</div>

</div>

<div className="border rounded-xl p-6">

<div className="flex items-center gap-2 mb-5">

<Gem className="w-5 h-5"/>

<h2 className="font-semibold text-lg">
Jewellery Details
</h2>

</div>

<div className="space-y-3">

<p><b>Category:</b> {order.product_category}</p>

<p><b>Metal:</b> {order.metal}</p>

<p><b>Stone:</b> {order.stone_type}</p>

<p><b>Finish:</b> {order.finish_type}</p>

<p><b>Weight:</b> {order.approx_weight}</p>

</div>

</div>

</div>

</div>
{/* Design Images */}

<div className="border rounded-xl p-6 mt-6">

<h2 className="text-xl font-semibold mb-5">
Design Images
</h2>

{order.design_images?.length > 0 ? (

<div className="grid grid-cols-2 md:grid-cols-4 gap-4">

{order.design_images.map((image, index) => (

<a
key={index}
href={typeof image === "string" ? image : image.url}
target="_blank"
rel="noreferrer"
>

<img
src={typeof image === "string" ? image : image.url}
alt={`Design ${index + 1}`}
className="w-full h-52 object-cover rounded-lg border transition duration-200 hover:scale-105 hover:shadow-lg"
/>

</a>

))}

</div>

) : (

<p className="text-gray-500">
    No design images uploaded.
</p>
)}

</div>

{/* Product Sizes */}

<div className="border rounded-xl p-6 mt-6">

    <h2 className="text-xl font-semibold mb-6">
        Product Sizes
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

        {order.ring_size && (
            <SizeCard title="Ring Size" value={order.ring_size} />
        )}

        {order.bali_size && (
            <SizeCard title="Bali Size" value={order.bali_size} />
        )}

        {order.bracelet_size && (
            <SizeCard title="Bracelet Size" value={order.bracelet_size} />
        )}

        {order.chain_size && (
            <SizeCard title="Chain Size" value={order.chain_size} />
        )}

        {order.multilayer_chain_size && (
            <SizeCard
                title="Multilayer Chain Size"
                value={order.multilayer_chain_size}
            />
        )}

        {order.necklace_size && (
            <SizeCard title="Necklace Size" value={order.necklace_size} />
        )}

        {order.mangalsutra_size && (
            <SizeCard title="Mangalsutra Size" value={order.mangalsutra_size} />
        )}

        {order.bangle_kada_size1 && (
            <SizeCard
                title="Bangle/Kada Size 1"
                value={order.bangle_kada_size1}
            />
        )}

        {order.bangle_kada_size2 && (
            <SizeCard
                title="Bangle/Kada Size 2"
                value={order.bangle_kada_size2}
            />
        )}

        {order.tops_size && (
            <SizeCard title="Tops Size" value={order.tops_size} />
        )}

        {order.earring_size && (
            <SizeCard title="Earring Size" value={order.earring_size} />
        )}

        {order.pendant_chain_size && (
            <SizeCard
                title="Pendant Chain Size"
                value={order.pendant_chain_size}
            />
        )}

        {order.pendant_size_optional && (
            <SizeCard
                title="Pendant Size"
                value={order.pendant_size_optional}
            />
        )}

        {order.watch_belt_size && (
            <SizeCard
                title="Watch Belt Size"
                value={order.watch_belt_size}
            />
        )}

    </div>

</div>
{/* Reference Video */}

<div className="border rounded-xl p-6 mt-6">

    <h2 className="text-xl font-semibold mb-5">
        Reference Video
    </h2>

    {order.reference_video ? (

<video
controls
className="w-full max-h-[500px] rounded-lg border"
>

<source
src={
    typeof order.reference_video === "string"
    ? order.reference_video
    : order.reference_video?.url
    }
type="video/mp4"
/>
            Your browser does not support video.

        </video>

    ) : (

        <p className="text-gray-500">
            No reference video uploaded.
        </p>

    )}

</div>

{/* Customer Remarks */}

<div className="border rounded-xl p-6 mt-6">

    <h2 className="text-xl font-semibold mb-5">
        Customer Remarks
    </h2>

    <div className="bg-gray-50 border rounded-lg p-5">

        {order.remarks ? (
            <p>{order.remarks}</p>
        ) : (
            <p className="text-gray-500">
                No remarks provided.
            </p>
        )}

    </div>

</div>
{/* Product Specifications */}

<div className="border rounded-xl p-6 mt-6">

    <h2 className="text-xl font-semibold mb-6">
        Product Specifications
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

        {order.gold_kt && (
            <div>
                <p className="text-sm text-gray-500">Gold Purity</p>
                <p className="font-semibold">{order.gold_kt}</p>
            </div>
        )}

        {order.platinum_purity && (
            <div>
                <p className="text-sm text-gray-500">Platinum Purity</p>
                <p className="font-semibold">{order.platinum_purity}</p>
            </div>
        )}

        {order.metal_purity_combo && (
            <div>
                <p className="text-sm text-gray-500">Metal Purity</p>
                <p className="font-semibold">{order.metal_purity_combo}</p>
            </div>
        )}

        {order.gold_colour && (
            <div>
                <p className="text-sm text-gray-500">Gold Colour</p>
                <p className="font-semibold">{order.gold_colour}</p>
            </div>
        )}

        {order.metal_colour_combo && (
            <div>
                <p className="text-sm text-gray-500">Metal Colour</p>
                <p className="font-semibold">{order.metal_colour_combo}</p>
            </div>
        )}

        {order.stone_type && (
            <div>
                <p className="text-sm text-gray-500">Stone Type</p>
                <p className="font-semibold">{order.stone_type}</p>
            </div>
        )}

        {order.finish_type && (
            <div>
                <p className="text-sm text-gray-500">Finish Type</p>
                <p className="font-semibold">
    {order.finish_type || "-"}
</p>
            </div>
        )}

        {order.hallmark_required && (
            <div>
                <p className="text-sm text-gray-500">Hallmark Required</p>
                <p className="font-semibold">{order.hallmark_required}</p>
            </div>
        )}

        {order.need_call && (
            <div>
                <p className="text-sm text-gray-500">Need Call</p>
                <p className="font-semibold">{order.need_call}</p>
            </div>
        )}

    </div>

</div>

{/* Admin Actions */}

<div className="border rounded-xl p-6 mt-6">

    <h2 className="text-xl font-semibold mb-6">
        Admin Actions
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Status */}

        <div>

            <label className="block mb-2 font-medium">
                Status
            </label>

            <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border rounded-lg p-3"
            >

                <option>Pending</option>
                <option>Approved</option>
                <option>Assigned</option>
                <option>In Production</option>
                <option>Polishing</option>
                <option>Stone Setting</option>
                <option>QC</option>
                <option>Ready</option>
                <option>Delivered</option>
                <option>Rejected</option>

            </select>

        </div>

        {/* Priority */}

        <div>

            <label className="block mb-2 font-medium">
                Priority
            </label>

            <select
    value={priority}
    onChange={(e) => setPriority(e.target.value)}
    className="w-full border rounded-lg p-3"
>

                <option>Low</option>
                <option>Normal</option>
                <option>High</option>
                <option>Urgent</option>

            </select>

        </div>

        {/* Assign To */}

        <div className="md:col-span-2">

            <label className="block mb-2 font-medium">
                Assigned To
            </label>

            <input
    type="text"
    value={assignedTo}
    onChange={(e) => setAssignedTo(e.target.value)}
    placeholder="Craftsman / Employee Name"
    className="w-full border rounded-lg p-3"
/>

        </div>

        {/* Internal Notes */}

        <div className="md:col-span-2">

            <label className="block mb-2 font-medium">
                Internal Notes
            </label>

            <textarea
    value={adminNotes}
    onChange={(e) => setAdminNotes(e.target.value)}
    placeholder="Only visible to admin..."
    rows={5}
    className="w-full border rounded-lg p-3"
/>

        </div>

    </div>

    <div className="mt-8">

        <button
            onClick={saveChanges}
            className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition"
        >
            Save Changes
        </button>

    </div>

</div>

</div>

</div>

);
}