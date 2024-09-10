import { MercadoPagoConfig, Payment } from "mercadopago";

export async function createCheckoutSession(planName, email) {
  const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
    options: { timeout: 5000, idempotencyKey: "aq" },
  });
  const payment = new Payment(client);
  // Map plan names to MercadoPago plan IDs
  const planIds = {
    Libre: "2c93808491d6d45e0191de25a6d8033f",
    Pro: "YOUR_PRO_PLAN_ID",
    Premium: "YOUR_PREMIUM_PLAN_ID",
  };

  const planId = planIds[planName];
  
  if (!planId) {
    throw new Error("Plan invalido");
  }

  try {
    const body = {
      transaction_amount: 1,
      description: `Suscripción a Plan ${planName}`,
      payment_method_id: planId,
      payer: {
        email: email,
      }
    };

    const response = await payment.create(body);
    console.log(response);
    return response.body.init_point;
  } catch (error) {
    console.error("Error creating MercadoPago checkout:", error);
    throw error;
  }
}
