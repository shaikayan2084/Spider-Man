import { useState } from 'react'

export default function Gallery({ images }) {
  const [lightboxIndex, setLightboxIndex] = useState(null)

  return (
    <>
      <h2 className="gallery-title">Spider-Man Gallery</h2>
      <p className="gallery-subtitle">Click any image to view full size</p>
      <div className="gallery-grid">
        {images.map((img, i) => (
          <div
            key={i}
            className="gallery-card"
            style={{ '--delay': `${i * 0.08}s` }}
            onClick={() => setLightboxIndex(i)}
          >
            <div className="gallery-card-inner">
              <img src={img.src} alt={img.alt} loading="lazy" />
              <div className="gallery-overlay">
                <span>{img.alt}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {lightboxIndex !== null && (
        <div className="lightbox" onClick={() => setLightboxIndex(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setLightboxIndex(null)}>&times;</button>
            <img src={images[lightboxIndex].src} alt={images[lightboxIndex].alt} />
          </div>
        </div>
      )}
    </>
  )
}
