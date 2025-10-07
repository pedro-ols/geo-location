
"use client";

import Link from "next/link";
import styles from "./page.module.css";

// www.mapbox.com/

export default function Home() {
    return (
        <div className={styles.container}>
            <div className={styles.conteudo}>
                <h1>🗺️ Sistema de Mapas</h1>
                <p>Aprenda a trabalhar com mapas e geolocalização</p>

                <div className={styles.cards}>
                    <Link href="/page1" className={styles.card}>
                        <div className={styles.icone}>📍</div>
                        <h2>Geolocalização</h2>
                        <p>Descubra sua localização atual no mapa</p>
                        <span className={styles.nivel}>Nível 1</span>
                    </Link>

                    <Link href="/page2" className={styles.card}>
                        <div className={styles.icone}>🚗</div>
                        <h2>Traçar Rota</h2>
                        <p>Busque destinos e trace rotas no mapa</p>
                        <span className={styles.nivel}>Nível 2</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
