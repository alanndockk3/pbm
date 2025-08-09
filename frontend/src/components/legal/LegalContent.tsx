// components/legal/LegalContent.tsx
import React from 'react';
import { Mail, Phone, MapPin, Shield } from 'lucide-react';

// Terms of Service Content Component
export const TermsOfServiceContent = () => (
  <div className="space-y-6 text-sm">
    <div>
      <h3 className="text-lg font-semibold text-rose-800 dark:text-rose-200 mb-3">1. Acceptance of Terms</h3>
      <p className="text-rose-700 dark:text-rose-300 leading-relaxed">
        By accessing and using Pretties by Marg ("PBM"), you accept and agree to be bound by the terms and provisions of this agreement. 
        If you do not agree to abide by the above, please do not use this service.
      </p>
    </div>

    <div>
      <h3 className="text-lg font-semibold text-rose-800 dark:text-rose-200 mb-3">2. Products and Services</h3>
      <p className="text-rose-700 dark:text-rose-300 leading-relaxed mb-3">
        PBM specializes in handmade artisan products including:
      </p>
      <ul className="text-rose-700 dark:text-rose-300 ml-6 space-y-1">
        <li>• Handcrafted jewelry and accessories</li>
        <li>• Home décor and artistic pieces</li>
        <li>• Textiles, fabrics, and woven goods</li>
        <li>• Custom commissioned artwork</li>
        <li>• Seasonal and holiday decorations</li>
      </ul>
      <p className="text-rose-700 dark:text-rose-300 leading-relaxed mt-3">
        All products are made with care, attention to detail, and love. Due to the handmade nature, slight variations in color, size, and design may occur.
      </p>
    </div>

    <div>
      <h3 className="text-lg font-semibold text-rose-800 dark:text-rose-200 mb-3">3. Orders and Payment</h3>
      <ul className="text-rose-700 dark:text-rose-300 ml-6 space-y-2">
        <li>• All orders are subject to product availability and confirmation</li>
        <li>• Payment is processed securely through Stripe</li>
        <li>• Prices are displayed in USD and include applicable taxes where required</li>
        <li>• Custom orders may require additional processing time and a deposit</li>
        <li>• We reserve the right to refuse or cancel orders at our discretion</li>
      </ul>
    </div>

    <div>
      <h3 className="text-lg font-semibold text-rose-800 dark:text-rose-200 mb-3">4. Shipping and Delivery</h3>
      <p className="text-rose-700 dark:text-rose-300 leading-relaxed mb-3">
        We offer various shipping options with estimated delivery times:
      </p>
      <ul className="text-rose-700 dark:text-rose-300 ml-6 space-y-1">
        <li>• Standard Shipping: 5-7 business days</li>
        <li>• Express Shipping: 2-3 business days</li>
        <li>• Overnight Shipping: Next business day</li>
      </ul>
      <p className="text-rose-700 dark:text-rose-300 leading-relaxed mt-3">
        Actual delivery times may vary due to weather, holidays, or circumstances beyond our control. 
        Shipping costs are calculated based on destination and package weight.
      </p>
    </div>

    <div>
      <h3 className="text-lg font-semibold text-rose-800 dark:text-rose-200 mb-3">5. Returns and Exchanges</h3>
      <ul className="text-rose-700 dark:text-rose-300 ml-6 space-y-2">
        <li>• Returns accepted within 14 days of delivery for items in original condition</li>
        <li>• Custom or personalized orders are final sale and cannot be returned</li>
        <li>• Items must be unworn, unused, and in original packaging</li>
        <li>• Return shipping costs are the responsibility of the customer unless item was defective</li>
        <li>• Refunds will be processed within 5-7 business days after receiving returned items</li>
      </ul>
    </div>

    <div>
      <h3 className="text-lg font-semibold text-rose-800 dark:text-rose-200 mb-3">6. Intellectual Property</h3>
      <p className="text-rose-700 dark:text-rose-300 leading-relaxed">
        All designs, patterns, photographs, and creative works displayed on this website are the intellectual property of 
        Pretties by Marg and are protected by copyright laws. Unauthorized reproduction, distribution, or use is strictly prohibited.
      </p>
    </div>

    <div>
      <h3 className="text-lg font-semibold text-rose-800 dark:text-rose-200 mb-3">7. User Accounts</h3>
      <ul className="text-rose-700 dark:text-rose-300 ml-6 space-y-2">
        <li>• You are responsible for maintaining the confidentiality of your account information</li>
        <li>• You must provide accurate and complete information when creating an account</li>
        <li>• You are responsible for all activities that occur under your account</li>
        <li>• Notify us immediately of any unauthorized use of your account</li>
      </ul>
    </div>

    <div>
      <h3 className="text-lg font-semibold text-rose-800 dark:text-rose-200 mb-3">8. Limitation of Liability</h3>
      <p className="text-rose-700 dark:text-rose-300 leading-relaxed">
        PBM shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from 
        the use of our products or services. Our total liability shall not exceed the amount paid for the specific product or service.
      </p>
    </div>

    <div>
      <h3 className="text-lg font-semibold text-rose-800 dark:text-rose-200 mb-3">9. Changes to Terms</h3>
      <p className="text-rose-700 dark:text-rose-300 leading-relaxed">
        We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting on our website. 
        Continued use of our services constitutes acceptance of the modified terms.
      </p>
    </div>

    <div className="bg-rose-50 dark:bg-rose-900/20 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-rose-800 dark:text-rose-200 mb-3 flex items-center gap-2">
        <Mail className="w-5 h-5" />
        Contact Information
      </h3>
      <div className="space-y-2 text-rose-700 dark:text-rose-300">
        <p className="flex items-center gap-2">
          <Mail className="w-4 h-4" />
          support@prettiesbymarg.com
        </p>
        <p className="flex items-center gap-2">
          <Phone className="w-4 h-4" />
          (555) 123-PRETTY
        </p>
        <p className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Kokomo, Indiana, US
        </p>
      </div>
    </div>
  </div>
);

