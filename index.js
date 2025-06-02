const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
require('dotenv').config();

// 🔒 DeepSeek API Key (store in .env)
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

// Benykyms Printers Services & Pricing (from your JSON)
const SERVICES_DATA = `
Benykyms Printers offers the following services and prices:
Never list all services to the client in one inquiry 
Anytime you are refering client to customer care attach the contact 0728445451
dont suggest other services just respont to client inquiry
be ready to convert measurements to Metre from any unit
- Stickers & Banners
  - Window Graphics Sticker 1.2m: KSh 1200
  - Reflective Sticker 1.2m: KSh 1200
  - Clear Sticker 1.2m: KSh 1500
  - Bucklit Banner 1.2m: KSh 900
  - Glossy Sticker 1.27m: KSh 600
  - Glossy Banner 1msquared: KSh 600
  - Sticker Pasting per metre: KSh 350
  - Roll-up Banners Narrow Base: KSh 6500
  - Roll-up Banners Broad Base: KSh 9000
  - Backdrop: Depends on size, contact Customer Care

- T-Shirts – Branded and Plain
  - Kids Round Neck T-Shirts
    - branded_price: KSh 600
    - plain_price: KSh 450
    - sizes: 2, 4, 6, 8, 10, 12 years
    - note: For different colors, contact Customer Care
    - bulk: Orders above 30 pcs, contact Customer Care
  - Adults Round Neck T-Shirts
    - branded_price: KSh 800
    - plain_price: KSh 550
    - sizes: S, M, L, XL, XXL
    - rare_size: XXXL (Price above KSh 1000)
    - note: For different colors or XXXL, contact Customer Care
    - bulk: Orders above 30 pcs, contact Customer Care
  - Adults Polo T-Shirts
    - branded_price: KSh 1000
    - plain_price: KSh 750
    - sizes: S, M, L, XL, XXL
    - rare_size: XXXL (Price above KSh 1000)
    - note: For different colors or XXXL, contact Customer Care
    - bulk: Orders above 30 pcs, contact Customer Care
-Branded Reflectors prices differs for diffrent qualities light one 350,moderate 400, superior 450,best 650,heavy 950

- Design & Branding
  - Simple Graphics & Design: KSh 500
  - Design Certificate: KSh 500
  - Invoice Design, Tabulation & Printing: KSh 200
  - Diary Branding: KSh 250
  - Own Fabric Branding: KSh 300
  - Jersey Branding: KSh 350
  - Branded Reflectors XL: KSh 350
  - Branded Cap Orange: KSh 450

- Portraits & Photography
  - Portrait A3: KSh 1500
  - Portrait Picture A3: KSh 1500
  - Portrait A2 Size: KSh 2500

- Printing Services
  - A4 Colour Printing: KSh 20
  - Digital A4 Colour Printing: KSh 20
  - Digital A3 Plain Paper Black & White Photocopy: KSh 15
  - A5 Poster/Flyer Printing Matt Paper: KSh 15
  - A3 Poster: KSh 30
  - 130 Gsm A3 Art Paper Colour Printing One Sided: KSh 25
  - 130 Gsm A3 Art Paper Colour Printing Both Sides: KSh 35
  - Ivory Paper Printing: KSh 50
  - Eulogies 130gsm: KSh 60
  - A3 Eulogy 2 Leaflets (≤100 copies): KSh 60
  - A3 Eulogy 2 Leaflets (100–150 copies): KSh 55
  - A3 Eulogy 2 Leaflets (above 150 copies): KSh 50
  - Certificate Printing on Ivory Paper: KSh 60
  - Certificate Printing on Neon Paper: KSh 160
  - Certificate Printing on Embossed Paper: KSh 30 (bulky only)
  - Business Cards Single Sided: KSh 10
  - Business Cards Both Sided: KSh 15
  - Business Cards Laminated Both Sided: KSh 20
  - Business Cards Laminated Single Sided: KSh 15
  - Minimum Quantity for Business Cards: 20 pcs

- Office Equipment & Supplies
  - Cartridge 513 HP: KSh 1
  - Photocopy Papers (Ream): KSh 1
  - Sticky Notes Small: KSh 70
  - Adestor A3 Tic Tac Paper: KSh 80
  - Digital 250 Gsm Art Cad: KSh 100
  - Kangaroo Staples 23/10H: KSh 150
  - Wooden Stamp Small: KSh 450
  - BP/Stamp O-3045D: KSh 750
  - Laptop Core i7, 1 TB SSD: KSh 110

- Binding & Finishing
  - Small Binding (8mm–12mm): KSh 100
  - Small-Medium Binding (14mm–18mm): KSh 50
  - Medium Binding (20mm–28mm): KSh 150
  - Large Binding (45mm–51mm): KSh 300
  - Tape Binding Small: KSh 50
  - Tape Binding Medium/Large: KSh 200
  - Tape Binding Large: KSh 250

- Document Services
  - Document Scanning: KSh 20
  - Tender Numbering: KSh 1
  - Tendering Reference Letter Services: KSh 300

- UV Printing & Branded Items
  - UV Branded Water Bottles: KSh 1000
  - Branded Thermal Bottles: KSh 1800
  - UV Printing Bottles (Retail): KSh 300
  - UV Printing Bottles (Wholesale): Bargainable
  - Branded Pens: From KSh 30 to 150 (min 40 pcs)
-Self inking Stamps no dates 1800, with dates 2500
-Mugs:Magic mug 600,two colour mug 550,white mugs 500
-Water bottles sublimation 750
-Eulogies 130gms -60
-Uv printing Bottles retail -300 wholesale bargainable
-Business Crads single sided -10 ,both sided 15,laminated both sided 20,laminated single sided 15 quantity mus be above 20pcs
-certificate printing on Ivory paper  60,on Neon paper 160,on embossed 30 for bulky kindly call or visit our shops for negotiations
-Roll up banners narrow base - 6500 broad base -9000
-Backdrop price  depends on size  if size is given direct the client to the customer Care
- Uv branded Water bottles -1000 branded thermal bottles 1800
-Branded Pens price from -30 to 150 depends on type of pen and quantity minimum quantity is 40pcs
-Any service that is not listed and client redirect the client to customer care 
Never list all services to the client in one inquiry
Dont mention this info below in every chat unless asked by client 
We are Located:Thika Town Stageview plaza,Murang'a Town Mentor Building 
Murang'a branch Contacts 0707699240,Thika branch 0723930299
For Bulky order of any of services above request the client visit any branch for negotiationss
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