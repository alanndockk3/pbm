# Stripe Integration Setup Guide

This guide will help you set up the Stripe integration for product creation and management.

## Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

## Stripe Dashboard Setup

1. **Get your API keys** from the [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. **Create a webhook endpoint** in the [Stripe Dashboard](https://dashboard.stripe.com/webhooks):
   - **Endpoint URL**: `https://your-domain.com/api/stripe/webhook` (Stripe will send events TO this URL)
   - **Events to send** (select these events):
     - `product.created`
     - `product.updated`
     - `product.deleted`
     - `price.created`
     - `price.updated`
3. **Copy the webhook signing secret** from the webhook details page and add it to your environment variables as `STRIPE_WEBHOOK_SECRET`

## How Webhooks Work

**Webhook Flow:**
1. **Product Created**: When you create a product via the admin panel, it's created in Stripe
2. **Stripe Event**: Stripe automatically sends a `product.created` event to your webhook URL
3. **Webhook Processing**: Your webhook handler receives the event and updates Firebase
4. **Sync Complete**: Firebase now has the same product data as Stripe

**Important Notes:**
- Your webhook endpoint must be publicly accessible (HTTPS required for production)
- For local development, use tools like ngrok to expose your local server
- Stripe will retry failed webhook deliveries
- Always verify webhook signatures to ensure events are from Stripe

## Firebase Extension Setup

If you're using the Firebase Stripe extension:

1. Install the Stripe extension in your Firebase project
2. Configure the extension with your Stripe secret key
3. The webhook will automatically sync products between Stripe and Firebase

## Features

### Product Creation
- Create products directly from the admin panel
- Products are automatically created in both Stripe and Firebase
- Support for images, pricing, categories, and metadata

### Product Management
- Edit existing products
- Toggle product active/inactive status
- Mark products as featured
- Delete products (removes from both Stripe and Firebase)

### Webhook Integration
- Stripe sends events TO your webhook endpoint when products are created/updated/deleted
- Your webhook handler processes these events and updates Firebase accordingly
- Real-time synchronization between Stripe and Firebase
- Handles product creation, updates, and deletion automatically

## API Endpoints

- `POST /api/stripe/products` - Create a new product (your app calls this)
- `GET /api/stripe/products` - List all products (your app calls this)
- `POST /api/stripe/webhook` - Webhook endpoint (Stripe calls this when events occur)

## Usage

1. Navigate to the admin products page
2. Click "Create Product" to add a new product
3. Fill in the required fields (name, description, price)
4. Add optional metadata (category, quantity, rating, etc.)
5. Upload product images
6. Save the product

The product will be created in Stripe and automatically synced to your Firebase database.

## Local Development

For local development, you'll need to expose your local server to the internet so Stripe can send webhook events:

1. **Install ngrok**: `npm install -g ngrok`
2. **Start your Next.js app**: `npm run dev`
3. **Expose your local server**: `ngrok http 3000`
4. **Update webhook URL**: Use the ngrok URL in your Stripe webhook endpoint (e.g., `https://abc123.ngrok.io/api/stripe/webhook`)
5. **Update environment variables**: Make sure your local `.env.local` has the correct Stripe keys

**Note**: The ngrok URL changes each time you restart ngrok, so you'll need to update your Stripe webhook endpoint URL accordingly.
