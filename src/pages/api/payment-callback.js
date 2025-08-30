import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
  
  const bill = req.body;
  const BILLPLZ_X_SIGNATURE_KEY = process.env.BILLPLZ_X_SIGNATURE_KEY;

  const sourceString = `amount${bill.amount}|collection_id${bill.collection_id}|due_at${bill.due_at}|email${bill.email}|id${bill.id}|mobile${bill.mobile}|name${bill.name}|paid_amount${bill.paid_amount}|paid_at${bill.paid_at}|paid${bill.paid}|state${bill.state}|url${bill.url}`;

  const computedSignature = crypto
    .createHmac('sha256', BILLPLZ_X_SIGNATURE_KEY)
    .update(sourceString)
    .digest('hex');

  if (computedSignature === bill.x_signature) {
    if (bill.paid === 'true') {
      console.log(`Payment successful for bill: ${bill.id}. Email: ${bill.email}`);
      // TODO: Add your database logic here to upgrade the user's account
    }
    res.status(200).send('OK');
  } else {
    res.status(400).send('Invalid signature');
  }
}