import type { WorkflowStateType } from "../state/WorkflowState";
import type { CustomerLookupOutput } from "@/lib/types/agents";
import { getDataSource } from "@/lib/database/connection";
import { Customer } from "@/lib/database/entities/Customer";

/**
 * Node 4: Customer Lookup Agent
 * Получает профиль клиента из БД или использует уже загруженные данные
 */
export async function customerLookupNode(
  state: WorkflowStateType,
): Promise<Partial<WorkflowStateType>> {
  console.log("🔵 Agent 4: Customer Lookup Agent - Starting...");

  // ✅ ОПТИМИЗАЦИЯ: Если данные уже в state - используем их
  if (state.customer) {
    console.log(
      "✅ Agent 4: Customer data already provided from ticket creation",
    );
    console.log(`   - Tier: ${state.customer.tier}`);
    console.log(`   - Total Orders: ${state.customer.total_orders}`);
    console.log(
      `   - Lifetime Value: $${state.customer.lifetime_value?.toFixed(2)}`,
    );
    return { customer: state.customer };
  }

  // Fallback: Если данных нет - делаем запрос к БД
  try {
    const connection = await getDataSource();
    const customerRepo = connection.getRepository(Customer);

    const customer = await customerRepo.findOne({
      where: { email: state.input.email },
    });

    if (!customer) {
      console.log("⚠️ Agent 4: Customer not found in database");
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
      avg_sentiment: undefined, // TODO: можно добавить расчет из истории тикетов
    };

    console.log(`✅ Agent 4: Customer found - ${customer.tier} tier`);
    console.log(`   - Total Orders: ${customer.total_orders}`);
    console.log(`   - Lifetime Value: $${customer.lifetime_value}`);

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
