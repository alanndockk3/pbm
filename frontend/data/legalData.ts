// data/legalData.ts
export interface LegalSection {
  title: string;
  content?: string;
  subsections?: {
    title: string;
    items: string[];
  }[];
  additionalContent?: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  address: string;
}

export interface LegalDocument {
  title: string;
  effectiveDate: string;
  lastUpdated: string;
  introduction: string;
  sections: LegalSection[];
  contact: ContactInfo;
}

export const termsOfServiceData: LegalDocument = {
  title: "Terms of Service",
  effectiveDate: "August 1, 2025",
  lastUpdated: "September 12, 2025",
  introduction: "By accessing and using Pretties by Marg (\"PBM\"), you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by the above, please do not use this service.",
  sections: [
    {
      title: "1. Acceptance of Terms",
      content: "By accessing and using Pretties by Marg (\"PBM\"), you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by the above, please do not use this service."
    },
    {
      title: "2. Products and Services",
      content: "PBM specializes in handmade artisan products including:",
      subsections: [
        {
          title: "Product Categories:",
          items: [
            "Handcrafted jewelry and accessories",
            "Home décor and artistic pieces",
            "Textiles, fabrics, and woven goods",
            "Custom commissioned artwork",
            "Seasonal and holiday decorations"
          ]
        }
      ],
      additionalContent: "All products are made with care, attention to detail, and love. Due to the handmade nature, slight variations in color, size, and design may occur."
    },
    {
      title: "3. Orders and Payment",
      subsections: [
        {
          title: "Order Terms:",
          items: [
            "All orders are subject to product availability and confirmation",
            "Payment is processed securely through Stripe",
            "Prices are displayed in USD and include applicable taxes where required",
            "Custom orders may require additional processing time and a deposit",
            "We reserve the right to refuse or cancel orders at our discretion"
          ]
        }
      ]
    },
    {
      title: "4. Shipping and Delivery",
      content: "We offer various shipping options with estimated delivery times:",
      subsections: [
        {
          title: "Shipping Options:",
          items: [
            "Local Delivery (Kokomo): 1-3 days",
            "Standard Shipping: 2-5 days",
            "**Free delivery is only available for customers in Kokomo. If a customer selects free delivery but is not located in Kokomo, the order will be canceled.**"
          ]
        }
      ],
      additionalContent: "Actual delivery times may vary due to weather, holidays, or circumstances beyond our control. Shipping costs are calculated based on destination and package weight."
    },
    {
      title: "5. Returns and Exchanges",
      subsections: [
        {
          title: "Return Policy:",
          items: [
            "Returns accepted within 14 days of delivery for items in original condition",
            "Custom or personalized orders are final sale and cannot be returned",
            "Items must be unworn, unused, and in original packaging",
            "Return shipping costs are the responsibility of the customer unless item was defective",
            "Refunds will be processed within 5-7 business days after receiving returned items"
          ]
        }
      ]
    },
    {
      title: "6. Intellectual Property",
      content: "All designs, patterns, photographs, and creative works displayed on this website are the intellectual property of Pretties by Marg and are protected by copyright laws. Unauthorized reproduction, distribution, or use is strictly prohibited."
    },
    {
      title: "7. User Accounts",
      subsections: [
        {
          title: "Account Responsibilities:",
          items: [
            "You are responsible for maintaining the confidentiality of your account information",
            "You must provide accurate and complete information when creating an account",
            "You are responsible for all activities that occur under your account",
            "Notify us immediately of any unauthorized use of your account"
          ]
        }
      ]
    },
    {
      title: "8. Limitation of Liability",
      content: "PBM shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from the use of our products or services. Our total liability shall not exceed the amount paid for the specific product or service."
    },
    {
      title: "9. Changes to Terms",
      content: "We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting on our website. Continued use of our services constitutes acceptance of the modified terms."
    }
  ],
  contact: {
    email: "support@prettiesbymarg.com",
    phone: "(765) 432-3051",
    address: "Kokomo, Indiana, US"
  }
};

