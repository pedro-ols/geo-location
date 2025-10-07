"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./page1.module.css";

const TOKEN = proccess.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function Page1() {
    const [localizacao, setLocalizacao] = useState(null);
    const mapaRef = useRef(null);

    useEffect(() => {
        const link = document.createElement("link");
        link.href = "https://api.mapbox.com/mapbox-gl-js/v3.0.0/mapbox-gl.css";
        link.rel = "stylesheet";
        document.head.appendChild(link);

        const script = document.createElement("script");
        script.src = "https://api.mapbox.com/mapbox-gl-js/v3.0.0/mapbox-gl.js";

        script.onload = () => {
            navigator.geolocation.getCurrentPosition((pos) => {
                const coords = [pos.coords.longitude, pos.coords.latitude];
                setLocalizacao(coords);

                mapbox.accessToken = TOKEN;
                const map = new mapbox.Map({
                    container: mapaRef.current,
                    style: "mapbox://styles/mapbox/streets-v11",
                    center: coords,
                    zoom: 10,
                });
            });
        }
    }, []);


    return (
        <div>
            <h1>📍 Geolocalização</h1>
        </div>
    );

}
