const express = require('express');
const Stripe = require('stripe');
const stripe = Stripe('sk_test_51QTSb2LPa32ZluPpcI0TbD6UNtfdYUpsDLbMxtEbNk5f4OVrDFlxa7pLF76zCxmRRfS8KkAlk6hwNuuVAzZdgngD00v3yaYdfu'); // Replace with your Stripe secret key
const bodyParser = require('body-parser');
const app = express();

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Endpoint to create a Stripe checkout session with a cart
app.post('/create-checkout-session', async (req, res) => {
  try {
    const { items } = req.body;

    // Create line items for each product in the cart
    const line_items = items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name, // Product name
        },
        unit_amount: Math.round(item.price * 100), // Price in cents
      },
      quantity: 1,
    }));

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: line_items,
      mode: 'payment',
      success_url: `${req.headers.origin}/success`,
      cancel_url: `${req.headers.origin}/cancel`,
    });

    // Send the session ID to the frontend
    res.json({ id: session.id });
  } catch (err) {
    console.error('Error creating session:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Serve static files (for success/cancel pages)
app.use(express.static('public'));

// Start the server
app.listen(4242, () => {
  console.log('Server running on http://localhost:4242');
});
