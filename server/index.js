import express from 'express';
import axios from 'axios';
import cors from 'cors';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // Allow all origins

// Serve static files from the 'dist' directory
app.use(express.static(path.join(__dirname, '..', 'dist')));

app.post("/api/confirm-payment", async (req, res) => {
  const { paymentKey, orderId, amount } = req.body;

  // Ensure amount is a number
  const numericAmount = Number(amount);
  if (isNaN(numericAmount)) {
    return res.status(400).json({ message: "유효하지 않은 금액입니다." });
  }

  // Use the secret key from environment variables
  const widgetSecretKey = process.env.TOSS_SECRET_KEY;
  if (!widgetSecretKey) {
    return res.status(500).json({ message: "Toss Payments 시크릿 키가 서버에 설정되지 않았습니다." });
  }

  const encryptedSecretKey =
    "Basic " + Buffer.from(widgetSecretKey + ":").toString("base64");

  try {
    const response = await axios.post(
      "https://api.tosspayments.com/v1/payments/confirm",
      {
        orderId: orderId,
        amount: numericAmount,
        paymentKey: paymentKey,
      },
      {
        headers: {
          Authorization: encryptedSecretKey,
          "Content-Type": "application/json",
        },
      }
    );

    // Forward the successful response from Toss Payments to the client
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Toss Payments confirmation error:", error.response?.data || error.message);
    // Forward the error response from Toss Payments to the client
    res.status(error.response?.status || 500).json(error.response?.data || { message: '결제 승인 중 오류가 발생했습니다.' });
  }
});

// Catch-all route to serve index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

app.listen(port, () =>
  console.log(`Server is running on port ${port}`)
);
