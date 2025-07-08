// components/addresses/AddressCard.tsx
'use client'

import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Edit3,
  Trash2,
  Home,
  Building,
  MapPin,
  Star
} from "lucide-react";
import { Address } from '../../../../lib/profile/useAddressStore';

interface AddressCardProps {
  address: Address;
  isEditing: boolean;
  onEdit: () => void;
  onSetDefault: () => void;
  onDelete: () => void;
}

const AddressCard = React.memo(({ 
  address, 
  isEditing, 
  onEdit, 
  onSetDefault, 
  onDelete 
}: AddressCardProps) => {
  const getAddressIcon = (type: string) => {
    switch (type) {
      case 'home': return Home;
      case 'work': return Building;
      default: return MapPin;
    }
  };

  const IconComponent = getAddressIcon(address.type);

  return (
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-800 dark:to-pink-700 rounded-lg flex items-center justify-center">
            <IconComponent className="w-5 h-5 text-pink-600 dark:text-pink-400" />
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant="secondary" 
              className="bg-rose-100 text-rose-600 dark:bg-rose-900 dark:text-rose-400 capitalize"
            >
              {address.type}
            </Badge>
            {address.isDefault && (
              <Badge className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
                <Star className="w-3 h-3 mr-1" />
                Default
              </Badge>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-semibold text-rose-900 dark:text-rose-100">
            {address.firstName} {address.lastName}
          </h3>
          <div className="text-rose-700 dark:text-rose-300 space-y-1">
            <p>{address.addressLine1}</p>
            {address.addressLine2 && <p>{address.addressLine2}</p>}
            <p>{address.city}, {address.state} {address.zipCode}</p>
            <p>{address.country}</p>
            {address.phone && <p>{address.phone}</p>}
          </div>
        </div>
      </div>
      
      <div className="flex flex-col gap-2 ml-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onEdit}
          className="border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300"
        >
          <Edit3 className="w-4 h-4 mr-2" />
          Edit
        </Button>
        
        {!address.isDefault && (
          <Button
            variant="outline"
            size="sm"
            onClick={onSetDefault}
            className="border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-300"
          >
            <Star className="w-4 h-4 mr-2" />
            Set Default
          </Button>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={onDelete}
          className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </Button>
      </div>
    </div>
  );
});

AddressCard.displayName = 'AddressCard';

export default AddressCard;