export async function onRequestPost(context) {
  try {
    // 1. Intercept the form data from the incoming POST request
    const formData = await context.request.formData();
    const name = formData.get('name');
    const email = formData.get('email');
    const company = formData.get('company');
    const inquiryType = formData.get('inquiryType');
    const message = formData.get('message');

    // 2. Perform basic server-side validation
    if (!name || !email || !message) {
      return new Response('Missing required fields.', { status: 400 });
    }

    // 3. Construct the email payload for your Email Provider (e.g., Resend)
    const payload = {
      from: "PYM Energy Website <the-void@pymenergy.com>",
      to: ["tymz@pymenergy.com"],
      subject: `New Consulting Lead: ${inquiryType} from ${name}`,
      text: `
        Name: ${name}
        Email: ${email}
        Company: ${company}
        Service Requested: ${inquiryType}
        
        Message:
        ${message}
      `
    };

    // 4. Fire the data to your Email Provider's API securely
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Accessing the secret API key stored in your Cloudflare dashboard
        "Authorization": `Bearer ${context.env.EMAIL_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      // 5. Tell the frontend the submission was successful
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({ error: 'Failed to route email.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal Server Error.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
    });
  }
}
