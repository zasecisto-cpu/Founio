const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const { plan } = JSON.parse(event.body || "{}");
    const priceMap = {
      start: process.env.PRICE_START,
      talk:  process.env.PRICE_TALK,
      data:  process.env.PRICE_DATA
    };
    const price = priceMap[plan];
    if (!price) {
      return { statusCode: 400, body: JSON.stringify({ error: "Unknown plan" }) };
    }

    const origin = `https://${process.env.URL?.replace(/^https?:\/\//,'') || event.headers.host}`;
    const success_url = `${origin}/?success=1&session_id={CHECKOUT_SESSION_ID}`;
    const cancel_url  = `${origin}/?canceled=1`;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price, quantity: 1 }],
      success_url,
      cancel_url,
      metadata: { plan }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ id: session.id })
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
