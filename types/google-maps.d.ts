import type { GoogleMap, MapMarker, PlacePicker } from "@googlemaps/extended-component-library"

declare global {
    namespace JSX {
        interface IntrinsicElements {
            "gmp-map": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
                center?: string | google.maps.LatLngLiteral;
                zoom?: number;
                "map-id"?: string;
            };
            "gmp-advanced-marker": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
                position?: string | google.maps.LatLngLiteral;
                title?: string;
            };
            "gmpx-place-picker": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
                placeholder?: string;
                "for-map"?: string;
            };
            "gmpx-api-loader": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
                key?: string;
                "solution-channel"?: string;
            };
        }
    }
}
