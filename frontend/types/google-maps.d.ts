// types/google-maps.d.ts
// Create this file in your project root

export {};

declare global {
  interface Window {
    google: typeof google;
    initMap?: () => void;
  }

  namespace google {
    namespace maps {
      class Map {
        constructor(mapDiv: Element, opts?: MapOptions);
      }

      class LatLng {
        constructor(lat: number, lng: number);
        lat(): number;
        lng(): number;
      }

      interface MapOptions {
        center?: LatLng | LatLngLiteral;
        zoom?: number;
        mapTypeId?: MapTypeId;
      }

      interface LatLngLiteral {
        lat: number;
        lng: number;
      }

      enum MapTypeId {
        HYBRID = 'hybrid',
        ROADMAP = 'roadmap',
        SATELLITE = 'satellite',
        TERRAIN = 'terrain'
      }

      interface LatLngBounds {
        contains(latLng: LatLng | LatLngLiteral): boolean;
        extend(point: LatLng | LatLngLiteral): LatLngBounds;
        getCenter(): LatLng;
        getNorthEast(): LatLng;
        getSouthWest(): LatLng;
      }

      namespace places {
        class Autocomplete {
          constructor(inputField: HTMLInputElement, opts?: AutocompleteOptions);
          addListener(eventName: string, handler: () => void): MapsEventListener;
          getPlace(): PlaceResult;
          setBounds(bounds: LatLngBounds): void;
          setComponentRestrictions(restrictions: ComponentRestrictions): void;
          setFields(fields: string[]): void;
          setOptions(options: AutocompleteOptions): void;
          setTypes(types: string[]): void;
        }

        class AutocompleteService {
          constructor();
          getPlacePredictions(
            request: AutocompletionRequest,
            callback: (predictions: AutocompletePrediction[] | null, status: PlacesServiceStatus) => void
          ): void;
        }

        class PlacesService {
          constructor(attrContainer: HTMLDivElement | google.maps.Map);
          getDetails(
            request: PlaceDetailsRequest,
            callback: (result: PlaceResult | null, status: PlacesServiceStatus) => void
          ): void;
        }

        interface AutocompletionRequest {
          input: string;
          bounds?: LatLngBounds;
          componentRestrictions?: ComponentRestrictions;
          location?: LatLng;
          offset?: number;
          radius?: number;
          sessionToken?: AutocompleteSessionToken;
          types?: string[];
        }

        interface AutocompletePrediction {
          place_id: string;
          description: string;
          structured_formatting?: {
            main_text: string;
            main_text_matched_substrings?: SubstringMatch[];
            secondary_text?: string;
            secondary_text_matched_substrings?: SubstringMatch[];
          };
          terms?: PredictionTerm[];
          types: string[];
        }

        interface PlaceDetailsRequest {
          placeId: string;
          fields?: string[];
          language?: string;
          region?: string;
          sessionToken?: AutocompleteSessionToken;
        }

        interface SubstringMatch {
          length: number;
          offset: number;
        }

        interface PredictionTerm {
          offset: number;
          value: string;
        }

        class AutocompleteSessionToken {
          constructor();
        }

        enum PlacesServiceStatus {
          INVALID_REQUEST = 'INVALID_REQUEST',
          NOT_FOUND = 'NOT_FOUND',
          OK = 'OK',
          OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
          REQUEST_DENIED = 'REQUEST_DENIED',
          UNKNOWN_ERROR = 'UNKNOWN_ERROR',
          ZERO_RESULTS = 'ZERO_RESULTS'
        }

        interface AutocompleteOptions {
          bounds?: LatLngBounds;
          componentRestrictions?: ComponentRestrictions;
          fields?: string[];
          strictBounds?: boolean;
          types?: string[];
        }

        interface ComponentRestrictions {
          country?: string | string[];
        }

        interface PlaceResult {
          address_components?: AddressComponent[];
          adr_address?: string;
          business_status?: BusinessStatus;
          formatted_address?: string;
          formatted_phone_number?: string;
          geometry?: PlaceGeometry;
          html_attributions?: string[];
          icon?: string;
          icon_background_color?: string;
          icon_mask_base_uri?: string;
          international_phone_number?: string;
          name?: string;
          opening_hours?: PlaceOpeningHours;
          photos?: PlacePhoto[];
          place_id?: string;
          plus_code?: PlusCode;
          price_level?: number;
          rating?: number;
          reviews?: PlaceReview[];
          types?: string[];
          url?: string;
          user_ratings_total?: number;
          utc_offset_minutes?: number;
          vicinity?: string;
          website?: string;
        }

        interface AddressComponent {
          long_name: string;
          short_name: string;
          types: string[];
        }

        interface PlaceGeometry {
          location?: LatLng;
          viewport?: LatLngBounds;
        }

        enum BusinessStatus {
          CLOSED_PERMANENTLY = 'CLOSED_PERMANENTLY',
          CLOSED_TEMPORARILY = 'CLOSED_TEMPORARILY',
          OPERATIONAL = 'OPERATIONAL'
        }

        interface PlaceOpeningHours {
          isOpen(): boolean;
          periods: PlaceOpeningHoursPeriod[];
          weekday_text: string[];
        }

        interface PlaceOpeningHoursPeriod {
          close?: PlaceOpeningHoursTime;
          open: PlaceOpeningHoursTime;
        }

        interface PlaceOpeningHoursTime {
          day: number;
          time: string;
        }

        interface PlacePhoto {
          height: number;
          html_attributions: string[];
          width: number;
          getUrl(opts?: PhotoOptions): string;
        }

        interface PhotoOptions {
          maxHeight?: number;
          maxWidth?: number;
        }

        interface PlusCode {
          compound_code?: string;
          global_code: string;
        }

        interface PlaceReview {
          author_name: string;
          author_url?: string;
          language: string;
          profile_photo_url: string;
          rating: number;
          relative_time_description: string;
          text: string;
          time: number;
        }
      }

      namespace event {
        interface MapsEventListener {
          remove(): void;
        }

        function addListener(
          instance: any,
          eventName: string,
          handler: (...args: any[]) => void
        ): MapsEventListener;

        function clearInstanceListeners(instance: any): void;
        function clearListeners(instance: any, eventName: string): void;
        function removeListener(listener: MapsEventListener): void;
      }
    }
  }
}