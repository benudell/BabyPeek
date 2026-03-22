import { useState } from 'react'
import PhotoGrid from './components/PhotoGrid'
import BannerHeadline from './components/BannerHeadline'
import CustomizationPanel from './components/CustomizationPanel'
import GeneratingScreen from './components/GeneratingScreen'
import ResultCard from './components/ResultCard'

const MOM_PHOTOS = [
  { id: 'mom1', url: '/photos/IMG_0243.jpeg', filename: 'IMG_0243.jpeg', label: 'Photo 1' },
  { id: 'mom2', url: '/photos/IMG_1678.jpeg', filename: 'IMG_1678.jpeg', label: 'Photo 2' },
  { id: 'mom3', url: '/photos/IMG_1681.jpeg', filename: 'IMG_1681.jpeg', label: 'Photo 3' },
  { id: 'mom4', url: '/photos/IMG_1886.jpeg', filename: 'IMG_1886.jpeg', label: 'Photo 4' },
  { id: 'mom5', url: '/photos/IMG_2346.jpeg', filename: 'IMG_2346.jpeg', label: 'Photo 5' },
]

const DAD_PHOTOS = [
  { id: 'dad1', url: '/photos/IMG_0015.JPG', filename: 'IMG_0015.JPG', label: 'Photo 1' },
  { id: 'dad2', url: '/photos/IMG_0016.JPG', filename: 'IMG_0016.JPG', label: 'Photo 2' },
  { id: 'dad3', url: '/photos/IMG_0037.PNG', filename: 'IMG_0037.PNG', label: 'Photo 3' },
  { id: 'dad4', url: '/photos/IMG_1557.jpeg', filename: 'IMG_1557.jpeg', label: 'Photo 4' },
  { id: 'dad5', url: '/photos/IMG_1704.jpeg', filename: 'IMG_1704.jpeg', label: 'Photo 5' },
  { id: 'dad6', url: '/photos/IMG_2406.jpeg', filename: 'IMG_2406.jpeg', label: 'Photo 6' },
  { id: 'dad7', url: '/photos/IMG_2632.jpeg', filename: 'IMG_2632.jpeg', label: 'Photo 7' },
  { id: 'dad8', url: '/photos/IMG_2741.jpeg', filename: 'IMG_2741.jpeg', label: 'Photo 8' },
]

