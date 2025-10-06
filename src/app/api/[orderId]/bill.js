// pages/api/orders/[orderId]/bill.js
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { orderId } = req.query;

  try {
    // Your bill generation logic here
    // Return PDF or HTML bill
    
    // Example response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=bill-${orderId}.pdf`);
    // Send your PDF buffer or file
  } catch (error) {
    console.error('Error generating bill:', error);
    res.status(500).json({ error: 'Failed to generate bill' });
  }
}