export default function SplashScreen() {
  return (
    <div className="splash-screen" role="status" aria-label="Loading MeowLogger">
      <img src={`${import.meta.env.BASE_URL}heart.png`} alt="" className="splash-icon" draggable={false} />
      <h1 className="splash-title">MeowLogger</h1>
    </div>
  )
}
