import 'dotenv/config';
import express from 'express';
import axios from 'axios';

// This is our mini-backend
const api = express();
api.use(express.json());

// The payment creation route
api.post('/api/create-payment', async (req, res) => {
    console.log("--- API MIDDLEWARE HIT ---");

    const { email, name, amount, tierName } = req.body;
    const BILLPLZ_API_KEY = process.env.VITE_BILLPLZ_API_KEY; // Use VITE_ prefix
    const BILLPLZ_COLLECTION_ID = process.env.VITE_BILLPLZ_COLLECTION_ID; // Use VITE_ prefix

    try {
        const billplzResponse = await axios.post(
            'https://www.billplz.com/api/v3/bills',
            {
                collection_id: BILLPLZ_COLLECTION_ID,
                email: email,
                name: name,
                amount: amount * 100,
                description: `Payment for ${tierName} Plan`,
                callback_url: `http://localhost:5173/api/payment-callback`,
                redirect_url: `http://localhost:5173/payment-success`,
            },
            {
                auth: { username: BILLPLZ_API_KEY, password: '' }
            }
        );
        res.status(200).json({ paymentUrl: billplzResponse.data.url });
    } catch (error) {
        const errorData = error.response ? error.response.data : error.message;
        console.error('Error creating Billplz bill:', errorData);
        res.status(500).json({ error: 'Failed to create payment bill.', details: errorData });
    }
});

// The webhook route
api.post('/api/payment-callback', (req, res) => {
    console.log('--- WEBHOOK RECEIVED ---');
    console.log(req.body);
    // Add X-Signature verification here later
    res.status(200).send('OK');
});

export default api;