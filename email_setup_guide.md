# Email Confirmation Setup Guide

To enable automated email confirmations for newsletter subscriptions, follow these steps:

## 1. Get a Resend API Key
1. Go to [Resend.com](https://resend.com) and create a free account.
2. Generate an **API Key**.
3. Keep it handy for the next step.

## 2. Deploy Supabase Edge Function
You will need the [Supabase CLI](https://supabase.com/docs/guides/cli) installed to deploy the function I created.

Run these commands in your terminal:
```bash
# Login to Supabase
supabase login

# Initialize Supabase (if not already done)
supabase init

# Set the Resend API Key in Supabase
supabase secrets set RESEND_API_KEY=your_resend_api_key_here

# Deploy the function
supabase functions deploy send-confirmation
```

## 3. Create a Database Webhook
Now, tell Supabase to run this function every time someone joins the newsletter:

1. Go to your **Supabase Dashboard**.
2. Navigate to **Database** -> **Webhooks**.
3. Create a new Webhook:
   - **Name**: `send_newsletter_confirmation`
   - **Table**: `newsletter_subscriptions`
   - **Events**: `INSERT`
   - **Type**: `HTTP Request`
   - **Method**: `POST`
   - **URL**: `https://your-project-ref.supabase.co/functions/v1/send-confirmation`
   - **Headers**: Add `Authorization: Bearer YOUR_ANON_KEY`
4. Save the webhook.

Now, whenever a user enters their email in the "Stay in the loop" section, they will receive a beautiful confirmation email!
