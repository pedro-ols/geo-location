"use client"; // Indica que este componente é executado no cliente (Next.js)

import { useEffect, useRef, useState } from "react"; // Importa hooks do React
// useRef: Permite criar referências mutáveis que persistem entre renderizações para acessar elementos DOM sem causar re-renderizações.
import styles from "./page1.module.css"; // Importa estilos CSS do módulo

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN; // Obtém o token do Mapbox das variáveis de ambiente

export default function Geolocalizacao() {
    const [localização, setLocalização] = useState(null); // Estado para armazenar a localização do usuário
    const mapaRef = useRef(null); // Referência para o elemento do mapa

    useEffect(() => {
        // Carrega o CSS do Mapbox dinamicamente
        const link = document.createElement("link"); // Cria elemento <link>
        link.href = "https://api.mapbox.com/mapbox-gl-js/v3.0.0/mapbox-gl.css"; // Define o endereço do CSS
        link.rel = "stylesheet"; // Define como folha de estilo
        document.head.appendChild(link); // Adiciona ao <head> do documento

        // Carrega o JavaScript do Mapbox dinamicamente
        const script = document.createElement("script"); // Cria elemento <script>
        script.src = "https://api.mapbox.com/mapbox-gl-js/v3.0.0/mapbox-gl.js"; // Define o endereço do JS
        script.onload = () => { // Executa quando o script é carregado
            // Obtém a localização do usuário via geolocalização
            navigator.geolocation.getCurrentPosition(
                (pos) => { // Se conseguir obter a posição
                    const coords = [pos.coords.longitude, pos.coords.latitude]; // Extrai longitude e latitude
                    setLocalização(coords); // Atualiza o estado com as coordenadas

                    // Inicializa o mapa do Mapbox
                    mapboxgl.accessToken = TOKEN; // Define o token de acesso do Mapbox
                    const map = new mapboxgl.Map({
                        container: mapaRef.current, // Elemento DOM onde o mapa será renderizado
                        style: "mapbox://styles/mapbox/streets-v12", // Estilo do mapa
                        center: coords, // Centraliza o mapa na localização do usuário
                        zoom: 14, // Define o nível de zoom
                    });

                    // Adiciona um marcador vermelho na localização do usuário
                    new mapboxgl.Marker({ color: "#FF0000" }) // Cria marcador vermelho
                        .setLngLat(coords) // Define posição do marcador
                        .setPopup(
                            new mapboxgl.Popup().setHTML(
                                "<strong>Você está aqui!</strong><img src='https://media.giphy.com/media/3o6Zt8MgUuvSbkZYWc/giphy.gif' alt='Localização' width='100'/>"
                            )
                        ) // Adiciona popup com mensagem e imagem
                        .addTo(map); // Adiciona marcador ao mapa
                },
                () => alert("Erro ao obter localização") // Se falhar, exibe alerta de erro
            );
        };
        document.body.appendChild(script); // Adiciona o script ao <body>
    }, []); // Executa apenas uma vez ao montar o componente

    return (
        <div className={styles.container}> {/* Container principal com estilos */}
            <div ref={mapaRef} className={styles.mapa} /> {/* Elemento onde o mapa será renderizado */}

            {localização && ( // Se a localização estiver disponível
                <div className={styles.info}> {/* Exibe informações da localização */}
                    <h2>📍 Sua Localização</h2>
                    <p>Latitude: {localização[1].toFixed(2)}</p> {/* Mostra latitude formatada */}
                    <p>Longitude: {localização[0].toFixed(2)}</p> {/* Mostra longitude formatada */}
                </div>
            )}
        </div>
    );
}
