// components/checkout/ShippingForm.tsx
import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCheckoutStore } from '../../../../lib/checkout/useCheckoutStore';
import { useAuthStore } from '../../../../lib/auth/useAuthStore';
import { useUserAddresses, mapFirestoreToCheckout, type CheckoutAddress } from '../../../../lib/profile/useUserAddresses';
import { MapPin, Plus, Check } from 'lucide-react';
import { z } from 'zod';

// Updated form schema without email
const formSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  address1: z.string().min(1, 'Address is required'),
  address2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(5, 'Valid ZIP code is required'),
  country: z.string(),
});

type FormData = z.infer<typeof formSchema>;

const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' }
];

export const ShippingForm = () => {
  const { user } = useAuthStore();
  const { shippingAddress, setShippingAddress, setStep } = useCheckoutStore();
  const { addresses, loading: addressesLoading } = useUserAddresses(user?.uid || null);
  
  const [addressMode, setAddressMode] = useState<'select' | 'new'>('select');
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: shippingAddress.firstName || '',
      lastName: shippingAddress.lastName || '',
      phone: shippingAddress.phone || '',
      address1: shippingAddress.address1 || '',
      address2: shippingAddress.address2 || '',
      city: shippingAddress.city || '',
      state: shippingAddress.state || '',
      zipCode: shippingAddress.zipCode || '',
      country: shippingAddress.country || 'US',
    },
    mode: 'onChange'
  });

  // Auto-select first/default address if available
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId && addressMode === 'select') {
      const defaultAddress = addresses.find(addr => addr.isDefault) || addresses[0];
      handleAddressSelect(defaultAddress.id);
    }
  }, [addresses, selectedAddressId, addressMode]);

  const handleAddressSelect = (addressId: string) => {
    const address = addresses.find(addr => addr.id === addressId);
    if (address) {
      setSelectedAddressId(addressId);
      const checkoutAddress = mapFirestoreToCheckout(address);
      
      // Update form values
      Object.entries(checkoutAddress).forEach(([key, value]) => {
        setValue(key as keyof FormData, value, { shouldValidate: true });
      });
    }
  };

  const handleNewAddress = () => {
    setAddressMode('new');
    setSelectedAddressId(null);
    reset({
      firstName: '',
      lastName: '',
      phone: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US',
    });
  };

  const handleBackToSelect = () => {
    setAddressMode('select');
    if (addresses.length > 0) {
      const defaultAddress = addresses.find(addr => addr.isDefault) || addresses[0];
      handleAddressSelect(defaultAddress.id);
    }
  };

  const onSubmit: SubmitHandler<FormData> = (data) => {
    // Add the user's email to the shipping data
    const shippingData = {
      ...data,
      email: user?.email || '',
    };
    
    setShippingAddress(shippingData);
    setStep(2);
  };

  return (
    <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl text-rose-900 dark:text-rose-100">
          Shipping Information
        </CardTitle>
        <p className="text-rose-600 dark:text-rose-400 text-sm">
          Please select or provide your shipping details for delivery.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Address Selection */}
        {addresses.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-rose-900 dark:text-rose-100">
                Saved Addresses
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addressMode === 'select' ? handleNewAddress : handleBackToSelect}
                className="border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300"
              >
                {addressMode === 'select' ? (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add New
                  </>
                ) : (
                  <>
                    <MapPin className="w-4 h-4 mr-2" />
                    Use Saved
                  </>
                )}
              </Button>
            </div>

            {addressMode === 'select' && (
              <div className="grid gap-3">
                {addressesLoading ? (
                  <div className="text-center py-4 text-rose-600 dark:text-rose-400">
                    Loading saved addresses...
                  </div>
                ) : (
                  addresses.map((address) => (
                    <div
                      key={address.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedAddressId === address.id
                          ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                          : 'border-rose-200 dark:border-rose-700 hover:border-rose-300 dark:hover:border-rose-600'
                      }`}
                      onClick={() => handleAddressSelect(address.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-rose-900 dark:text-rose-100">
                              {address.firstName} {address.lastName}
                            </h4>
                            {address.isDefault && (
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                Default
                              </Badge>
                            )}
                            <Badge variant="secondary" className="bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200">
                              {address.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-rose-700 dark:text-rose-300">
                            {address.addressLine1}
                            {address.addressLine2 && `, ${address.addressLine2}`}
                          </p>
                          <p className="text-sm text-rose-700 dark:text-rose-300">
                            {address.city}, {address.state} {address.zipCode}
                          </p>
                          <p className="text-sm text-rose-600 dark:text-rose-400">
                            {address.phone}
                          </p>
                        </div>
                        {selectedAddressId === address.id && (
                          <Check className="w-5 h-5 text-pink-600 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* New Address Form */}
        {(addressMode === 'new' || addresses.length === 0) && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-rose-600" />
              <h3 className="text-lg font-medium text-rose-900 dark:text-rose-100">
                {addresses.length === 0 ? 'Shipping Address' : 'New Address'}
              </h3>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-rose-700 dark:text-rose-300 mb-1">
                  First Name *
                </label>
                <input
                  {...register('firstName')}
                  className="w-full px-3 py-2 border border-rose-300 dark:border-rose-700 rounded-lg bg-white/50 dark:bg-rose-800/50 text-rose-900 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-colors"
                  placeholder="John"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-rose-700 dark:text-rose-300 mb-1">
                  Last Name *
                </label>
                <input
                  {...register('lastName')}
                  className="w-full px-3 py-2 border border-rose-300 dark:border-rose-700 rounded-lg bg-white/50 dark:bg-rose-800/50 text-rose-900 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-colors"
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-rose-700 dark:text-rose-300 mb-1">
                Phone Number *
              </label>
              <input
                {...register('phone')}
                type="tel"
                className="w-full px-3 py-2 border border-rose-300 dark:border-rose-700 rounded-lg bg-white/50 dark:bg-rose-800/50 text-rose-900 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-colors"
                placeholder="(555) 123-4567"
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-rose-700 dark:text-rose-300 mb-1">
                Street Address *
              </label>
              <input
                {...register('address1')}
                className="w-full px-3 py-2 border border-rose-300 dark:border-rose-700 rounded-lg bg-white/50 dark:bg-rose-800/50 text-rose-900 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-colors"
                placeholder="123 Main Street"
              />
              {errors.address1 && (
                <p className="text-red-500 text-xs mt-1">{errors.address1.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-rose-700 dark:text-rose-300 mb-1">
                Apartment, suite, etc. (optional)
              </label>
              <input
                {...register('address2')}
                className="w-full px-3 py-2 border border-rose-300 dark:border-rose-700 rounded-lg bg-white/50 dark:bg-rose-800/50 text-rose-900 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-colors"
                placeholder="Apt 4B"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-rose-700 dark:text-rose-300 mb-1">
                  City *
                </label>
                <input
                  {...register('city')}
                  className="w-full px-3 py-2 border border-rose-300 dark:border-rose-700 rounded-lg bg-white/50 dark:bg-rose-800/50 text-rose-900 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-colors"
                  placeholder="New York"
                />
                {errors.city && (
                  <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-rose-700 dark:text-rose-300 mb-1">
                  State *
                </label>
                <select
                  {...register('state')}
                  className="w-full px-3 py-2 border border-rose-300 dark:border-rose-700 rounded-lg bg-white/50 dark:bg-rose-800/50 text-rose-900 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-colors"
                >
                  <option value="">Select State</option>
                  {US_STATES.map(state => (
                    <option key={state.value} value={state.value}>
                      {state.label}
                    </option>
                  ))}
                </select>
                {errors.state && (
                  <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-rose-700 dark:text-rose-300 mb-1">
                  ZIP Code *
                </label>
                <input
                  {...register('zipCode')}
                  className="w-full px-3 py-2 border border-rose-300 dark:border-rose-700 rounded-lg bg-white/50 dark:bg-rose-800/50 text-rose-900 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-colors"
                  placeholder="10001"
                />
                {errors.zipCode && (
                  <p className="text-red-500 text-xs mt-1">{errors.zipCode.message}</p>
                )}
              </div>
            </div>

            {/* Hidden country field */}
            <input type="hidden" {...register('country')} />

            <div className="pt-4">
              <Button
                type="submit"
                disabled={!isValid}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                Continue to Shipping Options
              </Button>
            </div>
          </form>
        )}

        {/* Submit button for address selection mode */}
        {addressMode === 'select' && selectedAddressId && (
          <div className="pt-4">
            <Button
              onClick={handleSubmit(onSubmit)}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-3 transition-all duration-300"
            >
              Continue to Shipping Options
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};