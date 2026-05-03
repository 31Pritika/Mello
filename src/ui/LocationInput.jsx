import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = "YOUR_MAPBOX_TOKEN";

export default function LocationInput({ setLocation }) {
  const inputRef = useRef(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://api.mapbox.com/search-js/v1.0.0-beta.19/web.js";
    script.onload = () => {
      const mapboxSearch = window.mapboxsearch;

      const searchBox = new mapboxSearch.SearchBox({
        accessToken: mapboxgl.accessToken,
        options: {
          types: "place,postcode,address",
        },
      });

      searchBox.addEventListener("retrieve", (e) => {
        const feature = e.detail.features[0];

        const context = feature.context || [];

        const get = (type) =>
          context.find((c) => c.id.includes(type))?.text;

        setLocation({
          city: get("place"),
          state: get("region"),
          country: get("country"),
          full: feature.place_name,
        });
      });

      searchBox.attach(inputRef.current);
    };

    document.body.appendChild(script);
  }, []);

  import { useEffect, useRef } from "react";

export default function LocationInput({ setLocation }) {
  const inputRef = useRef(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://api.mapbox.com/search-js/v1.0.0-beta.19/web.js";
    script.async = true;

    script.onload = () => {
      const mapboxsearch = window.mapboxsearch;

      const searchBox = new mapboxsearch.SearchBox({
        accessToken: import.meta.env.VITE_MAPBOX_TOKEN,
        options: {
          types: "place,region,country",
        },
      });

      searchBox.addEventListener("retrieve", (e) => {
        const feature = e.detail.features[0];

        const context = feature.context || [];

        const get = (type) =>
          context.find((c) => c.id.includes(type))?.text;

        const locationData = {
          city: get("place") || "",
          state: get("region") || "",
          country: get("country") || "",
          full: feature.place_name,
        };

        setLocation(locationData);
      });

      searchBox.attach(inputRef.current);
    };

    document.body.appendChild(script);
  }, []);

  return (
        <input
        ref={inputRef}
        placeholder="Enter your location"
        style={{
            width: "100%",
            padding: "12px 14px",
            background: "#1C1512",
            border: "1px solid rgba(196,84,122,0.15)",
            borderRadius: "2px",
            color: "#EFECE6",
            fontSize: "0.9rem",
            outline: "none",
            marginBottom: "1rem",
        }}
        />
    );
    }
}