export default function App() {
  const [step, setStep] = useState(1)
  const [selectedMomPhoto, setSelectedMomPhoto] = useState(null)
  const [selectedDadPhoto, setSelectedDadPhoto] = useState(null)
  const [age, setAge] = useState(0)
  const [gender, setGender] = useState('Surprise')
  const [babyName, setBabyName] = useState('')
  const [notes, setNotes] = useState('')
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null)
  const [narrative, setNarrative] = useState('')
  const [error, setError] = useState(null)

  const handlePhotoSelect = (photo, parent) => {
    if (parent === 'mom') {
      setSelectedMomPhoto(prev => prev?.id === photo.id ? null : photo)
    } else {
      setSelectedDadPhoto(prev => prev?.id === photo.id ? null : photo)
    }
  }

  const canProceed = selectedMomPhoto !== null && selectedDadPhoto !== null

  const fetchImageAsBase64 = async (url) => {
    const response = await fetch(url)
    const blob = await response.blob()
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result.split(',')[1]
        const mediaType = blob.type || 'image/jpeg'
        resolve({ base64, mediaType })
      }
      reader.readAsDataURL(blob)
    })
  }

  const handleGenerate = async () => {
    setStep(3)
    setError(null)
    setGeneratedImageUrl(null)

    try {
      const isProd = import.meta.env.PROD
      const anthropicKey = import.meta.env.VITE_ANTHROPIC_API_KEY
      const replicateToken = import.meta.env.VITE_REPLICATE_API_TOKEN

      // Fetch both parent photos as base64 so Claude can actually see them
      const [momImg, dadImg] = await Promise.all([
        fetchImageAsBase64(selectedMomPhoto.url),
        fetchImageAsBase64(selectedDadPhoto.url),
      ])

      const claudeBody = {
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'You are helping create a fun baby shower experience. I am going to show you photos of the mother and father. Please carefully analyze their physical features — hair color and texture, eye color, skin tone, face shape, nose shape, lip shape — and use those real observed features to generate a blended child image prompt.',
              },
              {
                type: 'text',
                text: 'Here is a photo of the MOTHER (Laura):',
              },
              {
                type: 'image',
                source: { type: 'base64', media_type: momImg.mediaType, data: momImg.base64 },
              },
              {
                type: 'text',
                text: 'Here is a photo of the FATHER (Bryce):',
              },
              {
                type: 'image',
                source: { type: 'base64', media_type: dadImg.mediaType, data: dadImg.base64 },
              },
              {
                type: 'text',
                text: `Now return a JSON object with exactly two fields: "imagePrompt" and "narrative".

Baby age: ${age === 0 ? 'Newborn' : age + ' years old'}
Gender: ${gender}${babyName ? `\nSuggested name: ${babyName}` : ''}${notes ? `\nPersonality/traits: ${notes}` : ''}

"imagePrompt": Based on the ACTUAL features you observed in the parent photos above, write a highly detailed prompt for a photorealistic image generator. Explicitly describe the child's specific blended physical traits — mention exact hair color/texture, eye color, skin tone, and facial features inherited from each parent. The child should genuinely look like a blend of these two specific people, but leaning more towards the mother's features — perhaps 65% mom, 35% dad. The mother's traits (hair, eyes, face shape) should be more dominant and recognizable in the child, while the father's features add subtle depth. Also include a gentle hint of Irish heritage — a slight warmth in the complexion and a natural softness to the features. Warm, natural portrait, soft lighting, family portrait style. IMPORTANT: If the suggested name is "Ben" or "Amanda" (case-insensitive), the child MUST be wearing Milwaukee Brewers baseball gear. If the name strongly indicates a specific cultural or ethnic background, reflect that authentically.

"narrative": 3-4 warm, glowing, endearing sentences imagining this child's personality and future, speaking directly to the parents. ${notes ? `Incorporate these traits: "${notes}".` : 'Invent something delightful and heartfelt.'} ${babyName ? `Refer to the child as ${babyName}.` : 'Do not use a name.'}

IMPORTANT CONTENT RULE: Never depict or reference any physical or cognitive disabilities. The child should always be portrayed as healthy and thriving.

Return ONLY raw JSON with no markdown, no code fences. Start with { and end with }.`,
              },
            ],
          },
        ],
      }

      let claudeData
      if (isProd) {
        const res = await fetch('/.netlify/functions/generate-baby', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'generate-prompt', body: claudeBody }),
        })
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          throw new Error(errData.error?.message || `Claude API error: ${res.status}`)
        }
        claudeData = await res.json()
      } else {
        if (!anthropicKey || anthropicKey === 'your_key_here') {
          throw new Error('Please add your Anthropic API key to the .env file')
        }
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': anthropicKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
          },
          body: JSON.stringify(claudeBody),
        })
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          throw new Error(errData.error?.message || `Claude API error: ${res.status}`)
        }
        claudeData = await res.json()
      }

      const rawText = claudeData.content[0].text.trim()
      const cleaned = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
      const parsedResponse = JSON.parse(cleaned)
      const imagePrompt = parsedResponse.imagePrompt
      setNarrative(parsedResponse.narrative)

      const replicateBody = {
        input: {
          prompt: imagePrompt,
          aspect_ratio: '1:1',
          output_format: 'jpg',
          output_quality: 90,
          safety_tolerance: 2,
        },
      }

      let predictionId
      if (isProd) {
        const res = await fetch('/.netlify/functions/generate-baby', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'create-prediction', body: replicateBody }),
        })
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          throw new Error(errData.detail || `Replicate API error: ${res.status}`)
        }
        const prediction = await res.json()
        predictionId = prediction.id
      } else {
        if (!replicateToken || replicateToken === 'your_token_here') {
          throw new Error('Please add your Replicate API token to the .env file')
        }
        const res = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${replicateToken}`,
          },
          body: JSON.stringify(replicateBody),
        })
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          throw new Error(errData.detail || `Replicate API error: ${res.status}`)
        }
        const prediction = await res.json()
        predictionId = prediction.id
      }

      let imageUrl = null
      let attempts = 0
      const maxAttempts = 60

      while (!imageUrl && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 2000))
        attempts++

        let pollData
        if (isProd) {
          const res = await fetch('/.netlify/functions/generate-baby', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'poll-prediction', predictionId }),
          })
          if (!res.ok) continue
          pollData = await res.json()
        } else {
          const res = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
            headers: { Authorization: `Bearer ${replicateToken}` },
          })
          if (!res.ok) continue
          pollData = await res.json()
        }

        if (pollData.status === 'succeeded') {
          imageUrl = Array.isArray(pollData.output) ? pollData.output[0] : pollData.output
          break
        } else if (pollData.status === 'failed') {
          throw new Error(pollData.error || 'Image generation failed')
        }
      }

      if (!imageUrl) throw new Error('Image generation timed out. Please try again.')

      setGeneratedImageUrl(imageUrl)
      setStep(4)
    } catch (err) {
      console.error('Generation error:', err)
      setError(err.message)
      setStep(3)
    }
  }

  const handleReset = () => {
    setStep(1)
    setSelectedMomPhoto(null)
    setSelectedDadPhoto(null)
    setAge(0)
    setGender('Surprise')
    setBabyName('')
    setNotes('')
    setGeneratedImageUrl(null)
    setNarrative('')
    setError(null)
  }

  const handleGenerateAgain = () => {
    setStep(2)
    setGeneratedImageUrl(null)
    setNarrative('')
    setError(null)
  }

  return (
    <div className="min-h-screen bg-black font-body">
      <BannerHeadline />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 pb-10">
        {step === 1 && (
          <PhotoGrid
            momPhotos={MOM_PHOTOS}
            dadPhotos={DAD_PHOTOS}
            selectedMomPhoto={selectedMomPhoto}
            selectedDadPhoto={selectedDadPhoto}
            onSelect={handlePhotoSelect}
            canProceed={canProceed}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <CustomizationPanel
            age={age}
            gender={gender}
            babyName={babyName}
            notes={notes}
            onAgeChange={setAge}
            onGenderChange={setGender}
            onBabyNameChange={setBabyName}
            onNotesChange={setNotes}
            onBack={() => setStep(1)}
            onGenerate={handleGenerate}
          />
        )}

        {step === 3 && (
          <GeneratingScreen error={error} onBack={() => setStep(2)} />
        )}

        {step === 4 && (
          <ResultCard
            imageUrl={generatedImageUrl}
            age={age}
            gender={gender}
            babyName={babyName}
            narrative={narrative}
            onGenerateAgain={handleGenerateAgain}
            onStartOver={handleReset}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-gray-500 font-body">
        Made with <span className="text-pink-400">♥</span> for the Doolin Pierson Baby Shower
      </footer>
    </div>
  )
}
