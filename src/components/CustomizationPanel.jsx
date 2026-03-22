import { useState } from 'react'

const GENDERS = ['Girl', 'Boy', 'Surprise']

export default function CustomizationPanel({
  age,
  gender,
  babyName,
  notes,
  onAgeChange,
  onGenderChange,
  onBabyNameChange,
  onNotesChange,
  onBack,
  onGenerate,
}) {
  const [sliding, setSliding] = useState(false)

  const ageDisplay = age === 0 ? 'Newborn' : String(age)

  return (
    <div className="pb-10">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-gray-200 mb-6 transition-colors font-body"
      >
        <span>←</span> Back to photos
      </button>

      {/* Title */}
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl text-white font-bold font-body">
          What's The Future of Baby Doolin Pierson?
        </h2>
      </div>

      {/* Age slider */}
      <div className="bg-gray-900/75 rounded-3xl p-5 mb-4">
        <h3 className="font-semibold text-white text-lg mb-4 font-body">Choose an Age</h3>

        {/* Big age number */}
        <div className="text-center mb-4">
          <span
            className="font-extrabold font-body transition-all duration-150"
            style={{
              fontSize: 'clamp(3rem, 18vw, 5rem)',
              lineHeight: 1,
              background: 'linear-gradient(to right, #FAA0A0, #87CEEB)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: sliding ? 'drop-shadow(0 0 16px #FAA0A0) drop-shadow(0 0 32px #87CEEB)' : 'none',
            }}
          >
            {ageDisplay}
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="18"
          value={age}
          onChange={e => onAgeChange(Number(e.target.value))}
          onMouseDown={() => setSliding(true)}
          onMouseUp={() => setSliding(false)}
          onTouchStart={() => setSliding(true)}
          onTouchEnd={() => setSliding(false)}
          className="w-full h-5 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #FAA0A0 0%, #87CEEB ${(age / 18) * 100}%, #374151 ${(age / 18) * 100}%)`,
            boxShadow: sliding ? '0 0 12px #FAA0A0' : 'none',
            transition: 'box-shadow 0.2s',
          }}
        />
        <div className="flex justify-between text-xs text-gray-500 mt-2 font-body">
          <span>Newborn</span>
          <span>18 Years</span>
        </div>
      </div>

      {/* Gender selector */}
      <div className="bg-gray-900/75 rounded-3xl p-5 mb-4">
        <h3 className="font-semibold text-white text-lg mb-4 font-body">Baby's Gender</h3>
        <div className="flex gap-3">
          {GENDERS.map(g => {
            const emoji = g === 'Girl' ? '💗' : g === 'Boy' ? '💙' : '🎊'
            return (
              <button
                key={g}
                onClick={() => onGenderChange(g)}
                className={`flex-1 py-4 rounded-full font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-1 font-body ${
                  gender === g ? 'scale-105 shadow-md text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              style={gender === g ? (
                g === 'Girl' ? { backgroundColor: '#FAA0A0' } :
                g === 'Boy'  ? { backgroundColor: '#87CEEB' } :
                { background: 'linear-gradient(to right, #87CEEB, #FAA0A0)' }
              ) : {}}
              >
                <span>{emoji}</span> {g}
              </button>
            )
          })}
        </div>
      </div>

      {/* Baby name */}
      <div className="bg-gray-900/75 rounded-3xl p-5 mb-4">
        <h3 className="font-semibold text-white text-lg mb-3 font-body">Suggested Baby Name</h3>
        <input
          type="text"
          value={babyName}
          onChange={e => onBabyNameChange(e.target.value)}
          placeholder="What would you name our baby?"
          className="w-full bg-gray-800 text-white placeholder-gray-500 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-pink-400 transition-all font-body"
        />
      </div>

      {/* Personality notes */}
      <div className="bg-gray-900/75 rounded-3xl p-5 mb-8">
        <div className="mb-3">
          <h3 className="font-semibold text-white text-lg font-body">Personality & Traits</h3>
        </div>
        <textarea
          value={notes}
          onChange={e => onNotesChange(e.target.value)}
          placeholder="What do you think this baby's personality and traits will be like? Adventurous? Artistic? A great sense of humor?"
          rows={4}
          className="w-full bg-gray-800 text-white placeholder-gray-500 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-400 transition-all resize-none font-body"
        />
      </div>

      {/* Generate button */}
      <button
        onClick={onGenerate}
        className="w-full py-5 rounded-full font-bold text-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 text-white font-body"
        style={{ background: 'linear-gradient(to right, #FAA0A0, #87CEEB)' }}
      >
        ✨ Generate Baby! ✨
      </button>

      <p className="text-center text-xs text-gray-500 mt-3 font-body">
        This may take up to 30 seconds
      </p>
    </div>
  )
}
