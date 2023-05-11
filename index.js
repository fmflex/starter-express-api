const stripe = require('stripe')(process.env.STRIPE_SK);
const express = require('express');
const path = require('path');
//Loads the handlebars module
const exphbs = require('express-handlebars');

const app = express()
currency = process.env.CURRENCY || 'sgd';

app.listen(process.env.PORT || 3000)

app.engine('hbs', exphbs.engine({
  defaultLayout: 'main',
  extname: '.hbs'
}));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }))
app.use(express.json({}));

app.post('/connection_token', async function (req, res) {
  try {
    let connectionToken = await stripe.terminal.connectionTokens.create();
    res.json({ secret: connectionToken.secret })
  } catch (error) {
    console.error(error);
    res.json("error");
  }
});

app.get('/', function (req, res) {
  console.log("ROOT HELLO WORLD");
  res.json({ sample: "helloo world", currency: currency });
});

app.get('/locations', async function (req, res) {
  console.log("locations");
  try {
    const locations = await stripe.terminal.locations.list({});
    res.json(locations.data.map((location) => { return { id: location.id, display_name: location.display_name } }))
  } catch (error) {
    console.error(error);
    res.json("error");
  }
});

app.get('/currency', async function (req, res) {
  res.json({ currency });
});

app.post('/create_payment_intent_old', async function (req, res) {
  console.log("create_payment_intent");
  try {
    let additional_params = {};
    let idempotency_key = null;
    if (req.body.idempotency_key) {
      idempotency_key = { idempotencyKey: req.body.idempotency_key };
      console.log(idempotency_key);
    }
    console.log(req.body.metadata);
    if (req.body)
      additional_params = { metadata: req.body.metadata };
    console.log(req.body)
    const pi = await stripe.paymentIntents.create({
      amount: req.body.amount,
      currency: currency,
      payment_method_types: ['card_present'],
      capture_method: 'manual',
      ...additional_params
    }, idempotency_key);
    console.log({ client_secret: pi.client_secret, status: pi.status, id: pi.id, amount: pi.amount, currency: pi.currency, metadata: pi.metadata });
    res.json({ client_secret: pi.client_secret, status: pi.status, id: pi.id, amount: pi.amount, currency: pi.currency, metadata: pi.metadata });
  } catch (error) {
    console.error(error);
    res.json("error");
  }
});

app.post('/capture_payment_intent', async function (req, res) {
  console.log("capture_payment_intent");
  try {
    const pi = await stripe.paymentIntents.capture(req.body.payment_intent_id);
    console.log(pi);
    res.json(pi);
  } catch (error) {
    console.error(error);
    res.json("error");
  }

});

app.post('/capture_payment_intent_ttpa', async function (req, res) {
  console.log("capture_payment_intent_ttpa");
  try {
    const pi = await stripe.paymentIntents.capture(req.query.payment_intent_id);
    console.log(pi);
    res.json(pi);
  } catch (error) {
    console.error(error);
    res.json("error");
  }
});

app.get('/create_payment_intent', async function (req, res) {
  console.log("create_payment_intent");
  try {
    const pm = await stripe.paymentMethods.create({
      type: req.query.type,
    });
    const pi = await stripe.paymentIntents.create({
      amount: req.query.amount,
      currency: 'sgd',
      payment_method: pm.id,
      payment_method_types: [req.query.type],
      payment_method_options: {
        wechat_pay: {
          client: "web"
        },
      },
      return_url: "https://wwww.google.com",
      confirm:true
    });
   // console.log({ client_secret: pi.client_secret, status: pi.status, id: pi.id, amount: pi.amount, currency: pi.currency, metadata: pi.metadata });
   const next_action = pi.next_action
   if(next_action.paynow_display_qr_code){
   res.json({ image_url_png: next_action.paynow_display_qr_code.image_url_png,data: next_action.paynow_display_qr_code.data, client_secret: pi.client_secret});
   //res.json({ image_url_png: next_action.paynow_display_qr_code.image_url_png,data: next_action.paynow_display_qr_code.data});
   }
   if(next_action.alipay_handle_redirect){
    res.json({ data: next_action.alipay_handle_redirect.url, client_secret: pi.client_secret});
   }
   if(next_action.wechat_pay_display_qr_code){
    res.json({ image_url_png: next_action.wechat_pay_display_qr_code.image_url_png,data: next_action.wechat_pay_display_qr_code.data, client_secret: pi.client_secret});
   }
  } catch (error) {
    console.error(error);
    res.json("error");
  }
});
/*
var productList = [
  { name: "Apple and orange juice"},
  { name: "Coconut juice with shredded pulp"},
  { name: "Pink grapefruit juice"},
  { name: "White cold brew"},
  { name: "Uji matcha latte"},
  { name: "Lychee oolong tea"},
  { name: "Honey green tea"},
  { name: "Classic milk tea"},  
];
*/
var productList = [
  { name: "Latte"},
  { name: "Cappuccino"},
  { name: "Espresso"},
  { name: "Americano"},
  { name: "Decaf Latte"},
  { name: "Decaf Cappuccino"},
  { name: "Decaf Espresso"},
  { name: "Decaf Americano"},
  { name: "Kopi"},
  { name: "Earl Grey Tea"},
  { name: "Jasmine Green Tea"},
  { name: "Pure Green Tea"},
  { name: "Japanese Green Tea"},
  { name: "Darjeeling Tea"},
  { name: "English Breakfast Tea"},
  { name: "Peppermint Leaves Tea"},
  { name: "Chamomile Tea"},
  { name: "Sparkling Water"},
  { name: "Coke"},
  { name: "Coke Zero"},
  { name: "Cold Green Tea"},
  { name: "Other"},
];

async function paymentIntentList()
{
  const paymentIntents = await stripe.paymentIntents.list({limit:30,})
  const successfulPaymentIntents = paymentIntents.data.filter( pi => pi.status === "succeeded" && pi.metadata !== undefined && pi.metadata.completed !== undefined);
  //console.log(successfulPaymentIntents.length);
  const orders = [];
  successfulPaymentIntents.forEach( paymentIntent =>
    {
   // console.log(paymentIntent.metadata);
    paymentIntent.metadata.completed = paymentIntent.metadata.completed === 'true';
    paymentIntent.metadata.payment_intent_id = paymentIntent.id
    const currentOrder = paymentIntent.metadata.order.split(',')
    const newItems = [];
    currentOrder.forEach( item => 
      {
        const currentItem= item.split('=');
        if(productList.length >currentItem[0].trim() ){
          newItems.push({
            name: productList[currentItem[0].trim()].name,
            quantity: currentItem[1].trim()
          });
        }

      })
      paymentIntent.metadata.order = newItems;
      orders.push(paymentIntent.metadata);
    }
  )
  orders.forEach(order =>
    {
      //console.log(order.order);
    })

    return orders;
}

app.get('/payment_intents', async function (req, res) {
  const orders = await paymentIntentList();
  res.json(orders);
});

app.get("/orders", async function(req, res) {
  const orders = await paymentIntentList();
  console.log(orders);
  res.render("orders", { odr: orders });
});

app.post('/complete_order', async function (req, res) {
  console.log("complete_order");
  try {
    const pi = await stripe.paymentIntents.update(
      req.query.payment_intent_id,
      {metadata: {completed: 'true'}}
    );
    res.json(pi);
  } catch (error) {
    console.error(error);
    res.json("error");
  }
});
