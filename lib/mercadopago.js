import { MercadoPagoConfig, Payment } from "mercadopago";

export async function createCheckoutSession(planName, email) {
  const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
    options: { timeout: 5000, idempotencyKey: "aq" },
  });
  const payment = new Payment(client);
  // Map plan names to MercadoPago plan IDs
  const planUrls = {
    Libre:
      "https://www.mercadopago.com.mx/subscriptions/checkout?preapproval_plan_id=2c93808491d6d45e0191de25a6d8033f",
    Pro: "YOUR_PRO_PLAN_ID",
    Premium: "YOUR_PREMIUM_PLAN_ID",
  };

  const planUrl = planUrls[planName];
  
  if (!planUrl) {
    throw new Error("Plan inválido");
  }

  // Add a unique identifier to the URL
  const uniqueId = Date.now().toString(36) + Math.random().toString(36).substr(2);
  const finalUrl = `${planUrl}&state=${uniqueId}`;

  return finalUrl;
}
