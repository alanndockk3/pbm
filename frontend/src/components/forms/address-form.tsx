// components/forms/AddressForm.tsx
'use client'

import React, { useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Save, X, Loader2 } from "lucide-react";
import FormInput from './form-input';
import FormSelect from './form-select';
import AddressAutocompleteInput, { AddressComponents} from './address-autocomplete';
import { AddressFormData } from '../../../lib/profile/useAddressStore';

const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' }
];

interface AddressFormProps {
  formData: AddressFormData;
  onFieldChange: (field: string, value: string | boolean) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isLoading: boolean;
  submitLabel: string;
  isValid: boolean;
}

const AddressForm = React.memo(({ 
  formData, 
  onFieldChange, 
  onSubmit, 
  onCancel, 
  isLoading, 
  submitLabel,
  isValid
}: AddressFormProps) => {
  const stateOptions = [
    { value: '', label: 'Select State' },
    ...US_STATES.map(state => ({ value: state.code, label: state.name }))
  ];

  const typeOptions = [
    { value: 'home', label: 'Home' },
    { value: 'work', label: 'Work' },
    { value: 'other', label: 'Other' }
  ];

  // Handle address autocomplete selection
  const handleAddressSelect = useCallback((addressComponents: AddressComponents) => {
    // Auto-fill the form with the selected address components
    if (addressComponents.streetNumber && addressComponents.streetName) {
      onFieldChange('addressLine1', `${addressComponents.streetNumber} ${addressComponents.streetName}`);
    } else if (addressComponents.streetName) {
      onFieldChange('addressLine1', addressComponents.streetName);
    }
    
    if (addressComponents.city) {
      onFieldChange('city', addressComponents.city);
    }
    if (addressComponents.state) {
      onFieldChange('state', addressComponents.state);
    }
    if (addressComponents.zipCode) {
      onFieldChange('zipCode', addressComponents.zipCode);
    }
  }, [onFieldChange]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  }, [onSubmit]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <FormInput
          label="First Name"
          value={formData.firstName}
          onChange={(value) => onFieldChange('firstName', value)}
          required
        />
        <FormInput
          label="Last Name"
          value={formData.lastName}
          onChange={(value) => onFieldChange('lastName', value)}
          required
        />
        
        {/* Replace regular FormInput with AddressAutocompleteInput */}
        <AddressAutocompleteInput
          label="Address Line 1"
          value={formData.addressLine1}
          onChange={(value) => onFieldChange('addressLine1', value)}
          onAddressSelect={handleAddressSelect}
          placeholder="Start typing your address..."
          className="md:col-span-2"
          disabled={isLoading}
          required
        />
        
        <FormInput
          label="Address Line 2"
          value={formData.addressLine2 || ''}
          onChange={(value) => onFieldChange('addressLine2', value)}
          placeholder="Apartment, suite, unit, building, floor, etc."
          className="md:col-span-2"
        />
        <FormInput
          label="City"
          value={formData.city}
          onChange={(value) => onFieldChange('city', value)}
          required
        />
        <FormSelect
          label="State"
          value={formData.state}
          onChange={(value) => onFieldChange('state', value)}
          options={stateOptions}
          required
        />
        <FormInput
          label="ZIP Code"
          value={formData.zipCode}
          onChange={(value) => onFieldChange('zipCode', value)}
          required
        />
        <FormInput
          label="Phone Number"
          value={formData.phone || ''}
          onChange={(value) => onFieldChange('phone', value)}
          type="tel"
          placeholder="(555) 123-4567"
        />
        <FormSelect
          label="Address Type"
          value={formData.type}
          onChange={(value) => onFieldChange('type', value)}
          options={typeOptions}
          className="md:col-span-2"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="default-address"
          checked={formData.isDefault || false}
          onChange={(e) => onFieldChange('isDefault', e.target.checked)}
          className="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-500"
          disabled={isLoading}
        />
        <label htmlFor="default-address" className="text-sm font-medium text-rose-900 dark:text-rose-100">
          Set as default shipping address
        </label>
      </div>

      <div className="flex gap-2 pt-4">
        <Button 
          type="submit"
          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white flex-1"
          disabled={isLoading || !isValid}
        >
          {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          {submitLabel}
        </Button>
        <Button 
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300"
          disabled={isLoading}
        >
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </div>
    </form>
  );
});

AddressForm.displayName = 'AddressForm';

export default AddressForm;