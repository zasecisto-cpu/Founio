const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  const { priceId } = JSON.parse(event.body);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.URL}/success.html`,
      cancel_url: `${process.env.URL}/cancel.html`,

      // 🔹 Tady přidáme sběr údajů:
      customer_creation: 'always',
      customer_email: undefined, // Stripe sám zobrazí pole pro e-mail
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['CZ', 'PL', 'SK'],
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ id: session.id }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};

