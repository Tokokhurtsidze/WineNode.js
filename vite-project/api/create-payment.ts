import type { VercelRequest, VercelResponse } from '@vercel/node';
import DodoPayments from 'dodopayments';

const dodo = new DodoPayments({
  bearerToken: process.env.DODO_API_KEY ?? '',
  environment: 'test_mode',
});

const SITE_URL = 'https://wine-node-js.vercel.app';

async function gelToUsd(amountGel: number): Promise<number> {
  try {
    const r = await fetch('https://open.er-api.com/v6/latest/GEL');
    const data = await r.json() as { rates?: { USD?: number } };
    const rate = data?.rates?.USD ?? 0.37;
    return Math.round(amountGel * rate * 100); // USD cents
  } catch {
    // fallback rate if API unreachable
    return Math.round(amountGel * 0.37 * 100);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { totalAmount, customerEmail, customerName, city, address } = req.body as {
    totalAmount: number;
    customerEmail: string;
    customerName: string;
    city: string;
    address: string;
  };

  if (!totalAmount || !customerEmail) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const amountInCents = await gelToUsd(totalAmount);

  try {
    const session = await dodo.checkoutSessions.create({
      product_cart: [
        {
          product_id: process.env.DODO_PRODUCT_ID ?? '',
          quantity: 1,
          amount: amountInCents,
        },
      ],
      billing_currency: 'USD',
      customer: { email: customerEmail, name: customerName || customerEmail },
      billing_address: {
        city: city || 'Tbilisi',
        country: 'GE',
        street: address || '',
        state: 'TB',
        zipcode: '0100',
      },
      return_url: `${SITE_URL}/checkout/success`,
      cancel_url: `${SITE_URL}/checkout`,
      confirm: true,
    } as any);

    return res.json({ checkout_url: (session as any).checkout_url });
  } catch (err: any) {
    console.error('Dodo payment error:', err);
    return res.status(500).json({ error: err?.message ?? 'Payment failed' });
  }
}