// Privacy Policy Content Component
export const PrivacyPolicyContent = () => (
  <div className="space-y-6 text-sm">
    <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-4">
      <p className="text-rose-700 dark:text-rose-300 leading-relaxed">
        <strong>Effective Date:</strong> {new Date().toLocaleDateString()} | 
        At Pretties by Marg, we value your privacy and are committed to protecting your personal information. 
        This policy explains how we collect, use, and safeguard your data.
      </p>
    </div>

    <div>
      <h3 className="text-lg font-semibold text-rose-800 dark:text-rose-200 mb-3">1. Information We Collect</h3>
      
      <h4 className="font-medium text-rose-700 dark:text-rose-300 mb-2">Personal Information You Provide:</h4>
      <ul className="text-rose-700 dark:text-rose-300 ml-6 space-y-1 mb-4">
        <li>• Name, email address, and phone number</li>
        <li>• Shipping and billing addresses</li>
        <li>• Payment information (processed securely through Stripe)</li>
        <li>• Account preferences and wishlist items</li>
        <li>• Communication preferences</li>
      </ul>

      <h4 className="font-medium text-rose-700 dark:text-rose-300 mb-2">Information Collected Automatically:</h4>
      <ul className="text-rose-700 dark:text-rose-300 ml-6 space-y-1">
        <li>• Browser type and version</li>
        <li>• IP address and location data</li>
        <li>• Pages visited and time spent on site</li>
        <li>• Device information and screen resolution</li>
        <li>• Referral sources</li>
      </ul>
    </div>

    <div>
      <h3 className="text-lg font-semibold text-rose-800 dark:text-rose-200 mb-3">2. How We Use Your Information</h3>
      <ul className="text-rose-700 dark:text-rose-300 ml-6 space-y-2">
        <li>• <strong>Order Processing:</strong> To fulfill your orders and provide customer service</li>
        <li>• <strong>Communication:</strong> To send order confirmations, shipping updates, and customer support</li>
        <li>• <strong>Account Management:</strong> To maintain your account and preferences</li>
        <li>• <strong>Improvement:</strong> To enhance our website, products, and services</li>
        <li>• <strong>Marketing:</strong> To send promotional emails (only with your consent)</li>
        <li>• <strong>Legal Compliance:</strong> To comply with applicable laws and regulations</li>
      </ul>
    </div>

    <div>
      <h3 className="text-lg font-semibold text-rose-800 dark:text-rose-200 mb-3">3. Information Sharing and Disclosure</h3>
      <p className="text-rose-700 dark:text-rose-300 leading-relaxed mb-3">
        <strong>We do not sell, trade, or rent your personal information to third parties.</strong> We may share information only in these limited circumstances:
      </p>
      <ul className="text-rose-700 dark:text-rose-300 ml-6 space-y-2">
        <li>• <strong>Service Providers:</strong> With trusted partners who help us operate our business (shipping, payment processing, email services)</li>
        <li>• <strong>Legal Requirements:</strong> When required by law, court order, or government regulation</li>
        <li>• <strong>Business Protection:</strong> To protect our rights, property, or safety, or that of our customers</li>
        <li>• <strong>Business Transfer:</strong> In the event of a merger, acquisition, or asset sale</li>
      </ul>
    </div>

    <div>
      <h3 className="text-lg font-semibold text-rose-800 dark:text-rose-200 mb-3">4. Data Security</h3>
      <p className="text-rose-700 dark:text-rose-300 leading-relaxed mb-3">
        We implement appropriate technical and organizational security measures to protect your personal information:
      </p>
      <ul className="text-rose-700 dark:text-rose-300 ml-6 space-y-1">
        <li>• SSL encryption for data transmission</li>
        <li>• Secure payment processing through Stripe (PCI DSS compliant)</li>
        <li>• Regular security audits and updates</li>
        <li>• Access controls and employee training</li>
        <li>• Secure cloud storage with Firebase</li>
      </ul>
    </div>

    <div>
      <h3 className="text-lg font-semibold text-rose-800 dark:text-rose-200 mb-3">5. Cookies and Tracking Technologies</h3>
      <p className="text-rose-700 dark:text-rose-300 leading-relaxed mb-3">
        We use cookies and similar technologies to enhance your browsing experience:
      </p>
      <ul className="text-rose-700 dark:text-rose-300 ml-6 space-y-2">
        <li>• <strong>Essential Cookies:</strong> Required for website functionality and security</li>
        <li>• <strong>Preference Cookies:</strong> Remember your settings and preferences</li>
        <li>• <strong>Analytics Cookies:</strong> Help us understand how you use our website</li>
        <li>• <strong>Marketing Cookies:</strong> Used for personalized advertising (with consent)</li>
      </ul>
      <p className="text-rose-700 dark:text-rose-300 leading-relaxed mt-3">
        You can control cookie settings through your browser preferences.
      </p>
    </div>

    <div>
      <h3 className="text-lg font-semibold text-rose-800 dark:text-rose-200 mb-3">6. Your Privacy Rights</h3>
      <p className="text-rose-700 dark:text-rose-300 leading-relaxed mb-3">
        You have the following rights regarding your personal information:
      </p>
      <ul className="text-rose-700 dark:text-rose-300 ml-6 space-y-2">
        <li>• <strong>Access:</strong> Request a copy of your personal information</li>
        <li>• <strong>Correction:</strong> Update or correct inaccurate information</li>
        <li>• <strong>Deletion:</strong> Request deletion of your account and data</li>
        <li>• <strong>Portability:</strong> Request your data in a portable format</li>
        <li>• <strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
        <li>• <strong>Restrict Processing:</strong> Limit how we use your information</li>
      </ul>
      <p className="text-rose-700 dark:text-rose-300 leading-relaxed mt-3">
        To exercise these rights, please contact us at privacy@prettiesbymarg.com
      </p>
    </div>

    <div>
      <h3 className="text-lg font-semibold text-rose-800 dark:text-rose-200 mb-3">7. Children's Privacy</h3>
      <p className="text-rose-700 dark:text-rose-300 leading-relaxed">
        Our website is not intended for children under 13 years of age. We do not knowingly collect personal information 
        from children under 13. If we become aware that we have collected such information, we will take steps to delete it promptly.
      </p>
    </div>

    <div>
      <h3 className="text-lg font-semibold text-rose-800 dark:text-rose-200 mb-3">8. International Users</h3>
      <p className="text-rose-700 dark:text-rose-300 leading-relaxed">
        Our services are primarily intended for users in the United States. If you access our website from outside the US, 
        your information may be transferred to, stored, and processed in the United States.
      </p>
    </div>

    <div>
      <h3 className="text-lg font-semibold text-rose-800 dark:text-rose-200 mb-3">9. Updates to This Policy</h3>
      <p className="text-rose-700 dark:text-rose-300 leading-relaxed">
        We may update this Privacy Policy from time to time. We will notify you of significant changes by email or 
        through a prominent notice on our website. The "Effective Date" at the top indicates when the policy was last updated.
      </p>
    </div>

    <div className="bg-rose-50 dark:bg-rose-900/20 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-rose-800 dark:text-rose-200 mb-3 flex items-center gap-2">
        <Shield className="w-5 h-5" />
        Contact Us About Privacy
      </h3>
      <div className="space-y-2 text-rose-700 dark:text-rose-300">
        <p>If you have questions or concerns about this Privacy Policy or our data practices:</p>
        <div className="space-y-1 ml-4">
          <p className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            privacy@prettiesbymarg.com
          </p>
          <p className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            support@prettiesbymarg.com
          </p>
          <p className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Pretties by Marg, Kokomo, Indiana, US
          </p>
        </div>
      </div>
    </div>
  </div>
);