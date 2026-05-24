const Product = require("../models/Product");

function systemPrompt(products) {
  const catalog = products.map(product => ({
    id: String(product._id),
    name: product.name,
    brand: product.brand,
    category: product.category,
    price: product.price,
    description: product.description
  }));

  return `
You are TechBot, a simple ecommerce assistant for Techtronic.
You only do two things:
1. If the user has a problem with the app, apologize for the inconvenience, give a simple solution if possible, then tell them to contact support@gmail.com for more assistance.
2. If the user wants to buy something, recommend exactly one product from the catalog and explain briefly why it fits.

Keep replies short and friendly.
Return JSON only. Do not write any sentence before or after the JSON.
Use one product id exactly as written in the catalog when you recommend a product.
Return this exact shape:
{
  "reply": "short message to the user",
  "recommendedProductId": "product id or empty string"
}

Product catalog:
${JSON.stringify(catalog)}
`;
}

function lastUserMessage(body) {
  if (typeof body.message === "string") return body.message;

  if (Array.isArray(body.messages)) {
    const userMessages = body.messages.filter(message => message.role === "user" && message.text);
    return userMessages[userMessages.length - 1]?.text || "";
  }

  return "";
}

function safeJson(text) {
  const cleaned = text.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");

    if (start !== -1 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch {
        // Fall back to a plain text response below.
      }
    }
  }

  return {
    reply: cleaned || "Sorry, I could not understand that. Please contact support@gmail.com for more assistance.",
    recommendedProductId: ""
  };
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function productCard(product) {
  if (!product) return "";

  const payload = encodeURIComponent(JSON.stringify({
    _id: product._id,
    name: product.name,
    brand: product.brand,
    price: product.price,
    oldPrice: product.oldPrice,
    image: product.image,
    category: product.category,
    description: product.description,
    quantity: 1
  }));

  return `
    <div style="border:1px solid #e5e7eb;border-radius:8px;padding:10px;background:#fff;max-width:230px;">
      <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" style="width:100%;height:110px;object-fit:cover;border-radius:6px;">
      <strong style="display:block;margin-top:8px;">${escapeHtml(product.name)}</strong>
      <span style="display:block;color:#347ff0;font-weight:700;">EGP ${Number(product.price).toLocaleString("en-EG")}</span>
      <button style="margin-top:8px;width:100%;height:36px;border:0;border-radius:6px;background:#347ff0;color:white;font-weight:700;cursor:pointer;"
        onclick="window.cart && window.cart.addToCart(JSON.parse(decodeURIComponent('${payload}')));this.textContent='Added to cart';">
        Add to cart
      </button>
    </div>
  `;
}

async function togetherCompletion(message, products) {
  const { default: Together } = await import("together-ai");
  const together = new Together({ apiKey: process.env.TOGETHER_API_KEY });
  const model = process.env.TOGETHER_MODEL || "meta-llama/Llama-3.3-70B-Instruct-Turbo";
  const stream = await together.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt(products) },
      { role: "user", content: message }
    ],
    model,
    stream: true,
    temperature: 0.4
  });

  let text = "";
  for await (const token of stream) {
    text += token.choices[0]?.delta?.content || "";
  }

  return text;
}

async function chat(req, res, next) {
  try {
    const message = lastUserMessage(req.body);

    if (!message.trim()) {
      return res.status(400).json({ error: "Message is required." });
    }

    if (!process.env.TOGETHER_API_KEY) {
      return res.status(500).json({ error: "Together API key is missing." });
    }

    const products = await Product.find().sort({ createdAt: -1 }).limit(40);
    const parsed = safeJson(await togetherCompletion(message, products));
    const recommendedProduct = parsed.recommendedProductId
      ? products.find(product => String(product._id) === String(parsed.recommendedProductId))
      : null;

    res.json({
      html: `
        <div>
          <p style="margin:0 0 10px;">${escapeHtml(parsed.reply || "How can I help you today?")}</p>
          ${productCard(recommendedProduct)}
        </div>
      `
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { chat };
