export default function PhotoGrid({
  momPhotos,
  dadPhotos,
  selectedMomPhoto,
  selectedDadPhoto,
  onSelect,
  canProceed,
  onNext,
}) {
  const PhotoThumb = ({ photo, parent }) => {
    const isMom = parent === 'mom'
    const selected = isMom
      ? selectedMomPhoto?.id === photo.id
      : selectedDadPhoto?.id === photo.id

    const glowColor = isMom
      ? 'rgba(236, 72, 153, 0.85)'
      : 'rgba(59, 130, 246, 0.85)'

    const ringColor = isMom ? 'ring-pink-500' : 'ring-blue-500'

    return (
      <button
        onClick={() => onSelect(photo, parent)}
        className={`relative w-full aspect-square rounded-xl overflow-hidden transition-all duration-200 ${
          selected ? `ring-4 ${ringColor} scale-105` : 'ring-2 ring-white/20 hover:ring-white/50'
        }`}
        style={selected ? { boxShadow: `0 0 20px 6px ${glowColor}` } : {}}
      >
        <img
          src={photo.url}
          alt={photo.label}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {selected && (
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(to top, ${glowColor} 0%, transparent 60%)` }}
          />
        )}
        {selected && (
          <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-white rounded-full flex items-center justify-center">
            <div className={`w-3 h-3 rounded-full ${isMom ? 'bg-pink-500' : 'bg-blue-500'}`} />
          </div>
        )}
      </button>
    )
  }

  return (
    <div>
      {/* Couple hero image */}
      <div className="relative rounded-3xl overflow-hidden mb-4">
        <img
          src="/couple.png"
          alt="Laura and Bryce"
          className="w-full object-cover object-center"
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 50%)' }}
        />
      </div>

      {/* Instructions */}
      <p className="text-center text-gray-300 font-body text-sm mt-3 mb-3 tracking-wide">
        Select one photo of each.
      </p>

      {/* Photo selectors below image */}
      <div className="flex gap-3 mb-4">
        {/* Mom section */}
        <div className="flex-1 min-w-0">
          <p className="text-pink-400 font-semibold text-sm mb-2 tracking-wide text-center">
            Laura's Photos
          </p>
          <div className="grid grid-cols-2 gap-2">
            {momPhotos.map(photo => (
              <PhotoThumb key={photo.id} photo={photo} parent="mom" />
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="w-px bg-white/20" />

        {/* Dad section */}
        <div className="flex-1 min-w-0">
          <p className="text-blue-400 font-semibold text-sm mb-2 tracking-wide text-center">
            Bryce's Photos
          </p>
          <div className="grid grid-cols-2 gap-2">
            {dadPhotos.map(photo => (
              <PhotoThumb key={photo.id} photo={photo} parent="dad" />
            ))}
          </div>
        </div>
      </div>

      {/* Status + Next */}
      <div className="flex items-center justify-between px-1 mt-4">
        <div className="text-sm text-gray-400">
          {selectedMomPhoto && !selectedDadPhoto && (
            <span>Laura selected — now pick <span className="text-blue-400">Bryce</span></span>
          )}
          {!selectedMomPhoto && selectedDadPhoto && (
            <span>Bryce selected — now pick <span className="text-pink-400">Laura</span></span>
          )}
          {canProceed && <span className="text-green-400">Both selected — ready to go!</span>}
        </div>

        <button
          onClick={onNext}
          disabled={!canProceed}
          className={`px-8 py-4 rounded-full font-semibold text-base transition-all duration-300 ${
            canProceed
              ? 'bg-white text-black hover:bg-gray-100 hover:scale-105 active:scale-95 shadow-lg'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          Next →
        </button>
      </div>
    </div>
  )
}
