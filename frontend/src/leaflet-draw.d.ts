import 'leaflet';
import 'leaflet-draw';

declare module 'leaflet' {
  namespace Control {
    class Draw extends Control {
      constructor(options?: DrawOptions);
    }

    interface DrawOptions {
      position?: ControlPosition;
      draw?: DrawOptions.Draw;
      edit?: DrawOptions.Edit;
    }

    namespace DrawOptions {
      interface Draw {
        polyline?: boolean | PolylineOptions;
        polygon?: boolean | PolygonOptions;
        rectangle?: boolean | RectangleOptions;
        circle?: boolean | CircleOptions;
        marker?: boolean | MarkerOptions;
        circlemarker?: boolean | CircleMarkerOptions;
      }

      interface Edit {
        featureGroup: FeatureGroup;
        edit?: boolean | EditOptions;
        remove?: boolean | RemoveOptions;
      }

      interface PolylineOptions {
        allowIntersection?: boolean;
        drawError?: {
          color?: string;
          timeout?: number;
          message?: string;
        };
        guidelineDistance?: number;
        metric?: boolean;
        zIndexOffset?: number;
        shapeOptions?: PathOptions;
        repeatMode?: boolean;
      }

      interface PolygonOptions extends PolylineOptions {
        showArea?: boolean;
      }

      interface RectangleOptions {
        shapeOptions?: PathOptions;
        repeatMode?: boolean;
      }

      interface CircleOptions {
        shapeOptions?: PathOptions;
        repeatMode?: boolean;
      }

      interface MarkerOptions {
        icon?: Icon | DivIcon;
        zIndexOffset?: number;
        repeatMode?: boolean;
      }

      interface CircleMarkerOptions {
        stroke?: boolean;
        color?: string;
        weight?: number;
        opacity?: number;
        fill?: boolean;
        fillColor?: string;
        fillOpacity?: number;
        radius?: number;
        repeatMode?: boolean;
      }

      interface EditOptions {
        selectedPathOptions?: PathOptions;
      }

      interface RemoveOptions {
        removeAll?: boolean;
      }
    }
  }
}