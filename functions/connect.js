export async function onRequestPost({ request, env }) {
  try {
    // 1. Grab the form data from the frontend
    const formData = await request.formData();
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');

    // 2. Fire the payload to your transactional email provider (e.g., Resend)
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // This pulls the variable you injected into the Cloudflare dashboard!
        'Authorization': `Bearer ${env.EMAIL_API_KEY}`
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev', // Update this to your verified sending domain later
        to: 'tymz@pymenergy.com',      // Your Google Workspace inbox
        subject: `New PYM Energy Inquiry from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
      })
    });

    if (emailResponse.ok) {
      // 3. If successful, seamlessly redirect the user back to your homepage
      return Response.redirect(new URL('/?success=true', request.url), 303);
    } else {
      const errorData = await emailResponse.text();
      return new Response(`Failed to route message: ${errorData}`, { status: 500 });
    }

  } catch (error) {
    return new Response(`Server error: ${error.message}`, { status: 500 });
  }
}
