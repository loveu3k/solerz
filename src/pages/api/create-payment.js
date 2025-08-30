import axios from 'axios';

export default async function handler(req, res) {
  // Add this line for the test
  console.log("--- CREATE PAYMENT API ROUTE HIT ---");

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email, name, amount, tierName } = req.body;
  const BILLPLZ_API_KEY = process.env.BILLPLZ_API_KEY;
  const BILLPLZ_COLLECTION_ID = process.env.BILLPLZ_COLLECTION_ID;
  
  try {
    const billplzResponse = await axios.post(
      'https://www.billplz.com/api/v3/bills',
      {
        collection_id: BILLPLZ_COLLECTION_ID,
        email: email,
        name: name,
        amount: amount * 100,
        description: `Payment for ${tierName} Plan`,
        callback_url: `${process.env.NEXT_PUBLIC_URL}/api/payment-callback`,
        redirect_url: `${process.env.NEXT_PUBLIC_URL}/payment-success`,
      },
      {
        auth: {
          username: BILLPLZ_API_KEY,
          password: '',
        },
      }
    );

    res.status(200).json({ paymentUrl: billplzResponse.data.url });
  } catch (error) {
    console.error('Error creating Billplz bill:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to create payment bill.' });
  }
}
