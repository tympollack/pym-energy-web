export async function onRequestPost({ request, env }) {
  try {
    const formData = await request.formData();
    
    const fullName = formData.get('fullName');
    const companyName = formData.get('companyName');
    const email = formData.get('email');
    const phone = formData.get('phone') || 'Not Provided';
    const website = formData.get('website') || 'Not Provided';
    const serviceInterest = formData.get('serviceInterest');
    const projectDetails = formData.get('projectDetails');
    const customerFax = formData.get('customer_fax'); // The honeypot field
      
    // 1. Check the Honeypot
    if (customerFax) {
      console.log("Bot detected. Silent rejection.");
      // Send the bot to the success page so it thinks it won
      return Response.redirect(new URL('/?success=true', request.url), 303);
    }

    // 2. Process the legitimate request
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
