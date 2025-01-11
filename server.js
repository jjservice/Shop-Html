const express = require('express');
const Stripe = require('stripe');
const stripe = Stripe('sk_test_51QTSb2LPa32ZluPpcI0TbD6UNtfdYUpsDLbMxtEbNk5f4OVrDFlxa7pLF76zCxmRRfS8KkAlk6hwNuuVAzZdgngD00v3yaYdfu'); // Replace with your Stripe secret key
const bodyParser = require('body-parser');
const app = express();

// Middleware to parse JSON bodies
app.use(bodyParser.json());

app.post('/create-checkout-session', async (req, res) => {
  try {
    const { items } = req.body;

    // Create a map to accumulate quantities for each item
    const itemMap = items.reduce((acc, item) => {
      if (acc[item.name]) {
        acc[item.name].quantity += item.quantity; // Add to the existing quantity
      } else {
        acc[item.name] = { ...item }; // Create a new entry if it doesn't exist
      }
      return acc;
    }, {});

    // Convert the item map back to an array of line items
    const line_items = Object.values(itemMap).map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name, // Product name
        },
        unit_amount: Math.round(item.price * 100), // Price in cents
      },
      quantity: item.quantity, // Correct quantity for each item
    }));

    // Create a checkout session with shipping address collection and billing address collection
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: line_items,
      mode: 'payment',
      success_url: `${req.headers.origin}/success`,
      cancel_url: `${req.headers.origin}/cancel`,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA'], // Specify which countries are allowed for shipping
      },
      billing_address_collection: 'required', // Collect billing address
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
