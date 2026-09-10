import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  ArrowDownRight,
  ArrowUpRight,
  Camera,
  Check,
  Clock3,
  Instagram,
  MapPin,
  Menu,
  MoveRight,
  Phone,
  Play,
  Sparkles,
  Star,
  X,
} from "lucide-react";

const images = {
  hero: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1800&q=88",
  portrait: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=88",
  studio: "/manus-storage/pasted_file_s6Y2KU_image_900f48ae.png",
  editorial: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1000&q=88",
  fashion: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=1200&q=88",
  maternity: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=1000&q=88",
};

function LightField() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let frame = 0;
    let onPointerMove: ((e: PointerEvent) => void) | null = null;
    let resize: (() => void) | null = null;
    let particleGeometry: THREE.BufferGeometry | null = null;
    let particleMaterial: THREE.PointsMaterial | null = null;
    let ring: THREE.Mesh | null = null;
    let ringMaterial: THREE.MeshBasicMaterial | null = null;
    let innerRing: THREE.Mesh | null = null;
    let orb: THREE.Mesh | null = null;

    try {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
      camera.position.z = 7.2;

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "default" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setClearColor(0x000000, 0);
      mount.appendChild(renderer.domElement);

      const group = new THREE.Group();
      scene.add(group);

      const points = 720;
      const positions = new Float32Array(points * 3);
      const colors = new Float32Array(points * 3);
      const amber = new THREE.Color("#f7ad55");
      const cream = new THREE.Color("#fff2ce");
      const lavender = new THREE.Color("#b6a4ff");

      for (let i = 0; i < points; i += 1) {
        const radius = 1.7 + Math.random() * 2.3;
        const angle = Math.random() * Math.PI * 2;
        const y = (Math.random() - 0.5) * 3.4;
        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = Math.sin(angle) * radius * 0.52;
        const color = i % 8 === 0 ? lavender : i % 3 === 0 ? cream : amber;
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
      }

      particleGeometry = new THREE.BufferGeometry();
      particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
      particleMaterial = new THREE.PointsMaterial({
        size: 0.034,
        vertexColors: true,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const particles = new THREE.Points(particleGeometry, particleMaterial);
      group.add(particles);

      ringMaterial = new THREE.MeshBasicMaterial({
        color: 0xf4ae5b,
        transparent: true,
        opacity: 0.24,
        wireframe: true,
        blending: THREE.AdditiveBlending,
      });
      ring = new THREE.Mesh(new THREE.TorusGeometry(1.78, 0.009, 8, 96), ringMaterial);
      ring.rotation.x = 1.08;
      ring.rotation.y = 0.4;
      group.add(ring);

      innerRing = new THREE.Mesh(
        new THREE.TorusGeometry(1.12, 0.006, 8, 96),
        new THREE.MeshBasicMaterial({ color: 0xb9a4ff, transparent: true, opacity: 0.38, wireframe: true }),
      );
      innerRing.rotation.x = -0.44;
      innerRing.rotation.z = 0.42;
      group.add(innerRing);

      orb = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.22, 2),
        new THREE.MeshBasicMaterial({ color: 0xffe4a8, transparent: true, opacity: 0.95 }),
      );
      group.add(orb);

      const pointer = { x: 0, y: 0 };
      onPointerMove = (event: PointerEvent) => {
        pointer.x = (event.clientX / (window.innerWidth || 1) - 0.5) * 0.7;
        pointer.y = (event.clientY / (window.innerHeight || 1) - 0.5) * 0.35;
      };
      window.addEventListener("pointermove", onPointerMove, { passive: true });

      resize = () => {
        if (!mount || !renderer) return;
        const width = mount.clientWidth || 1;
        const height = mount.clientHeight || 1;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };
      resize();
      window.addEventListener("resize", resize);

      const clock = new THREE.Clock();
      const animate = () => {
        const elapsed = clock.getElapsedTime();
        group.rotation.y += 0.0019;
        group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, pointer.y * 0.22, 0.025);
        group.position.x = THREE.MathUtils.lerp(group.position.x, pointer.x * 0.34, 0.025);
        particles.rotation.z = elapsed * 0.025;
        if (ring) ring.rotation.z += 0.0023;
        if (innerRing) innerRing.rotation.y -= 0.003;
        if (orb) orb.position.y = Math.sin(elapsed * 1.3) * 0.08;
        if (renderer) renderer.render(scene, camera);
        frame = requestAnimationFrame(animate);
      };
      animate();
    } catch (err) {
      console.warn("WebGL not supported or failed to initialize on this device:", err);
    }

    return () => {
      if (frame) cancelAnimationFrame(frame);
      if (resize) window.removeEventListener("resize", resize);
      if (onPointerMove) window.removeEventListener("pointermove", onPointerMove);
      if (particleGeometry) particleGeometry.dispose();
      if (particleMaterial) particleMaterial.dispose();
      if (ring) ring.geometry.dispose();
      if (ringMaterial) ringMaterial.dispose();
      if (innerRing) innerRing.geometry.dispose();
      if (orb) orb.geometry.dispose();
      if (renderer) {
        if (renderer.domElement && mount && mount.contains(renderer.domElement)) {
          mount.removeChild(renderer.domElement);
        }
        renderer.dispose();
      }
    };
  }, []);

  return <div aria-hidden="true" className="light-field" ref={mountRef} />;
}

