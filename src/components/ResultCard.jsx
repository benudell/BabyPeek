import { useEffect, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import jsPDF from 'jspdf'

const TO_EMAIL = 'benjaminudell@gmail.com'

export default function ResultCard({ imageUrl, age, gender, babyName, narrative, onGenerateAgain, onStartOver }) {
  const [revealed, setRevealed] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [makingPDF, setMakingPDF] = useState(false)
  const hasConfettied = useRef(false)

  const ageLabel = age === 0 ? 'Newborn' : `${age} ${age === 1 ? 'Year' : 'Years'} Old`
  const nameLabel = babyName || 'Baby Doolin Pierson'

  useEffect(() => {
    if (imageUrl && !hasConfettied.current) {
      hasConfettied.current = true
      setTimeout(() => {
        setRevealed(true)
        const count = 200
        const defaults = { origin: { y: 0.7 } }
        function fire(particleRatio, opts) {
          confetti({ ...defaults, ...opts, particleCount: Math.floor(count * particleRatio) })
        }
        fire(0.25, { spread: 26, startVelocity: 55, colors: ['#FAA0A0', '#ffc1d4', '#87CEEB'] })
        fire(0.2,  { spread: 60, colors: ['#FAA0A0', '#87CEEB'] })
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, colors: ['#FAA0A0', '#ffffff', '#87CEEB'] })
        fire(0.1,  { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2, colors: ['#ffc1d4', '#c8e6ff'] })
        fire(0.1,  { spread: 120, startVelocity: 45, colors: ['#FAA0A0', '#87CEEB'] })
      }, 300)
    }
  }, [imageUrl])

  // Fetch image as data URL (reusable)
  const getImageDataUrl = async () => {
    const response = await fetch(imageUrl)
    const blob = await response.blob()
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve({ dataUrl: reader.result, blob })
      reader.readAsDataURL(blob)
    })
  }

  const handleSave = async () => {
    if (!imageUrl || saving) return
    setSaving(true)
    try {
      const { blob } = await getImageDataUrl()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${nameLabel.replace(/\s+/g, '-').toLowerCase()}.jpg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      window.open(imageUrl, '_blank')
    } finally {
      setSaving(false)
    }
  }

  const getShareText = () => {
    const subject = `Baby Peek: Meet ${nameLabel}!`
    const body = `${narrative || ''}\n\nSee the image here: ${imageUrl}\n\nGenerated at the Doolin Pierson Baby Shower`
    return { subject, body }
  }

  const handleShareEmail = () => {
    const { subject, body } = getShareText()
    window.open(
      `mailto:${TO_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
      '_blank'
    )
    setShowShareModal(false)
  }

  const handleShareText = () => {
    const textBody = `Meet ${nameLabel}!\n\n${narrative || ''}\n\nSee the baby here: ${imageUrl}\n\nGenerated at the Doolin Pierson Baby Shower`
    window.open(`sms:?body=${encodeURIComponent(textBody)}`, '_blank')
    setShowShareModal(false)
  }

  const handlePDF = async () => {
    if (makingPDF) return
    setMakingPDF(true)
    try {
      const { dataUrl } = await getImageDataUrl()

      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageW = 210
      const pageH = 297

      // Background color based on gender
      if (gender === 'Girl') {
        doc.setFillColor(250, 160, 160)
      } else if (gender === 'Boy') {
        doc.setFillColor(135, 206, 235)
      } else {
        // Surprise: pink-to-blue gradient approximation using two rects
        doc.setFillColor(135, 206, 235)
        doc.rect(0, 0, pageW, pageH, 'F')
        doc.setFillColor(250, 160, 160)
        doc.rect(0, pageH / 2, pageW, pageH / 2, 'F')
      }
      if (gender !== 'Surprise') {
        doc.rect(0, 0, pageW, pageH, 'F')
      }

      // Polaroid white frame
      const imgX = 30, imgY = 25, imgW = 150, imgH = 150
      const frameX = imgX - 8, frameY = imgY - 8
      const frameW = imgW + 16, frameH = imgH + 50
      doc.setFillColor(255, 255, 255)
      doc.setDrawColor(220, 220, 220)
      doc.roundedRect(frameX, frameY, frameW, frameH, 2, 2, 'FD')

      // Baby image
      doc.addImage(dataUrl, 'JPEG', imgX, imgY, imgW, imgH)

      // Name
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(20)
      doc.setTextColor(60, 60, 60)
      doc.text(nameLabel, pageW / 2, imgY + imgH + 18, { align: 'center' })

      // Age
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      doc.setTextColor(140, 140, 140)
      doc.text(ageLabel, pageW / 2, imgY + imgH + 27, { align: 'center' })

      // Narrative
      if (narrative) {
        doc.setFont('helvetica', 'italic')
        doc.setFontSize(12)
        doc.setTextColor(255, 255, 255)
        const lines = doc.splitTextToSize(narrative, 160)
        doc.text(lines, pageW / 2, imgY + imgH + 65, { align: 'center' })
      }

      doc.save(`${nameLabel.replace(/\s+/g, '-').toLowerCase()}.pdf`)
    } catch (err) {
      console.error('PDF error:', err)
      alert('Could not generate PDF. Try saving the image instead.')
    } finally {
      setMakingPDF(false)
    }
  }

  return (
    <div className="flex flex-col items-center pb-10">
      {/* Polaroid */}
      {revealed ? (
        <div
          className="polaroid-reveal bg-white p-4 shadow-2xl mb-8 max-w-sm w-full"
          style={{ transform: 'rotate(-2deg)', boxShadow: '0 20px 60px rgba(250,160,160,0.25)' }}
        >
          <img src={imageUrl} alt="Generated baby" className="w-full aspect-square object-cover rounded-sm" />
          <div className="pt-4 pb-2 text-center">
            <p className="text-2xl font-bold text-gray-700 font-body">{nameLabel}</p>
            <p className="text-xs text-gray-400 mt-1 font-body">{ageLabel} — {gender}</p>
          </div>
        </div>
      ) : (
        <div className="w-72 aspect-square bg-gray-800 rounded-2xl animate-pulse mb-8" />
      )}

      {/* Narrative */}
      {revealed && narrative && (
        <div
          className="max-w-sm w-full rounded-3xl p-6 mb-6 text-center"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <p className="text-gray-200 font-body leading-relaxed text-base italic">{narrative}</p>
        </div>
      )}

      {/* Buttons */}
      {revealed && (
        <>
          <div className="grid grid-cols-2 gap-3 w-full max-w-sm mb-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="py-4 px-4 text-white rounded-full font-semibold font-body text-sm transition-all hover:scale-105 active:scale-95"
              style={{ background: '#87CEEB' }}
            >
              {saving ? 'Saving...' : 'Save Image'}
            </button>
            <button
              onClick={() => setShowShareModal(true)}
              className="py-4 px-4 text-white rounded-full font-semibold font-body text-sm transition-all hover:scale-105 active:scale-95"
              style={{ background: '#FAA0A0' }}
            >
              Share
            </button>
            <button
              onClick={handlePDF}
              disabled={makingPDF}
              className="py-4 px-4 text-white rounded-full font-semibold font-body text-sm transition-all hover:scale-105 active:scale-95"
              style={{ background: 'linear-gradient(to right, #87CEEB, #FAA0A0)' }}
            >
              {makingPDF ? 'Creating PDF...' : 'Save as PDF'}
            </button>
            <button
              onClick={onGenerateAgain}
              className="py-3 px-4 text-white rounded-full font-semibold font-body text-sm transition-all hover:scale-105 active:scale-95 bg-gray-700 hover:bg-gray-600"
            >
              Generate Again
            </button>
          </div>

          <button
            onClick={onStartOver}
            className="mt-2 text-sm text-gray-500 hover:text-gray-300 underline underline-offset-2 transition-colors font-body"
          >
            Start over with new photos
          </button>
        </>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={() => setShowShareModal(false)}
        >
          <div
            className="rounded-2xl p-8 flex flex-col gap-4 w-72 text-center"
            style={{ background: '#1a1a1a', border: '1px solid #333' }}
            onClick={e => e.stopPropagation()}
          >
            <p className="text-white font-semibold text-lg font-body">Share this baby!</p>
            <button
              onClick={handleShareEmail}
              className="py-3 px-6 text-white rounded-full font-semibold font-body text-sm transition-all hover:scale-105"
              style={{ background: '#FAA0A0' }}
            >
              Send by Email
            </button>
            <button
              onClick={handleShareText}
              className="py-3 px-6 text-white rounded-full font-semibold font-body text-sm transition-all hover:scale-105"
              style={{ background: '#87CEEB' }}
            >
              Send by Text
            </button>
            <button
              onClick={() => setShowShareModal(false)}
              className="text-sm text-gray-500 hover:text-gray-300 underline font-body"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
