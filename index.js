const stripe = require('stripe')(process.env.STRIPE_SK);
const express = require('express');
const path = require('path');

const app = express()
currency = process.env.CURRENCY || 'sgd';

app.listen(process.env.PORT || 3000)

app.use('/assets', express.static('assets'));

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

app.post('/create_payment_intent', async function (req, res) {
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