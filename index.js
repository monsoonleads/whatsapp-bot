// Keep-alive server for Render
const http = require('http');
http.createServer((req, res) => res.end('Bot is alive')).listen(process.env.PORT || 3000);
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
require('dotenv').config();

// 🔒 DeepSeek API Key (store in .env)
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

// Benykyms Printers Services & Pricing (from your JSON)
const SERVICES_DATA = `
Benykyms Printers offers the following services and prices:
- Window Graphics Sticker 1.2m: KSh 1200
- Reflective Sticker 1.2m: KSh 1200
- Clear Sticker 1.2m: KSh 1500
- Polo T-Shirt Blue Colour: KSh 1000
- Bucklit Banner 1.2m: KSh 900
- Tender Numbering: KSh 1
- Portrait A3: KSh 1500
- A4 Colour Printing: KSh 20
- Branded T-Shirts: From KSh 550
- Tender Numbering - 1
- Portrait Picture A3 - 1500
- Portrait A2 Size - 2500
- Cartridge 513 HP - 1
- Photocopy Papers (Ream Papers) - 1
-branded Dust Coat - 1300 when plain 1000
- Dummy Cheque  - 4500
- Branded Dummy Cheques - 12
- Digital A3 Plain Paper Black & White Photocopy - 15
- A5 Poster/Flyer Printing Matt Paper - 15
- Digital A4 Colour Printing - 20
- Document Scanning - 20
- A3 Poster - 30
- 130 Gms A3 Art Paper Colour Printing - 25 one sided bothsided 35 for bulky call for negotiations bulky is above 100
- Ivory Paper Printing - 50
- Small Medium Binding (14mm-18mm) - 50
- Tape Binding - Small - 50
- Transport Service - 50
- A3 Eulogy 2 Leaflets 100-150 copies - 55,100 and less copies 60,150 and above-50
- Sticky Notes Small - 70
- Adestor A3 Tic Tac Paper - 80
- Digital 250 Gms Art Cad - 100
- Small Binding (8mm-12mm) - 100
- Laptop Core i7, 1 TB SSD - 110
- Kangaroo Staples 23/10H - 150
- Medium Binding (20mm-28mm) - 150
- Neon Certificate Printing - 200
- Tape Binding - Medium Large - 200
- Invoice Design, Tabulation & Printing - 200
- Diary Branding - 250
- Tape Binding - Large - 250
- Large Binding (45mm-51mm) - 300
- Own Fabric Branding - 300
- Tendering Reference Letter Services - 300
- Branded Reflectors XL - 350
- Sticker Pasting - 350
- Branded Cap Orange - 450
- Jersey Branding - 350
- Wooden Stamp - Small - 450
- Simple Graphics & Design - 500
- Design Certificate - 500
- Burial T-Shirt Black XL - 800
- Round Neck T-Shirt - 550
- Branded Black T-Shirt M Kids - 800
- Glossy Sticker 1.27m - 600
- Glossy Banner 1.2m - 650
- Branded White T-Shirt L - 700
- Procurement Consulting Services - 725
- BP/Stamp O-3045D - 750
- Branded White T-Shirt Size 28 - 800
- Branded Black T-Shirt XL - 800
-Eulogies 130gms -60
-Uv printing Bottles retail -300 wholesale bargainable
-Business Crads single sided -10 ,both sided 15,laminated both sided 20,laminated single sided 15 quantity mus be above 20pcs
-certificate printing on Ivory paper  60,on Neon paper 160,on embossed 30 for bulky kindly call or visit our shops for negotiations
-Roll up banners narrow base - 6500 broad base -9000
-Backdrop price  depends on size  if size is given direct the client to the customer Care
- Uv branded Water bottles -1000 branded thermal bottles 1800
-Branded Pens price from -30 to 150 depends on type of pen and quantity minimum quantity is 40pcs

`;

// Business Info (fallback if AI fails)
const BUSINESS_INFO = `
🎉 *Benykyms Printers – Services & Pricing* 🎉
📍 *Thika* – Stage View Plaza  
📍 *Murang’a* – Mentor Sacco Building  
📞 *0723930299* | *0707699240*  
💬 Ask me about our services! Example:  
- "How much is a Polo T-Shirt?"  
- "Do you do sticker printing?"  
`;

// Get AI response (with business context)
async function getAIResponse(userQuery) {
  try {
    const response = await axios.post(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `You are a very helpful assistant for Benykyms Printers. Use this data: ${SERVICES_DATA}. Answer concisely. If unsure, say "Sorry i didn't get, Chat with our Customer Care  0728445451."`
          },
          { role: 'user', content: userQuery }
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.choices?.[0]?.message?.content || BUSINESS_INFO;
  } catch (error) {
    console.error("❌ AI Error:", error.message);
    return BUSINESS_INFO; // Fallback
  }
}

// WhatsApp Bot Setup
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info');
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    browser: ['BenykymsBot', 'Chrome', '1.0'],
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, qr, lastDisconnect } = update;
    if (qr) qrcode.generate(qr, { small: true });
    if (connection === 'close') {
      if (lastDisconnect.error?.output?.statusCode === DisconnectReason.loggedOut) {
        console.log("🚪 Logged out. Delete 'auth_info' and restart.");
      } else {
        console.log("🔁 Reconnecting...");
        startBot();
      }
    }
    if (connection === 'open') console.log("✅ WhatsApp Bot is Active!");
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const userText = msg.message.conversation || msg.message.extendedTextMessage?.text;
    const sender = msg.key.remoteJid;

    if (!userText) return;

    console.log(`📩 ${sender}: "${userText}"`);

    const reply = await getAIResponse(userText);
    await sock.sendMessage(sender, { text: reply });
  });
}

startBot().catch(err => console.error("❌ Bot crashed:", err));