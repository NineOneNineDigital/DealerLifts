const SANDBOX_URL = "https://apitest.authorize.net/xml/v1/request.api";
const PRODUCTION_URL = "https://api.authorize.net/xml/v1/request.api";

function getEndpoint(): string {
  // Fail-safe: only hit production when explicitly opted in.
  return process.env.AUTHORIZENET_SANDBOX === "false"
    ? PRODUCTION_URL
    : SANDBOX_URL;
}

interface OpaqueData {
  dataDescriptor: string;
  dataValue: string;
}

interface TransactionResult {
  avsCheck?: boolean;
  cvvCheck?: boolean;
  description: string;
  manualReview?: boolean;
  messageCode: string;
  responseCode: string;
  success: boolean;
  transactionId: string;
}

const ACCEPTABLE_AVS = new Set(["Y", "X", "M", "D"]);
const ACCEPTABLE_CVV = new Set(["M"]);

export async function chargePaymentNonce(
  opaqueData: OpaqueData,
  amount: number,
  orderNumber: string,
  billing: { email: string; firstName: string; lastName: string }
): Promise<TransactionResult> {
  const apiLoginId = process.env.AUTHORIZENET_API_LOGIN_ID;
  const transactionKey = process.env.AUTHORIZENET_TRANSACTION_KEY;

  if (!(apiLoginId && transactionKey)) {
    throw new Error("Authorize.net credentials not configured");
  }

  const amountStr = (amount / 100).toFixed(2);

  const payload = {
    createTransactionRequest: {
      merchantAuthentication: {
        name: apiLoginId,
        transactionKey,
      },
      transactionRequest: {
        transactionType: "authCaptureTransaction",
        amount: amountStr,
        payment: {
          opaqueData: {
            dataDescriptor: opaqueData.dataDescriptor,
            dataValue: opaqueData.dataValue,
          },
        },
        order: {
          invoiceNumber: orderNumber.slice(0, 20),
        },
        customer: {
          email: billing.email,
        },
        billTo: {
          firstName: billing.firstName,
          lastName: billing.lastName,
        },
      },
    },
  };

  const res = await fetch(getEndpoint(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  const txResponse = data.transactionResponse;
  const messages = data.messages;

  if (messages?.resultCode === "Ok" && txResponse?.responseCode === "1") {
    const avsCode = String(txResponse.avsResultCode || "").toUpperCase();
    const cvvCode = String(txResponse.cvvResultCode || "").toUpperCase();
    const avsCheck = ACCEPTABLE_AVS.has(avsCode);
    const cvvCheck = !cvvCode || ACCEPTABLE_CVV.has(cvvCode);
    const manualReview = !(avsCheck && cvvCheck);

    return {
      success: true,
      transactionId: txResponse.transId,
      responseCode: txResponse.responseCode,
      messageCode: txResponse.messages?.[0]?.code || "",
      description: txResponse.messages?.[0]?.description || "Approved",
      avsCheck,
      cvvCheck,
      manualReview,
    };
  }

  const errorMsg =
    txResponse?.errors?.[0]?.errorText ||
    messages?.message?.[0]?.text ||
    "Transaction failed";

  return {
    success: false,
    transactionId: txResponse?.transId || "",
    responseCode: txResponse?.responseCode || "",
    messageCode: txResponse?.errors?.[0]?.errorCode || "",
    description: errorMsg,
  };
}
