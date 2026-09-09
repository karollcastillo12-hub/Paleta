import { useState, useEffect } from 'react'
import './App.css'

const ADJETIVOS = [
  'Nostálgico', 'Errante', 'Silencioso', 'Vibrante', 'Etéreo',
  'Melancólico', 'Salvaje', 'Sereno', 'Ardiente', 'Distante',
  'Nocturno', 'Radiante', 'Nómada', 'Sutil', 'Profundo',
]

const SUSTANTIVOS = [
  'Atardecer', 'Océano', 'Bruma', 'Ceniza', 'Coral',
  'Desierto', 'Aurora', 'Musgo', 'Marea', 'Eclipse',
  'Jade', 'Bosque', 'Tormenta', 'Lava', 'Arrecife',
]

function generarColorAleatorio() {
  // Genera colores con buena saturación/luminosidad usando HSL
  const h = Math.floor(Math.random() * 360)
  const s = 55 + Math.floor(Math.random() * 35) // 55% - 90%
  const l = 40 + Math.floor(Math.random() * 35) // 40% - 75%
  return hslToHex(h, s, l)
}

function hslToHex(h, s, l) {
  s /= 100
  l /= 100
  const k = n => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = n =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  const toHex = x => Math.round(255 * x).toString(16).padStart(2, '0')
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`
}

function nombrePoetico() {
  const adj = ADJETIVOS[Math.floor(Math.random() * ADJETIVOS.length)]
  const sus = SUSTANTIVOS[Math.floor(Math.random() * SUSTANTIVOS.length)]
  return `${sus} ${adj}`
}

function generarPaleta(cantidad = 5) {
  return Array.from({ length: cantidad }, () => ({
    id: crypto.randomUUID(),
    hex: generarColorAleatorio(),
    nombre: nombrePoetico(),
  }))
}

function contrasteTexto(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const luminancia = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminancia > 0.6 ? '#1a1a1a' : '#ffffff'
}

function App() {
  const [paleta, setPaleta] = useState(() => generarPaleta())
  const [copiado, setCopiado] = useState(null)
  const [favoritas, setFavoritas] = useState([])

  useEffect(() => {
    const guardadas = localStorage.getItem('paletas-favoritas')
    if (guardadas) {
      try {
        setFavoritas(JSON.parse(guardadas))
      } catch {
        setFavoritas([])
      }
    }
  }, [])

  const regenerar = () => setPaleta(generarPaleta())

  const copiarHex = async (hex, id) => {
    try {
      await navigator.clipboard.writeText(hex)
      setCopiado(id)
      setTimeout(() => setCopiado(null), 1200)
    } catch {
      // Si el navegador no permite clipboard, simplemente ignoramos
    }
  }

  const guardarFavorita = () => {
    const nuevaLista = [paleta, ...favoritas].slice(0, 8)
    setFavoritas(nuevaLista)
    localStorage.setItem('paletas-favoritas', JSON.stringify(nuevaLista))
  }

  const cargarFavorita = (fav) => setPaleta(fav)

  const eliminarFavorita = (index) => {
    const nuevaLista = favoritas.filter((_, i) => i !== index)
    setFavoritas(nuevaLista)
    localStorage.setItem('paletas-favoritas', JSON.stringify(nuevaLista))
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Paletas Poéticas</h1>
        <p className="subtitulo">Genera combinaciones de color con nombre propio</p>
      </header>

      <div className="paleta">
        {paleta.map((color) => (
          <div
            key={color.id}
            className="franja"
            style={{ backgroundColor: color.hex, color: contrasteTexto(color.hex) }}
            onClick={() => copiarHex(color.hex, color.id)}
          >
            <span className="nombre-color">{color.nombre}</span>
            <span className="hex-color">
              {copiado === color.id ? '¡Copiado!' : color.hex.toUpperCase()}
            </span>
          </div>
        ))}
      </div>

      <div className="acciones">
        <button className="btn btn-primario" onClick={regenerar}>
          🎲 Nueva paleta
        </button>
        <button className="btn btn-secundario" onClick={guardarFavorita}>
          ⭐ Guardar como favorita
        </button>
      </div>

      {favoritas.length > 0 && (
        <section className="favoritas">
          <h2>Tus paletas guardadas</h2>
          <div className="lista-favoritas">
            {favoritas.map((fav, index) => (
              <div key={index} className="mini-paleta-wrapper">
                <div className="mini-paleta" onClick={() => cargarFavorita(fav)}>
                  {fav.map((c) => (
                    <div
                      key={c.id}
                      className="mini-franja"
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
                <button
                  className="btn-eliminar"
                  onClick={() => eliminarFavorita(index)}
                  aria-label="Eliminar paleta"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <footer className="footer">
        <p>Haz clic en una franja de color para copiar su código HEX</p>
      </footer>
    </div>
  )
}

export default App