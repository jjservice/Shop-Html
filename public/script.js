const stripe = Stripe('pk_test_51QTSb2LPa32ZluPp57bSF7ObgsE3CMMCcM1eSbcuMBDrhRuZV6uYL8EqqpLLiGwIAbEg8crJEYfXBDyBM5fZM5Q600fBMTS2Rt'); 

let cart = []; // Initialize an empty cart

// Function to update the cart display
function updateCart() {
  const cartItemsContainer = document.getElementById('cart-items');
  cartItemsContainer.innerHTML = '';
  let total = 0;

  cart.forEach(item => {
    const cartItem = document.createElement('div');
    cartItem.classList.add('cart-item');
    cartItem.innerHTML = `
      <span>${item.name} - $${item.price}</span>
      <button class="remove-item" data-product-id="${item.id}">Remove</button>
    `;
    cartItemsContainer.appendChild(cartItem);
    total += parseFloat(item.price);
  });

  // Update total price
  document.getElementById('cart-total').textContent = `Total: $${total.toFixed(2)}`;

  // Show or hide the checkout button based on cart contents
  const checkoutBtn = document.getElementById('checkout-btn');
  checkoutBtn.style.display = cart.length > 0 ? 'inline-block' : 'none';
}

// Handle the 'Add to Cart' button click
document.querySelectorAll('.buy-now').forEach(button => {
  button.addEventListener('click', (event) => {
    const productId = event.target.getAttribute('data-product-id');
    const productName = event.target.getAttribute('data-name');
    const price = event.target.getAttribute('data-price');
    
    // Add product to cart
    cart.push({ id: productId, name: productName, price: price });
    updateCart();
  });
});

// Handle 'Remove' button click from cart
document.getElementById('cart-items').addEventListener('click', (event) => {
  if (event.target.classList.contains('remove-item')) {
    const productId = event.target.getAttribute('data-product-id');
    
    // Remove item from cart
    cart = cart.filter(item => item.id !== productId);
    updateCart();
  }
});

// Handle the 'Proceed to Checkout' button click
document.getElementById('checkout-btn').addEventListener('click', async () => {
  // Send request to the server to create the checkout session with the cart items
  const response = await fetch('/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: cart })
  });

  const session = await response.json();

  // Redirect to Stripe Checkout
  const { error } = await stripe.redirectToCheckout({ sessionId: session.id });
  if (error) {
    console.error('Error:', error);
  }
});
