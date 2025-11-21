import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ReportNotification {
  tracking_id: string;
  type_of_abuse: string;
  submitted_at: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tracking_id, type_of_abuse, submitted_at }: ReportNotification = await req.json();

    const adminEmail = Deno.env.get("ADMIN_NOTIFICATION_EMAIL");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (!adminEmail) {
      console.error("ADMIN_NOTIFICATION_EMAIL not configured");
      return new Response(
        JSON.stringify({ error: "Admin email not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Resend API key not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Sending notification for report ${tracking_id} to ${adminEmail}`);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Survivor Hub <onboarding@resend.dev>",
        to: [adminEmail],
        subject: `New Report Submitted - ${tracking_id}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0;">New Report Submitted</h1>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
              <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h2 style="color: #333; margin-top: 0;">Report Details</h2>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Tracking ID:</strong></td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-family: monospace; font-size: 16px;">${tracking_id}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Type of Abuse:</strong></td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${type_of_abuse}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0;"><strong>Submitted:</strong></td>
                    <td style="padding: 10px 0;">${new Date(submitted_at).toLocaleString()}</td>
                  </tr>
                </table>
              </div>

              <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <p style="margin: 0; color: #856404;">
                  <strong>Note:</strong> This email does not contain sensitive report details for security and privacy reasons.
                </p>
              </div>

              <div style="text-align: center;">
                <a href="${Deno.env.get("VITE_SUPABASE_URL")}" 
                   style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  View in Admin Dashboard
                </a>
              </div>

              <p style="text-align: center; color: #6c757d; font-size: 12px; margin-top: 30px;">
                This is an automated notification from Survivor Hub
              </p>
            </div>
          </div>
        `,
        text: `
New Report Submitted

Tracking ID: ${tracking_id}
Type of Abuse: ${type_of_abuse}
Submitted: ${new Date(submitted_at).toLocaleString()}

Note: This email does not contain sensitive report details for security and privacy reasons.

View in Admin Dashboard to see full details.
        `,
      }),
    });

    if (!emailResponse.ok) {
      const error = await emailResponse.text();
      console.error("Resend API error:", error);
      throw new Error(`Resend API error: ${error}`);
    }

    const emailData = await emailResponse.json();
    console.log("Email sent successfully:", emailData);

    return new Response(JSON.stringify(emailData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in report-notifications function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
