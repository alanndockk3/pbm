// lib/checkout/validation.ts
import { z } from 'zod';

export const shippingAddressSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required').optional(), // Made optional since we get from user
  phone: z.string().min(10, 'Valid phone number is required'),
  address1: z.string().min(1, 'Address is required'),
  address2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(5, 'Valid ZIP code is required'),
  country: z.string().default('US')
});

export const billingAddressSchema = z.object({
  sameAsShipping: z.boolean(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  address1: z.string().optional(),
  address2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional()
}).refine((data) => {
  if (data.sameAsShipping) return true;
  
  // If not same as shipping, all fields are required
  return !!(
    data.firstName && 
    data.lastName && 
    data.email && 
    data.address1 && 
    data.city && 
    data.state && 
    data.zipCode
  );
}, {
  message: 'All billing address fields are required when different from shipping'
});