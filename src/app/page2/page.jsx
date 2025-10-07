"use client";

// Importa hooks do React e estilos CSS
import { useEffect, useRef, useState } from "react";
import styles from "./page2.module.css";
import axios from "axios";

// Token de acesso da API Mapbox
const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function TracarRota() {
    // Estado para coordenadas de origem (localização atual)
    const [origem, setOrigem] = useState(null);
    // Estado para o endereço de destino digitado pelo usuário
    const [destino, setDestino] = useState("");
    // Estado para indicar se está carregando a busca de rota
    const [carregando, setCarregando] = useState(false);

    // Referências para elementos do DOM e objetos do Mapbox
    const mapaRef = useRef(null); // Referência ao container do mapa
    const mapRef = useRef(null); // Referência ao objeto do mapa
    const marcadorDestinoRef = useRef(null); // Referência ao marcador do destino

    // Efeito para carregar Mapbox e inicializar o mapa na localização atual
    useEffect(() => {
        // Adiciona o CSS do Mapbox dinamicamente
        const link = document.createElement("link"); // Cria elemento link
        link.href = "https://api.mapbox.com/mapbox-gl-js/v3.0.0/mapbox-gl.css"; // URL do CSS
        link.rel = "stylesheet"; // Define como folha de estilo
        document.head.appendChild(link); // Adiciona o link ao head

        // Adiciona o script JS do Mapbox dinamicamente
        const script = document.createElement("script");
        script.src = "https://api.mapbox.com/mapbox-gl-js/v3.0.0/mapbox-gl.js";
        script.onload = () => {
            // Obtém a localização atual do usuário
            navigator.geolocation.getCurrentPosition(
                ({ coords }) => {
                    const origemCoords = [coords.longitude, coords.latitude]; // Formata como [lng, lat]
                    setOrigem(origemCoords); // Salva a origem no estado

                    // Inicializa o mapa centralizado na origem
                    mapboxgl.accessToken = TOKEN;
                    const map = new mapboxgl.Map({
                        container: mapaRef.current,
                        style: "mapbox://styles/mapbox/streets-v12",
                        center: origemCoords,
                        zoom: 14,
                    });

                    // Adiciona marcador vermelho na origem
                    new mapboxgl.Marker({ color: "#FF0000" }).setLngLat(origemCoords).addTo(map); // Marcador de origem
                    mapRef.current = map; // Salva o objeto do mapa na referência
                },
                () => alert("Erro ao obter localização") // Erro ao obter localização
            );
        };
        document.body.appendChild(script); // Adiciona o script ao body
    }, []);

    // Função para buscar rota entre origem e destino
    const buscarRota = async () => {
        if (!destino || !origem) return; // Verifica se destino e origem estão definidos
        setCarregando(true); // Indica que está carregando
        try {
            // Geocodifica o endereço de destino para obter coordenadas
            const geoRes = await axios.get(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
                    destino
                )}.json`,
                { params: { access_token: TOKEN } }
            );
            const geoData = geoRes.data; // Dados de geocodificação

            if (!geoData.features.length) return alert("Endereço não encontrado"); // Verifica se encontrou o endereço

            // Obtém as coordenadas do primeiro resultado
            const destCoords = geoData.features[0].geometry.coordinates;

            // Busca a rota entre origem e destino
            const rotaRes = await axios.get(
                `https://api.mapbox.com/directions/v5/mapbox/driving/${origem[0]},${origem[1]};${destCoords[0]},${destCoords[1]}`,
                {
                    params: {
                        geometries: "geojson",
                        access_token: TOKEN,
                    },
                }
            );
            const rotaData = rotaRes.data; // Dados da rota
            const linha = rotaData.routes[0].geometry; // Geometria da rota
            const map = mapRef.current; // Objeto do mapa

            // Remove rota anterior se existir
            if (map.getSource("rota")) {
                map.removeLayer("linha-rota"); // Remove camada da linha
                map.removeSource("rota"); // Remove fonte da rota
            }
            // Remove marcador de destino anterior se existir
            marcadorDestinoRef.current?.remove();

            // Adiciona nova rota ao mapa
            map.addSource("rota", { type: "geojson", data: { type: "Feature", geometry: linha } });
            map.addLayer({
                id: "linha-rota",
                type: "line",
                source: "rota",
                paint: { "line-color": "#0000FF", "line-width": 4 },
            });

            // Adiciona marcador verde no destino
            marcadorDestinoRef.current = new mapboxgl.Marker({ color: "#00FF00" })
                .setLngLat(destCoords)
                .addTo(map); // Marcador de destino

            // Ajusta o mapa para mostrar toda a rota
            const bounds = linha.coordinates.reduce(
                (b, c) => b.extend(c),
                new mapboxgl.LngLatBounds(linha.coordinates[0], linha.coordinates[0])
            );
            map.fitBounds(bounds, { padding: 50 }); // Ajusta o mapa para caber a rota
        } catch (error) {
            console.error(error);
            alert("Erro ao buscar rota"); // Erro ao buscar rota
        } finally {
            setCarregando(false); // Finaliza o carregamento
        }
    };

    // Função para resetar o mapa e os campos
    const resetar = () => {
        setDestino("");
        const map = mapRef.current;
        // Remove rota do mapa se existir
        if (map?.getSource("rota")) {
            map.removeLayer("linha-rota"); // Remove camada da linha
            map.removeSource("rota"); // Remove fonte da rota
        }
        // Remove marcador de destino se existir
        marcadorDestinoRef.current?.remove();
        marcadorDestinoRef.current = null; // Limpa a referência do marcador
        // Centraliza o mapa na origem
        if (origem) map.flyTo({ center: origem, zoom: 14 });
    };

    // Renderização do componente
    return (
        <div className={styles.container}>
            {/* Container do mapa */}
            <div ref={mapaRef} className={styles.mapa} />
            {/* Painel de controle */}
            <div className={styles.painel}>
                <h2>🗺️ Traçar Rota</h2>
                {/* Campo para digitar o destino */}
                <input
                    type="text"
                    placeholder="Digite o destino..."
                    value={destino}
                    onChange={(e) => setDestino(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && buscarRota()}
                    disabled={carregando}
                    className={styles.input}
                />
                {/* Botões de buscar e resetar */}
                <div className={styles.botoes}>
                    <button
                        onClick={buscarRota}
                        disabled={carregando || !destino}
                        className={styles.btnBuscar}>
                        {carregando ? "Buscando..." : "Buscar"}
                    </button>
                    <button onClick={resetar} className={styles.btnResetar}>
                        Resetar
                    </button>
                </div>
            </div>
        </div>
    );
}
