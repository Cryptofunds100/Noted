// Device shell. Two presentations of the same app surface:
//  - Desktop / wide preview → a scaled iPhone frame (letterboxed), so the
//    prototype reads as a phone for reviewers.
//  - Installed PWA, or any phone-sized viewport → the app fills the real
//    screen with no simulated bezel, using true safe-area insets. This is what
//    makes it "look like a normal app" on a home screen (and on a real phone).

const FRAME_W = 402, FRAME_H = 874;

// Decide whether to drop the simulated bezel and fill the screen.
// We deliberately DON'T use `display-mode: standalone` here — some preview/
// embed environments report it even though they're not a real installed app.
// Reliable "launched as an installed app" signals instead:
//   • our manifest start_url / shortcuts carry ?source=pwa|shortcut|push
//   • iOS sets navigator.standalone = true for home-screen launches
//   • ?view=full / ?view=frame is a manual override (handy for testing)
function launchedAsApp() {
  try {
    const p = new URLSearchParams(window.location.search);
    const view = p.get('view');
    if (view === 'full') return true;
    if (view === 'frame') return false;
    const src = p.get('source');
    if (src === 'pwa' || src === 'shortcut' || src === 'push') return true;
    if (window.navigator.standalone === true) return true;
    return false;
  } catch (e) { return false; }
}

function DeviceFrame({ dark, children }) {
  const full = launchedAsApp();
  const [scale, setScale] = React.useState(1);

  React.useEffect(() => {
    if (full) return;
    const fit = () => {
      const pad = 32;
      setScale(Math.min((window.innerWidth - pad) / FRAME_W, (window.innerHeight - pad) / FRAME_H, 1.1));
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [full]);

  // Switch the document into full-bleed mode (real insets + full-screen bg).
  React.useEffect(() => {
    document.documentElement.classList.toggle('app-fullbleed', full);
  }, [full]);

  // Installed app / real device — fill the screen, no fake bezel.
  if (full) {
    return (
      <div className="stage stage--full">
        <div className="noted-app" style={{ position: 'relative', overflow: 'hidden' }}>
          {children}
        </div>
      </div>
    );
  }

  // Preview / desktop — scaled iPhone frame.
  return (
    <div className="stage">
      <div className="device-scale" style={{ transform: `scale(${scale})` }}>
        <IOSDevice dark={dark}>
          <div className="noted-app" style={{ position: 'relative', height: '100%', overflow: 'hidden' }}>
            {children}
          </div>
        </IOSDevice>
      </div>
    </div>
  );
}

window.DeviceFrame = DeviceFrame;
