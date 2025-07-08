// pages/dashboard/profile/shipping-address/page.tsx
'use client'

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Footer from '@/components/footer';
import { 
  MapPin, 
  ArrowLeft,
  Plus,
  Loader2
} from "lucide-react";
import { useAuthStore } from '../../../../lib/auth/useAuthStore';
import { useAddressStore, AddressFormData } from '../../../../lib/profile/useAddressStore';

// Import the new components
import FormInput from '@/components/forms/form-input';
import FormSelect from '@/components/forms/form-select';
import AddressForm from '@/components/forms/address-form';
import AddressCard from '@/components/account/address/AddressCard';
import Message from '@/components/ui/message';

export default function ShippingAddressPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const {
    addresses,
    isLoading,
    error,
    editingId,
    addForm,
    editForms,
    loadAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    setAddForm,
    resetAddForm,
    setEditForm,
    resetEditForm,
    startEditing,
    stopEditing,
    clearError
  } = useAddressStore();

  useEffect(() => {
    if (user?.uid) {
      loadAddresses(user.uid);
    }
  }, [user?.uid, loadAddresses]);

  const showSuccessMessage = useCallback(() => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  }, []);

  // Fix: Ensure this returns a boolean
  const isFormValid = useCallback((formData: AddressFormData): boolean => {
    return !!(formData.firstName && formData.lastName && formData.addressLine1 && 
           formData.city && formData.state && formData.zipCode);
  }, []);

  const handleAddFieldChange = useCallback((field: string, value: string | boolean) => {
    setAddForm({ [field]: value });
  }, [setAddForm]);

  const handleEditFieldChange = useCallback((addressId: string, field: string, value: string | boolean) => {
    setEditForm(addressId, { [field]: value });
  }, [setEditForm]);

  const handleAddAddress = useCallback(async () => {
    if (!user?.uid) return;
    const success = await addAddress(user.uid);
    if (success) {
      setShowAddForm(false);
      showSuccessMessage();
    }
  }, [user?.uid, addAddress, showSuccessMessage]);

  const handleUpdateAddress = useCallback(async (addressId: string) => {
    if (!user?.uid) return;
    const success = await updateAddress(user.uid, addressId);
    if (success) {
      showSuccessMessage();
    }
  }, [user?.uid, updateAddress, showSuccessMessage]);

  const handleDeleteAddress = useCallback(async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    if (!user?.uid) return;
    const success = await deleteAddress(user.uid, addressId);
    if (success) {
      showSuccessMessage();
    }
  }, [user?.uid, deleteAddress, showSuccessMessage]);

  const handleSetDefaultAddress = useCallback(async (addressId: string) => {
    if (!user?.uid) return;
    const success = await setDefaultAddress(user.uid, addressId);
    if (success) {
      showSuccessMessage();
    }
  }, [user?.uid, setDefaultAddress, showSuccessMessage]);

  const handleCancelAdd = useCallback(() => {
    resetAddForm();
    setShowAddForm(false);
  }, [resetAddForm]);

  const handleCancelEdit = useCallback((addressId: string) => {
    resetEditForm(addressId);
    stopEditing();
    clearError();
  }, [resetEditForm, stopEditing, clearError]);

  if (isLoading && addresses.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-rose-950 dark:via-pink-950 dark:to-purple-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-pink-500 mx-auto mb-4" />
          <p className="text-rose-700 dark:text-rose-300">Loading your addresses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-rose-950 dark:via-pink-950 dark:to-purple-950">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col gap-4">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/dashboard')}
              className="text-rose-700 dark:text-rose-300 hover:text-rose-900 dark:hover:text-rose-100 self-start"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-rose-900 dark:text-rose-100">Shipping Addresses</h1>
              <p className="text-rose-600 dark:text-rose-400">Manage your delivery addresses</p>
            </div>
          </div>
          
          <Button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
            disabled={isLoading}
          >
            <Plus className="w-4 h-4 mr-2" />
            {showAddForm ? 'Cancel' : 'Add Address'}
          </Button>
        </div>

        {/* Messages */}
        {showSuccess && (
          <Message 
            type="success" 
            message="Address updated successfully!" 
          />
        )}

        {error && (
          <Message 
            type="error" 
            message={error} 
            onClose={clearError}
          />
        )}
      </header>

      <div className="container mx-auto px-4 pb-12">
        {/* Add Address Form */}
        {showAddForm && (
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm mb-6">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-rose-900 dark:text-rose-100 mb-4">Add New Address</h2>
              <AddressForm
                formData={addForm}
                onFieldChange={handleAddFieldChange}
                onSubmit={handleAddAddress}
                onCancel={handleCancelAdd}
                isLoading={isLoading}
                submitLabel="Save Address"
                isValid={isFormValid(addForm)}
              />
            </CardContent>
          </Card>
        )}

        {/* Address List */}
        {addresses.length === 0 && !showAddForm ? (
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm text-center py-12">
            <CardContent>
              <MapPin className="w-16 h-16 text-rose-300 dark:text-rose-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-rose-900 dark:text-rose-100 mb-2">
                No addresses added yet
              </h3>
              <p className="text-rose-600 dark:text-rose-400 mb-6">
                Add your first shipping address to get started with orders
              </p>
              <Button 
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Address
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {addresses.map((address) => {
              const isEditing = editingId === address.id;
              const formData = editForms[address.id];
              
              return (
                <Card key={address.id} className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
                  <CardContent className="p-6">
                    {isEditing && formData ? (
                      <div>
                        <h2 className="text-xl font-semibold text-rose-900 dark:text-rose-100 mb-4">Edit Address</h2>
                        <AddressForm
                          formData={formData}
                          onFieldChange={(field, value) => handleEditFieldChange(address.id, field, value)}
                          onSubmit={() => handleUpdateAddress(address.id)}
                          onCancel={() => handleCancelEdit(address.id)}
                          isLoading={isLoading}
                          submitLabel="Update Address"
                          isValid={isFormValid(formData)}
                        />
                      </div>
                    ) : (
                      <AddressCard
                        address={address}
                        isEditing={isEditing}
                        onEdit={() => startEditing(address)}
                        onSetDefault={() => handleSetDefaultAddress(address.id)}
                        onDelete={() => handleDeleteAddress(address.id)}
                      />
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}