export const privacyPolicyData: LegalDocument = {
  title: "Privacy Policy",
  effectiveDate: "August 1, 2025",
  lastUpdated: "September 12, 2025",
  introduction: " At Pretties by Marg, we value your privacy and are committed to protecting your personal information. This policy explains how we collect, use, and safeguard your data.",
  sections: [
    {
      title: "1. Information We Collect",
      subsections: [
        {
          title: "Personal Information You Provide:",
          items: [
            "Name, email address, and phone number",
            "Shipping and billing addresses",
            "Payment information (processed securely through Stripe)",
            "Account preferences and wishlist items",
            "Communication preferences"
          ]
        },
        {
          title: "Information Collected Automatically:",
          items: [
            "Browser type and version",
            "IP address and location data",
            "Pages visited and time spent on site",
            "Device information and screen resolution",
            "Referral sources"
          ]
        }
      ]
    },
    {
      title: "2. How We Use Your Information",
      subsections: [
        {
          title: "Usage Purposes:",
          items: [
            "Order Processing: To fulfill your orders and provide customer service",
            "Communication: To send order confirmations, shipping updates, and customer support",
            "Account Management: To maintain your account and preferences",
            "Improvement: To enhance our website, products, and services",
            "Marketing: To send promotional emails (only with your consent)",
            "Legal Compliance: To comply with applicable laws and regulations"
          ]
        }
      ]
    },
    {
      title: "3. Information Sharing and Disclosure",
      content: "We do not sell, trade, or rent your personal information to third parties. We may share information only in these limited circumstances:",
      subsections: [
        {
          title: "Sharing Circumstances:",
          items: [
            "Service Providers: With trusted partners who help us operate our business (shipping, payment processing, email services)",
            "Legal Requirements: When required by law, court order, or government regulation",
            "Business Protection: To protect our rights, property, or safety, or that of our customers",
            "Business Transfer: In the event of a merger, acquisition, or asset sale"
          ]
        }
      ]
    },
    {
      title: "4. Data Security",
      content: "We implement appropriate technical and organizational security measures to protect your personal information:",
      subsections: [
        {
          title: "Security Measures:",
          items: [
            "SSL encryption for data transmission",
            "Secure payment processing through Stripe (PCI DSS compliant)",
            "Regular security audits and updates",
            "Access controls and employee training",
            "Secure cloud storage with Firebase"
          ]
        }
      ]
    },
    {
      title: "5. Cookies and Tracking Technologies",
      content: "We use cookies and similar technologies to enhance your browsing experience:",
      subsections: [
        {
          title: "Cookie Types:",
          items: [
            "Essential Cookies: Required for website functionality and security",
            "Preference Cookies: Remember your settings and preferences",
            "Analytics Cookies: Help us understand how you use our website",
            "Marketing Cookies: Used for personalized advertising (with consent)"
          ]
        }
      ],
      additionalContent: "You can control cookie settings through your browser preferences."
    },
    {
      title: "6. Your Privacy Rights",
      content: "You have the following rights regarding your personal information:",
      subsections: [
        {
          title: "Your Rights:",
          items: [
            "Access: Request a copy of your personal information",
            "Correction: Update or correct inaccurate information",
            "Deletion: Request deletion of your account and data",
            "Portability: Request your data in a portable format",
            "Opt-out: Unsubscribe from marketing communications",
            "Restrict Processing: Limit how we use your information"
          ]
        }
      ],
      additionalContent: "To exercise these rights, please contact us at privacy@prettiesbymarg.com"
    },
    {
      title: "7. Age Requirements",
      content: "Our website is not intended for individuals under 18 years of age. You must be 18 or older to use our services. We do not knowingly collect personal information from individuals under 18. If we become aware that we have collected such information, we will take steps to delete it promptly."
    },
    {
      title: "8. International Users",
      content: "Our services are primarily intended for users in the United States. If you access our website from outside the US, your information may be transferred to, stored, and processed in the United States."
    },
    {
      title: "9. Updates to This Policy",
      content: "We may update this Privacy Policy from time to time. We will notify you of significant changes by email or through a prominent notice on our website. The \"Effective Date\" at the top indicates when the policy was last updated."
    }
  ],
  contact: {
    email: "privacy@prettiesbymarg.com",
    phone: "(765) 432-3051",
    address: "Pretties by Marg, Kokomo, Indiana, US"
  }
};
