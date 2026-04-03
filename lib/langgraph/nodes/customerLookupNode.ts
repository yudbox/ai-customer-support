import type { WorkflowStateType } from "../state/WorkflowState";
import type { CustomerLookupOutput } from "@/lib/types/agents";
import { getDataSource } from "@/lib/database/connection";
import { Customer } from "@/lib/database/entities/Customer";

export async function customerLookupNode(
  state: WorkflowStateType,
): Promise<Partial<WorkflowStateType>> {
  console.log("🔵 Agent 4: Customer Lookup Agent - Starting...");

  if (state.customer) {
    return { customer: state.customer };
  }

  try {
    const connection = await getDataSource();
    const customerRepo = connection.getRepository(Customer);

    const customer = await customerRepo.findOne({
      where: { email: state.input.email },
    });

    if (!customer) {
      return {
        customer: {
          found: false,
        },
      };
    }

    const customerData: CustomerLookupOutput = {
      found: true,
      customer_id: customer.id,
      tier: customer.tier,
      total_orders: customer.total_orders,
      lifetime_value: Number(customer.lifetime_value),
      avg_sentiment: undefined,
    };

    return {
      customer: customerData,
    };
  } catch (error) {
    console.error("❌ Agent 4: Customer lookup failed:", error);

    return {
      errors: [
        {
          agent: "customerLookup",
          message: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString(),
        },
      ],
    };
  }
}
