export interface WalkthroughEnquiry {
  fullName: string;
  workEmail: string;
  organizationName: string;
  contactNumber: string;
  designation?: string;
  interests?: string;
  consent: true;
}

interface EnquiryResponse {
  success?: boolean;
  error?: string;
  message?: string;
}

export async function submitWalkthroughEnquiry(
  enquiry: WalkthroughEnquiry,
): Promise<void> {
  let response: Response;

  try {
    response = await fetch("/api/walkthrough/enquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "omit",
      body: JSON.stringify(enquiry),
    });
  } catch {
    throw new Error("We couldn't connect to Radora. Check your connection and try again.");
  }

  let result: EnquiryResponse;
  try {
    result = (await response.json()) as EnquiryResponse;
  } catch {
    throw new Error("Radora returned an unexpected response. Please try again.");
  }

  if (!response.ok || result.success !== true) {
    throw new Error(
      result.error || result.message || "We couldn't submit your request. Please try again.",
    );
  }
}
