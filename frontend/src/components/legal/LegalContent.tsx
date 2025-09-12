// components/legal/LegalContent.tsx
import React from 'react';
import { Mail, Phone, MapPin, Shield } from 'lucide-react';
import { termsOfServiceData, privacyPolicyData, type LegalSection } from '../../../data/legalData';

// Helper component to render a legal section
const LegalSectionComponent: React.FC<{ section: LegalSection }> = ({ section }) => (
  <div>
    <h3 className="text-lg font-semibold text-rose-800 dark:text-rose-200 mb-3">{section.title}</h3>
    {section.content && (
      <p className="text-rose-700 dark:text-rose-300 leading-relaxed mb-3">{section.content}</p>
    )}
    {section.subsections?.map((subsection, index) => (
      <div key={index}>
        <h4 className="font-medium text-rose-700 dark:text-rose-300 mb-2">{subsection.title}</h4>
        <ul className="text-rose-700 dark:text-rose-300 ml-6 space-y-1">
          {subsection.items.map((item, itemIndex) => (
            <li key={itemIndex}>
              {item.startsWith('**') ? (
                <span dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
              ) : (
                <>• {item}</>
              )}
            </li>
          ))}
        </ul>
      </div>
    ))}
    {section.additionalContent && (
      <p className="text-rose-700 dark:text-rose-300 leading-relaxed mt-3">{section.additionalContent}</p>
    )}
  </div>
);

// Terms of Service Content Component
export const TermsOfServiceContent = () => (
  <div className="space-y-6 text-sm">
    {termsOfServiceData.sections.map((section, index) => (
      <LegalSectionComponent key={index} section={section} />
    ))}
    
    <div className="bg-rose-50 dark:bg-rose-900/20 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-rose-800 dark:text-rose-200 mb-3 flex items-center gap-2">
        <Mail className="w-5 h-5" />
        Contact Information
      </h3>
      <div className="space-y-2 text-rose-700 dark:text-rose-300">
        <p className="flex items-center gap-2">
          <Mail className="w-4 h-4" />
          {termsOfServiceData.contact.email}
        </p>
        <p className="flex items-center gap-2">
          <Phone className="w-4 h-4" />
          {termsOfServiceData.contact.phone}
        </p>
        <p className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          {termsOfServiceData.contact.address}
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
        <strong>Effective Date:</strong> {privacyPolicyData.effectiveDate} | 
        {privacyPolicyData.introduction}
      </p>
    </div>

    {privacyPolicyData.sections.map((section, index) => (
      <LegalSectionComponent key={index} section={section} />
    ))}
    
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
            {privacyPolicyData.contact.email}
          </p>
          <p className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            {privacyPolicyData.contact.phone}
          </p>
          <p className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {privacyPolicyData.contact.address}
          </p>
        </div>
      </div>
    </div>
  </div>
);