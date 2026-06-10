import CrosshairOverlay from './CrosshairOverlay'

interface CameraViewProps {
  isConnected: boolean
  videoRef?: React.RefObject<HTMLVideoElement>
}

export default function CameraView({ isConnected, videoRef }: CameraViewProps) {
  return (
    <div className="absolute inset-0 bg-black" aria-hidden={!isConnected}>
      {/* Live camera feed */}
      {videoRef && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          aria-label="Camera feed"
        />
      )}

      {/* Ambient glow overlay when no camera */}
      {!videoRef && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={[
            'w-64 h-64 rounded-full blur-3xl transition-opacity duration-1000',
            isConnected ? 'bg-aura-accent/5 animate-breathe' : 'bg-aura-accent/3',
          ].join(' ')} />
        </div>
      )}

      {/* Crosshair reticle */}
      <CrosshairOverlay isConnected={isConnected} />
    </div>
  )
}
