import SectionHeading from '../components/SectionHeading';
import { orders } from '../utils/mockData';
import { formatPesos } from '../utils/currency';

export default function OrderHistory() {
  return (
    <div className="section-shell py-12">
      <SectionHeading eyebrow="Orders" title="Order history" />
      <div className="grid gap-4">
        {orders.map((order) => (
          <div key={order.id} className="glass-card flex items-center justify-between p-5">
            <div>
              <p className="font-bold">Order {order.id}</p>
              <p className="text-sm text-gray-400">{order.status}</p>
            </div>
            <p className="text-orange-300">{formatPesos(order.total)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}