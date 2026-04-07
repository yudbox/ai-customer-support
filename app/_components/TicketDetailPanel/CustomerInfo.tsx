import { CustomerTier } from "@/lib/types/common";

interface CustomerInfoProps {
  customer: {
    email: string;
    name: string;
    tier: string;
    total_orders: number;
    lifetime_value: number;
  };
}

export function CustomerInfo({ customer }: CustomerInfoProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">📋 Customer Info</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">Email</p>
          <p className="text-sm text-gray-900">{customer.email}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Name</p>
          <p className="text-sm text-gray-900">{customer.name}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Tier</p>
          <p className="text-sm text-gray-900">
            {customer.tier === CustomerTier.VIP ? "⭐ VIP" : customer.tier}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Total Orders</p>
          <p className="text-sm text-gray-900">{customer.total_orders}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Lifetime Value</p>
          <p className="text-sm text-gray-900">
            ${customer.lifetime_value.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}
