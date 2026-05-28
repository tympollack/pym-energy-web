export async function onRequestPost({ request, env }) {
  try {
    const formData = await request.formData();
    
    // Extracting the exact names used in your HTML form attributes
    const fullName = formData.get('fullName');
    const companyName = formData.get('companyName');
    const email = formData.get('email');
    const phone = formData.get('phone') || 'Not Provided';
    const website = formData.get('website') || 'Not Provided';
    const serviceInterest = formData.get('serviceInterest');
    const projectDetails = formData.get('projectDetails');

    // Fire payload to Resend / SendGrid
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.EMAIL_API_KEY}`
      },
      body: JSON.stringify({
        from: 'pym-website-contacts@pymenergy.com',
        to: 'tymz@pymenergy.com',
        subject: `🚨 New PYM Lead: ${companyName}`,
        text: `
Name: ${fullName}
Company: ${companyName}
Email: ${email}
Phone: ${phone}
Website: ${website}
Interest: ${serviceInterest}

Operational Bottlenecks / Goals:
${projectDetails}
        `
      })
    });

    if (emailResponse.ok) {
      return Response.redirect(new URL('/?success=true', request.url), 303);
    } else {
      const errorData = await emailResponse.text();
      return new Response(`Failed to route message: ${errorData}`, { status: 500 });
    }

  } catch (error) {
    return new Response(`Server error: ${error.message}`, { status: 500 });
  }
}
