const Stripe = require("stripe");
const Payment = require("../models/payment.model");
const Course = require("../models/course.model");
const User = require("../models/user.model");

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create Checkout Session
const createCheckoutSession = async (req, res) => {
  try {
    const { courseId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "INR",
            product_data: {
              name: course.courseTitle,
              description: course.courseDescription.substring(0, 200),
              images: [course.courseThumbnail || ""],
            },
            unit_amount: Math.round(course.coursePrice * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
      metadata: {
        courseId: courseId.toString(),
      },
    });

    // Create payment record
    // const payment = await Payment.create({
    //   amount: course.coursePrice,
    //   status: 'pending',
    //   courseId,

    //   orderId: session.id,
    // });

    res.status(200).json({
      success: true,
      checkoutUrl: session.url,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Checkout session creation failed",
    });
  }
};

const webhookController = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  

  let event;

  const newStrip = new Stripe(process.env.STRIPE_SECRET_KEY);
  try {
    event = newStrip.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEB_HOOKS);
  } catch (err) {
    console.error(`⚠️ Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      console.log(`✅ Payment successful: `);
      // Add your business logic here (update DB, send email, etc.)
      break;

    case "payment_intent.payment_failed":
      const failedPayment = event.data.object;
      console.log(`❌ Payment failed: `);
      console.log(
        `Failure reason: ${failedPayment.last_payment_error?.message}`
      );
      // Add your failure handling logic here
      break;

    default:
      console.log(`⚠️ Unhandled event type: ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  res.json({ received: true });
};

module.exports = {
  createCheckoutSession,
  webhookController,
};
