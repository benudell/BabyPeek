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

  const handleGenerate = async () => {
    setStep(3)
    setError(null)
    setGeneratedImageUrl(null)

    try {
      const isProd = import.meta.env.PROD
      const anthropicKey = import.meta.env.VITE_ANTHROPIC_API_KEY
      const replicateToken = import.meta.env.VITE_REPLICATE_API_TOKEN

      const claudeBody = {
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `You are helping create a fun baby shower experience. Given these details, return a JSON object with exactly two fields: "imagePrompt" and "narrative".

Parent photos: Mom: [${selectedMomPhoto.filename}], Dad: [${selectedDadPhoto.filename}]
Baby age: ${age === 0 ? 'Newborn' : age + ' years old'}
Gender: ${gender}${babyName ? `\nSuggested name: ${babyName}` : ''}${notes ? `\nPersonality/traits: ${notes}` : ''}

"imagePrompt": A detailed prompt for a photorealistic image generator. Describe a warm, natural portrait of a ${age === 0 ? 'newborn baby' : age + ' year old child'} ${gender === 'Surprise' ? '' : gender === 'Girl' ? 'girl' : 'boy'} with blended features from both parents. Soft lighting, family portrait style. IMPORTANT: If the suggested name is "Ben" or "Amanda" (case-insensitive), the child MUST be wearing Milwaukee Brewers baseball gear — include a Brewers jersey, cap, or both prominently in the image. If the suggested name strongly indicates a specific cultural or ethnic background (for example, Devonte, Jayla, or similar names suggest African American heritage; names like Miguel or Sofia suggest Hispanic heritage; names like Mei or Kai might suggest Asian heritage), make sure the child's appearance authentically reflects that ethnicity in the image prompt.

"narrative": 3-4 warm, glowing, endearing sentences imagining this child's personality and future. Write it as if speaking directly to the parents — loving, positive, and full of joy. ${notes ? `You MUST directly incorporate these specific traits and personality suggestions into the narrative: "${notes}". Weave them in naturally and make them central to the story you tell about this child.` : 'Invent something delightful and heartfelt based on the age and gender.'} ${babyName ? `Refer to the child as ${babyName}.` : 'Do not use a name.'} Never use generic filler — make it feel personal and specific.

IMPORTANT CONTENT RULE: Do not depict, reference, or imply any physical or cognitive disabilities in either the image prompt or the narrative. The child should always be portrayed as healthy and thriving.

Return ONLY raw JSON with no markdown, no code fences, no explanation. Start your response with { and end with }.`,
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
        const res = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-1.1-pro/predictions', {
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
