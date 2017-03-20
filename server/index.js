const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const keys = require('../secrets.js')
const secretKey = process.env.STRIPE_SECRET_KEY || keys.stripeSecretKey
const stripe = require('stripe')(secretKey);

/* initiate middleware */
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//retrieve the customer from the stripe API
app.get('/customer/:id', (req, res, next) => {
  console.log('Request to retrieve a customer w/ id:', req.params.id)
  let customerId = req.params.id //stripe Id for the specific customer
  stripe.customers.retrieve(customerId)
  .then(customer => res.json(customer))
  .catch(err => next(err))
})

//create a new customer
app.post('/customer/create', (req, res, next) => {
  console.log('Incoming customer creation request:', req.body)
  stripe.customers.create({
    email: req.body.email,
    source: req.body.token
  })
  .then(customer => res.json(customer))
  .catch(next)
})

//create a new payment method for the customer
app.post('/customer/sources', (req, res, next) => {
  console.log('Creating new card:', req.body)
  let customerId = req.body.id //stripe Id for the specific customer
  stripe.customers.createSource(customerId, {
    source: req.body.source
  })
  .then(() => res.end()) //source is returned from promise if needed
  .catch(next)
})

//charge the customer
app.post('/customer/charge', (req, res, next) => {
  console.log('Customer charge information: ', req.body)
  stripe.charges.create({
    amount: +req.body.amount,
    currency: req.body.currency,
    customer: req.body.id
  })
  .then(charge => res.json(charge))
  .catch(next)
})

//initiate the server
app.listen(3000, () => {
  console.log('listening on *:3000');
})

/* - if HTML/CSS files needed in future
  const path = require('path');
  app.use(express.static(path.resolve(__dirname, '..', 'client')));
  app.get('/', (req, res, next) => {
    res.sendFile(path.resolve(__dirname, '..', 'client', 'index.html'), {publishKey})
  })
*/
