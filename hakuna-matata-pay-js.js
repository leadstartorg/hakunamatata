---

// Hakuna Matata Auto Repair — Pay Invoice modal
// Presents a simple amount entry + two payment options, no jargon required from the customer.

(function(){
  // EDIT THESE THREE VALUES with Samuel's real payment info before going live:
  var STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/REPLACE_WITH_REAL_LINK'; // Create in Stripe Dashboard > Payment Links, enable "customer can change amount"
  var PAYPAL_CLIENT_ID = 'REPLACE_WITH_REAL_PAYPAL_CLIENT_ID'; // From developer.paypal.com > Apps & Credentials — enables the full embedded PayPal button
  var PAYPAL_ME_LINK = 'https://paypal.me/HakunaMatataAutoRepair'; // Fallback used until a PayPal Client ID is configured above — just a plain link, works immediately, no setup

  function buildModal(){
    var overlay = document.createElement('div');
    overlay.id = 'payModalOverlay';
    overlay.style.cssText = 'display:none; position:fixed; inset:0; background:rgba(10,14,20,.6); z-index:100; align-items:center; justify-content:center;';
    overlay.innerHTML = [
      '<div style="background:#fff; border-radius:6px; padding:32px; width:92%; max-width:400px; position:relative;">',
      '  <button id="payModalClose" style="position:absolute; top:14px; right:16px; background:none; border:none; font-size:20px; cursor:pointer; color:#5B6472;">&times;</button>',
      '  <h3 style="font-family:\'Archivo\',sans-serif; font-style:italic; font-weight:900; font-size:22px; margin-bottom:6px;" data-en="Pay Invoice">Pay Invoice</h3>',
      '  <p style="color:#5B6472; font-size:13px; margin-bottom:18px;" data-en="Enter the amount from your invoice or estimate.">Enter the amount from your invoice or estimate.</p>',
      '  <label style="display:block; font-size:13px; font-weight:700; margin-bottom:6px;" data-en="Amount (USD)">Amount (USD)</label>',
      '  <input id="payAmount" type="number" min="1" step="0.01" placeholder="0.00" style="width:100%; padding:12px; border:1px solid #DDE1E6; border-radius:0; font-size:16px; margin-bottom:18px;">',
      '  <button id="payWithCard" style="width:100%; padding:14px; background:#E02020; color:#fff; border:none; border-radius:3px; font-weight:700; font-size:14px; margin-bottom:10px; cursor:pointer;" data-en="Pay with Card">Pay with Card</button>',
      '  <div id="paypal-button-container" style="margin-bottom:6px;"></div>',
      '  <p style="font-size:11px; color:#9BA3B0; text-align:center; margin-top:10px;" data-en="Secure payment. You will not be charged until you confirm.">Secure payment. You will not be charged until you confirm.</p>',
      '</div>'
    ].join('');
    document.body.appendChild(overlay);

    document.getElementById('payModalClose').addEventListener('click', closeModal);
    overlay.addEventListener('click', function(e){ if (e.target === overlay) closeModal(); });

    document.getElementById('payWithCard').addEventListener('click', function(){
      var amount = document.getElementById('payAmount').value;
      if (!amount || Number(amount) <= 0) {
        alert(document.documentElement.lang === 'es' ? 'Ingrese un monto válido.' : 'Please enter a valid amount.');
        return;
      }
      // Stripe Payment Links don't take amount via URL unless "customer chooses price" is enabled on the link.
      // With that setting enabled, this simply sends the customer to Stripe's secure hosted checkout page.
      window.open(STRIPE_PAYMENT_LINK, '_blank', 'noopener');
    });

    loadPayPalButtons();
  }

  function loadPayPalButtons(){
    if (!PAYPAL_CLIENT_ID || PAYPAL_CLIENT_ID.indexOf('REPLACE') === 0) {
      // Fallback: a plain, working link to a PayPal.me page. Upgrades automatically to the full
      // embedded PayPal button once a real PAYPAL_CLIENT_ID is set above.
      var fallback = document.createElement('button');
      fallback.type = 'button';
      fallback.style.cssText = 'width:100%; padding:14px; background:#FFC439; color:#111; border:none; border-radius:3px; font-weight:700; font-size:14px; cursor:pointer;';
      fallback.innerHTML = '🅿️ <span data-en="Pay with PayPal">Pay with PayPal</span>';
      fallback.addEventListener('click', function(){
        var amount = document.getElementById('payAmount').value;
        if (!amount || Number(amount) <= 0) {
          alert(document.documentElement.lang === 'es' ? 'Ingrese un monto válido.' : 'Please enter a valid amount.');
          return;
        }
        window.open(PAYPAL_ME_LINK + '/' + Number(amount).toFixed(2) + 'USD', '_blank', 'noopener');
      });
      document.getElementById('paypal-button-container').appendChild(fallback);
      return;
    }
    var script = document.createElement('script');
    script.src = 'https://www.paypal.com/sdk/js?client-id=' + PAYPAL_CLIENT_ID + '&currency=USD';
    script.onload = function(){
      window.paypal.Buttons({
        createOrder: function(data, actions) {
          var amount = document.getElementById('payAmount').value || '0';
          if (Number(amount) <= 0) {
            alert(document.documentElement.lang === 'es' ? 'Ingrese un monto válido.' : 'Please enter a valid amount.');
            return actions.reject();
          }
          return actions.order.create({ purchase_units: [{ amount: { value: Number(amount).toFixed(2) } }] });
        },
        onApprove: function(data, actions) {
          return actions.order.capture().then(function(details) {
            alert(document.documentElement.lang === 'es' ? '¡Pago completado! Gracias.' : 'Payment complete! Thank you.');
            closeModal();
          });
        }
      }).render('#paypal-button-container');
    };
    document.body.appendChild(script);
  }

  function openModal(){
    var overlay = document.getElementById('payModalOverlay');
    if (!overlay) { buildModal(); overlay = document.getElementById('payModalOverlay'); }
    overlay.style.display = 'flex';
    var lang = localStorage.getItem('cp_lang') || 'en';
    overlay.querySelectorAll('[data-en]').forEach(function(el){
      var val = el.getAttribute('data-' + lang);
      if (val) el.textContent = val;
    });
  }

  function closeModal(){
    var overlay = document.getElementById('payModalOverlay');
    if (overlay) overlay.style.display = 'none';
  }

  document.addEventListener('DOMContentLoaded', function(){
    document.querySelectorAll('.pay-btn').forEach(function(btn){
      btn.addEventListener('click', function(e){
        e.preventDefault();
        openModal();
      });
    });
  });
})();