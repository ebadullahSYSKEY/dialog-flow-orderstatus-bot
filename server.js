const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const moment = require('moment');

const app = express();
const port = process.env.PORT || 3000;

// Route for the root path
app.get('/', (req, res) => {
  res.send('hello, we are succesfully live');
});

// Webhook endpoint
app.post('/webhook', async (req, res) => {
  try {
    // Step a: Receive the WebhookRequest and fetch the order ID
    const orderId = req.body.queryResult.parameters.orderId;

    // Step b: Make a POST request to fetch the shipment date based on the order ID
    const apiResponse = await axios.post('https://94f3-180-149-212-158.ngrok-free.app/webhook', {
      orderId: orderId
    });

    // Extract shipment date from the API response
    const shipmentDate = apiResponse.data.shipmentDate;
    const formattedDate = moment(shipmentDate).format('dddd, DD MMM YYYY');

    // Step c: Return the WebhookResponse with the appropriate response
    const responseJson = {
      fulfillmentMessages: [
        {
          text: {
            text: [`Your order with ID ${orderId} will be shipped on ${formattedDate}`]
          }
        }
      ]
    };

    // Send the response back to DialogFlow
    res.json(responseJson);
  } catch (error) {
    console.error(error);

    // Handle errors and send an appropriate response
    const errorResponse = {
      fulfillmentMessages: [
        {
          text: {
            text: ['Sorry, there was an error retrieving the shipment']
          }
        }
      ]
    };

    res.json(errorResponse);
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