function SectionLabel({ children }: { children: string }) {
  return (
    <div className="section-label">
      <span className="section-label-dot" />
      <span>{children}</span>
    </div>
  );
}

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      const p = videoRef.current.play();
      if (p !== undefined) {
        p.catch(() => {});
      }
    }
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  const submitInquiry = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="site-shell">
      <div className="grain" aria-hidden="true" />
      <header className="site-nav">
        <button className="wordmark" onClick={() => scrollTo("top")} aria-label="Studio Digi Mix home">
          <img src="/manus-storage/transparent-studio-digi-mix-logo_e4883715.png" alt="Studio Digi Mix — A complete photo and video solution" />
        </button>
        <nav className={`nav-links ${menuOpen ? "open" : ""}`}>
          <button onClick={() => scrollTo("about")}>The studio</button>
          <button onClick={() => scrollTo("services")}>Services</button>
          <button onClick={() => scrollTo("work")}>Selected work</button>
          <button onClick={() => scrollTo("contact")}>Contact</button>
        </nav>
        <button className="nav-cta" onClick={() => scrollTo("contact")}>
          <span>Book a session</span><ArrowUpRight size={16} />
        </button>
        <button className="menu-button" aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      <section className="hero" id="top">
        <video
          ref={videoRef}
          className="hero-video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={images.hero}
          aria-label="Cinematic exploded-view animation of a professional camera"
        >
          <source src="/manus-storage/create_the_video_50fe6fd4.mp4" type="video/mp4" />
        </video>
        <div className="hero-video-label"><span className="live-dot" /> The craft behind the frame</div>
        <div className="hero-vignette" />
        <LightField />
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-line" /> Maligaon · Guwahati · Assam</p>
          <h1>Make<br /><i>the moment</i><br />stay.</h1>
          <p className="hero-intro">A complete photo &amp; video solution for passport photos, weddings, events, albums, editing, and custom gifts.</p>
          <div className="hero-actions">
            <button className="button button-primary" onClick={() => scrollTo("contact")}>Start a project <ArrowUpRight size={17} /></button>
            <button className="circle-button" onClick={() => scrollTo("work")} aria-label="Explore selected work"><ArrowDownRight size={20} /></button>
          </div>
        </div>
        <div className="hero-side-note"><span>Scroll to explore</span><span className="side-rule" /></div>
        <div className="hero-meta"><span>01</span><span className="meta-rule" /><span>Studio Digi Mix</span></div>
      </section>

      <section className="manifesto" id="about">
        <div className="container manifesto-layout">
          <div className="manifesto-heading">
            <SectionLabel>Our point of view</SectionLabel>
            <h2>Good light<br /><span>changes everything.</span></h2>
          </div>
          <div className="manifesto-copy">
            <p className="lead">We create photographs with a pulse — honest expressions, considered light, and just enough edge to make a frame feel like yours.</p>
            <p>From a first portfolio to a full brand campaign, Studio Digi Mix brings a calm, collaborative set to every shoot. Come as you are. We will take it from there.</p>
            <button className="text-link" onClick={() => scrollTo("contact")}>Meet us on set <MoveRight size={17} /></button>
          </div>
        </div>
        <div className="manifesto-stamp" aria-hidden="true">DM<span>✦</span>01</div>
      </section>

      <section className="services section-dark" id="services">
        <div className="container">
          <div className="section-topline">
            <SectionLabel>What we make</SectionLabel>
            <span className="section-count">02 / 04</span>
          </div>
          <div className="services-intro">
            <h2>Everything for<br /><i>the moment.</i></h2>
            <p>From the first shot to the finished keepsake, we bring photography, video, editing, digital photo mixing, and printing together under one roof.</p>
          </div>
          <div className="service-grid">
            <article className="service-card service-featured">
              <div className="service-index">01</div>
              <Sparkles size={23} className="service-icon" />
              <h3>Passport &amp; events</h3>
              <p>Passport photos plus wedding, birthday, and event video and still photography with a story-first eye.</p>
              <button onClick={() => scrollTo("contact")} className="service-arrow" aria-label="Book wedding or event photography"><ArrowUpRight size={21} /></button>
            </article>
            <article className="service-card">
              <div className="service-index">02</div>
              <Camera size={23} className="service-icon" />
              <h3>Editing &amp; albums</h3>
              <p>Video editing, digital photo mixing, photobook albums, artistic photo frames, and careful lamination.</p>
              <button onClick={() => scrollTo("contact")} className="service-arrow" aria-label="Enquire about albums and frames"><ArrowUpRight size={21} /></button>
            </article>
            <article className="service-card">
              <div className="service-index">03</div>
              <Star size={23} className="service-icon" />
              <h3>Custom printing</h3>
              <p>Mug and T-shirt printing for birthdays, celebrations, gifting, and the people you want to surprise.</p>
              <button onClick={() => scrollTo("contact")} className="service-arrow" aria-label="Enquire about custom printing"><ArrowUpRight size={21} /></button>
            </article>
          </div>
        </div>
      </section>

      <section className="work" id="work">
        <div className="container">
          <div className="section-topline">
            <SectionLabel>Selected work</SectionLabel>
            <span className="section-count dark-count">03 / 04</span>
          </div>
          <div className="work-headline">
            <h2>A little<br /><i>proof.</i></h2>
            <p>Different faces. Different stories. The same attention to the light between the lines.</p>
          </div>
          <div className="work-grid">
            <article className="work-item work-tall">
              <div className="work-image" style={{ backgroundImage: `url(${images.portrait})` }} />
              <div className="work-caption"><span>01 · Portrait</span><span>Quiet confidence</span></div>
            </article>
            <article className="work-item work-wide">
              <div className="work-image" style={{ backgroundImage: `url(${images.fashion})` }} />
              <div className="work-caption"><span>02 · Editorial</span><span>After the rain</span></div>
            </article>
            <article className="work-item work-small">
              <div className="work-image" style={{ backgroundImage: `url(${images.maternity})` }} />
              <div className="work-caption"><span>03 · Portrait</span><span>Soft focus</span></div>
            </article>
            <article className="work-item work-studio">
              <div className="work-image" style={{ backgroundImage: `url(${images.studio})` }} />
              <div className="work-overlay"><Play size={22} fill="currentColor" /><span>Inside the studio</span></div>
              <div className="work-caption"><span>04 · The studio</span><span>Where it happens</span></div>
            </article>
          </div>
          <div className="work-footer"><span>More stories are made here every week.</span><a href="https://www.justdial.com/Guwahati/Studio-Digi-Mix-Maligaon-Chariali-Maligaon/9999PX361-X361-190525190613-K1C2_BZDET/photos" target="_blank" rel="noreferrer">View our photo listing <ArrowUpRight size={16} /></a></div>
        </div>
      </section>

      <section className="proof section-dark">
        <div className="container proof-layout">
          <div>
            <SectionLabel>Why Studio Digi Mix</SectionLabel>
            <h2>Small studio.<br /><span>Big attention.</span></h2>
          </div>
          <div className="proof-list">
            <div className="proof-row"><span className="proof-number">01</span><div><h3>Light that serves the story</h3><p>We shape the set around you — not the other way around.</p></div><Check size={18} /></div>
            <div className="proof-row"><span className="proof-number">02</span><div><h3>A relaxed, guided process</h3><p>Direction when you want it. Space when you need it.</p></div><Check size={18} /></div>
            <div className="proof-row"><span className="proof-number">03</span><div><h3>Right here in Maligaon</h3><p>Easy to find at Sonaram Market, first floor, Maligaon Chariali.</p></div><Check size={18} /></div>
          </div>
        </div>
      </section>

      <section className="contact" id="contact">
        <div className="contact-glow" aria-hidden="true" />
        <div className="container contact-layout">
          <div className="contact-copy">
            <SectionLabel>Let’s make something</SectionLabel>
            <h2>Your next<br /><i>best frame</i><br />starts here.</h2>
            <p>Tell us a little about what you have in mind. We will get back to you with a time, a plan, and a little more excitement.</p>
            <div className="contact-details">
              <div className="contact-phone-stack"><Phone size={16} /><span><a href="tel:+919435044421">+91 94350 44421</a><a href="tel:+916000035726">+91 60000 35726</a></span></div>
              <div><MapPin size={16} /> Sonaram Market, 1st Floor<br /><span>Maligaon Chariali, Guwahati · 781011</span></div>
              <a href="mailto:studiodigimixghy@gmail.com"><Sparkles size={16} /> studiodigimixghy@gmail.com</a>
              <div><Clock3 size={16} /> Opens daily at 09:30 AM</div>
            </div>
          </div>
          <div className="inquiry-card">
            {submitted ? (
              <div className="success-state"><div className="success-icon"><Check size={26} /></div><h3>Message received.</h3><p>Thank you for reaching out. We will be in touch soon to plan your session.</p><button className="text-link" onClick={() => setSubmitted(false)}>Send another note <MoveRight size={17} /></button></div>
            ) : (
              <form onSubmit={submitInquiry}>
                <div className="form-heading"><span>Start a conversation</span><span>04 / 04</span></div>
                <label>Name<input name="name" placeholder="Your name" required /></label>
                <label>What are you planning?<select name="project" defaultValue="" required><option value="" disabled>Select a service</option><option>Passport photo</option><option>Wedding &amp; event photography</option><option>Wedding &amp; event videography</option><option>Video editing</option><option>Digital photo mixing</option><option>Photobook album</option><option>Artistic frame &amp; lamination</option><option>Mug or T-shirt printing</option><option>Something else</option></select></label>
                <label>Tell us a little <textarea name="message" placeholder="Date, mood, or anything we should know…" rows={3} /></label>
                <button type="submit" className="button button-primary form-submit">Send inquiry <ArrowUpRight size={17} /></button>
                <small>We’ll reply with availability and next steps.</small>
              </form>
            )}
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="container footer-main">
          <div className="footer-wordmark"><img src="/manus-storage/transparent-studio-digi-mix-logo_e4883715.png" alt="Studio Digi Mix — A complete photo and video solution" /><small>Photography that feels like you.</small></div>
          <div className="footer-links"><a href="https://www.justdial.com/Guwahati/Studio-Digi-Mix-Maligaon-Chariali-Maligaon/9999PX361-X361-190525190613-K1C2_BZDET" target="_blank" rel="noreferrer">Justdial listing <ArrowUpRight size={14} /></a><a href="https://www.instagram.com/" target="_blank" rel="noreferrer"><Instagram size={15} /> Instagram <ArrowUpRight size={14} /></a></div>
        </div>
        <div className="container footer-bottom"><span>© 2026 Studio Digi Mix · Guwahati, Assam</span><span>94350 44421 · 60000 35726 · studiodigimixghy@gmail.com</span></div>
      </footer>
    </main>
  );
}

export default Home;
