"""
Branded HTML email templates for Digital CMO AI transactional emails.
"""

_BASE = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>{title}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
  <tr>
    <td align="center" style="padding:40px 16px;">
      <table role="presentation" width="100%" style="max-width:520px;" cellspacing="0" cellpadding="0" border="0">

        <!-- Logo / wordmark -->
        <tr>
          <td align="center" style="padding-bottom:24px;">
            <span style="font-size:20px;font-weight:700;color:#0f172a;letter-spacing:-0.5px;">
              Digital CMO <span style="color:#f97316;">AI</span>
            </span>
          </td>
        </tr>

        <!-- Card -->
        <tr>
          <td style="background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;padding:40px 36px;">
            {body}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td align="center" style="padding-top:24px;color:#94a3b8;font-size:12px;line-height:1.6;">
            You received this email because you have an account at Digital CMO AI.<br/>
            If you did not request this, you can safely ignore it.
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>"""


def _btn(url: str, label: str) -> str:
    return (
        f'<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0;">'
        f'<tr><td style="border-radius:8px;background:#f97316;">'
        f'<a href="{url}" target="_blank" style="display:inline-block;padding:12px 28px;'
        f'font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">'
        f'{label}</a></td></tr></table>'
    )


def verification_email_html(verify_url: str) -> str:
    body = f"""
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172a;">Verify your email</h1>
      <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.6;">
        Welcome to Digital CMO AI! Click the button below to confirm your email address and activate your account.
      </p>
      {_btn(verify_url, "Verify my email")}
      <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.6;">
        Or copy this link into your browser:<br/>
        <a href="{verify_url}" style="color:#f97316;word-break:break-all;">{verify_url}</a>
      </p>
      <hr style="margin:28px 0;border:none;border-top:1px solid #e2e8f0;"/>
      <p style="margin:0;font-size:13px;color:#94a3b8;">
        This link expires in 48 hours.
      </p>
    """
    return _BASE.format(title="Verify your email — Digital CMO AI", body=body)


def password_reset_email_html(reset_url: str) -> str:
    body = f"""
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172a;">Reset your password</h1>
      <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.6;">
        We received a request to reset the password for your Digital CMO AI account.
        Click the button below to choose a new password.
      </p>
      {_btn(reset_url, "Reset password")}
      <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.6;">
        Or copy this link into your browser:<br/>
        <a href="{reset_url}" style="color:#f97316;word-break:break-all;">{reset_url}</a>
      </p>
      <hr style="margin:28px 0;border:none;border-top:1px solid #e2e8f0;"/>
      <p style="margin:0;font-size:13px;color:#94a3b8;">
        This link expires in 60 minutes. If you did not request a password reset, no action is needed — your password has not changed.
      </p>
    """
    return _BASE.format(title="Reset your password — Digital CMO AI", body=body)
