const { Webhook } = require("svix");
const User = require("../models/user.model");

// Clerk webhook controller
const clerkWebhooks = async (req, res) => {
  const svix_id = req.headers["svix-id"];
  const svix_timestamp = req.headers["svix-timestamp"];
  const svix_signature = req.headers["svix-signature"];

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({ error: "Missing Svix headers" });
  }


  const payload = JSON.stringify(req.body);
  console.log('payload', payload)
  const headers = {
    "svix-id": svix_id,
    "svix-timestamp": svix_timestamp,
    "svix-signature": svix_signature,
  };

  console.log(headers,"header")
  const wh = new Webhook(process.env.CLERK_WEBHOOKS_SECRET);

  console.log("wh" , wh)
  let evt;
  try {
    evt = wh.verify(payload, headers); 
    // Verify signature
    console.log(evt)
  } catch (err) {
    console.error("Webhook verification failed:", err.message);
    return res.status(400).json({ error: "Invalid webhook signature" });
  }

  const { data, type } = evt;

  try {
    switch (type) {
      case "user.created": {
        const userData = {
          clerkUserId: data.id,
          email: data.email_addresses[0].email_address,
          name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
          imageUrl: data.image_url,
        };
        console.log("data", userData)
        await User.create(userData);
        break;
      }

      case "user.updated": {
        const updateData = {
          email: data.email_addresses[0].email_address,
          name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
          imageUrl: data.image_url,
        };
        await User.findOneAndUpdate({ clerkUserId: data.id }, updateData);
        break;
      }

      case "user.deleted": {
        await User.findOneAndDelete({ clerkUserId: data.id });
        break;
      }

      default:
        console.log("Unhandled webhook type:", type);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { clerkWebhooks };
