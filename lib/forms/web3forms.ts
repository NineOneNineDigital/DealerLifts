const ENDPOINT = "https://api.web3forms.com/submit";

/**
 * hCaptcha sitekey. Defaults to Web3Forms' managed sitekey (free plan); a paid
 * plan can override it with a custom key via NEXT_PUBLIC_HCAPTCHA_SITEKEY.
 * hCaptcha must also be enabled per-form in the Web3Forms dashboard for the
 * submitted `h-captcha-response` token to be verified.
 */
export const HCAPTCHA_SITEKEY =
  process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY ??
  "50b2fe65-b00b-4b9e-ad62-3ba471098be2";

/**
 * Submit a form to Web3Forms from the browser.
 *
 * Web3Forms' free plan only accepts submissions originating from a real
 * browser (server-side requests are rejected with "Pro plan required" and the
 * endpoint is Cloudflare-challenge protected). So this MUST be called from a
 * "use client" component — never from a route handler or server action.
 *
 * The access key is passed in (each form uses its own key so submissions route
 * to separate inboxes). Keys are NEXT_PUBLIC_ by design: Web3Forms intends them
 * to be public in client-side code, and the destination email is bound to the
 * key on their side. Returns true only when Web3Forms confirms acceptance.
 */
export async function submitToWeb3Forms(
  accessKey: string | undefined,
  fields: Record<string, string | undefined>,
  opts: { subject: string }
): Promise<boolean> {
  if (!accessKey) {
    return false;
  }
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        access_key: accessKey,
        from_name: "Dealer Lifts Website",
        subject: opts.subject,
        ...fields,
      }),
    });
    const result = (await res.json().catch(() => null)) as {
      success?: boolean;
      message?: string;
    } | null;
    if (!(res.ok && result?.success)) {
      // Surface the reason (e.g. captcha verification failure) for debugging.
      console.error(
        `Web3Forms submission failed (${res.status}):`,
        result?.message ?? "no message"
      );
      return false;
    }
    return true;
  } catch (err) {
    console.error("Web3Forms submission error:", err);
    return false;
  }
}
