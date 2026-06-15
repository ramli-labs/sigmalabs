// ============================================
// Landing Page — SIGMA Labschool
// ============================================

// --- shared globals ---
const { Icon, Navbar, Footer, Link, useRoute, navigate, SectionHeader, Breadcrumb, EmptyState, ModuleCard, LabschoolLogo, BrandStrip, ControlField } = window;
const { useState, useEffect, useRef } = React;

const Landing = () => {
  const kelasSaya = `/kelas/${window.USER.level}`;
  return (
    <div className="page" style={{ background: "var(--bg)" }}>
      <Navbar/>

      {/* HERO */}
      <section style={{ position: "relative", padding: "60px 32px 80px", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 40, right: -80, width: 320, height: 320, borderRadius: "50%", background: "var(--gold-300)", opacity: 0.55, filter: "blur(2px)" }}/>
        <div style={{ position: "absolute", bottom: -60, left: 200, width: 180, height: 180, borderRadius: "50%", background: "var(--info-300)", opacity: 0.45 }}/>
        <div style={{ position: "absolute", top: 140, left: -40, width: 140, height: 140, borderRadius: 40, background: "var(--ai-300)", opacity: 0.38, transform: "rotate(20deg)" }}/>

        <div className="landing-hero-grid" style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: 48, alignItems: "center", maxWidth: 1200, margin: "0 auto", position: "relative" }}>
          <div className="fade-in-up">
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px", borderRadius: "var(--r-full)", background: "white", border: "2px solid var(--ink)", boxShadow: "var(--shadow-chunk-sm)", fontSize: 13, fontWeight: 700, marginBottom: 28 }}>
              <span style={{ width: 8, height: 8, background: "var(--green-500)", borderRadius: "50%" }} className="pulse"/>
              SIGMA · SISTEM INFORMATIKA • GENERASI MAHIR ARTIFISIAL
            </div>

            <h1 className="display" style={{ fontSize: "clamp(30px, 7vw, 84px)", margin: 0, color: "var(--navy-950)" }}>
              Belajar <span style={{ color: "var(--info-500)", fontStyle: "italic" }}>Informatika</span>
              <br/>
              & <span style={{ background: "var(--gold-400)", padding: "0 12px", borderRadius: 14, display: "inline-block", transform: "rotate(-1.5deg)", color: "var(--navy-950)" }}>Koding + AI</span>
              <br/>
              jadi <u style={{ textDecorationColor: "var(--red-500)", textDecorationThickness: 6, textUnderlineOffset: 6 }}>seru!</u>
            </h1>

            <p style={{ fontSize: 18, color: "var(--ink-muted)", lineHeight: 1.5, marginTop: 24, maxWidth: 520 }}>
              Platform interaktif untuk siswa kelas 7, 8, & 9 — modul pengayaan, simulasi, kuis, lab maya, dan gim edukasi langsung di browser. <strong>Mari Berprestasi, Menjadi Juara.</strong>
            </p>

            <div style={{ display: "flex", gap: 12, marginTop: 32, flexWrap: "wrap" }}>
              <Link to="/login" className="btn btn-primary btn-lg">
                Masuk sebagai Siswa <Icon.ArrowRight width="18" height="18"/>
              </Link>
              <Link to={kelasSaya} className="btn btn-lg">
                <Icon.Book width="18" height="18"/> Jelajahi Modul
              </Link>
            </div>
          </div>

          {/* Right: stack of chunky cards (reference from design) */}
          <div className="hide-mobile" style={{ position: "relative", height: 560, display: "block" }}>
            <div className="card fade-in-up" style={{ position: "absolute", top: 20, right: 20, width: 320, padding: 18, transform: "rotate(4deg)", background: "var(--info-100)", animationDelay: "0.1s" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span className="tag tag-info">Informatika • Kelas 8</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-muted)" }}>Modul 3/8</span>
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, lineHeight: 1.1, color: "var(--navy-950)" }}>
                Himpunan Data Terstruktur
              </div>
              <div style={{ marginTop: 14, height: 8, background: "rgba(0,0,0,0.06)", borderRadius: 10, overflow: "hidden" }}>
                <div style={{ width: "62%", height: "100%", background: "var(--info-500)" }}/>
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 14 }}>
                {[1,2,3,4,5].map(i => (
                  <div key={i} style={{ flex: 1, height: 36, borderRadius: 8, background: i <= 3 ? "var(--info-500)" : "white", border: "2px solid var(--ink)" }}/>
                ))}
              </div>
            </div>

            <div className="card fade-in-up" style={{ position: "absolute", top: 120, left: 0, width: 330, padding: 18, transform: "rotate(-3deg)", background: "white", animationDelay: "0.2s" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--ai-400)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", border: "2px solid var(--ink)" }}>
                  <Icon.Sparkles width="20" height="20"/>
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>Tanya AI Tutor</div>
                  <div style={{ fontSize: 12, color: "var(--ink-subtle)" }}>Asisten belajar KKA</div>
                </div>
              </div>
              <div style={{ padding: "10px 12px", background: "var(--ai-100)", borderRadius: 12, fontSize: 13, color: "var(--navy-950)", marginBottom: 8 }}>
                Bantu jelasin cara cek kualitas informasi dong.
              </div>
              <div style={{ padding: "10px 12px", background: "var(--navy-950)", color: "white", borderRadius: 12, fontSize: 13, lineHeight: 1.5 }}>
                Mulai dari sumbernya: siapa penulisnya, kapan terbit, apa buktinya, dan apakah ada sumber lain yang menguatkan…
                <span style={{ display: "inline-block", width: 8, height: 14, background: "var(--ai-400)", marginLeft: 3, verticalAlign: "middle", animation: "blink 1s infinite" }}/>
              </div>
            </div>

            <div className="card fade-in-up" style={{ position: "absolute", bottom: 20, right: 40, width: 240, padding: 18, background: "var(--gold-400)", transform: "rotate(6deg)", animationDelay: "0.3s" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <Icon.Trophy width="26" height="26"/>
                <div style={{ fontWeight: 800, fontSize: 14 }}>BADGE BARU!</div>
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, lineHeight: 1.05, color: "var(--navy-950)" }}>
                Pemuda<br/>Juara Digital
              </div>
              <div style={{ marginTop: 10, fontSize: 12, color: "var(--navy-900)", fontWeight: 600 }}>
                Selesaikan 10 tantangan Scratch berturut-turut 🎉
              </div>
            </div>

            <div className="fade-in-up" style={{ position: "absolute", top: 0, left: 80, padding: "10px 14px", background: "white", border: "2px solid var(--ink)", borderRadius: "var(--r-full)", boxShadow: "var(--shadow-chunk-sm)", display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, animationDelay: "0.4s" }}>
              <Icon.Fire width="16" height="16" style={{ color: "var(--orange-500)" }}/> 7 hari streak!
            </div>
            <div className="fade-in-up" style={{ position: "absolute", bottom: 130, left: 180, padding: "10px 14px", background: "var(--navy-950)", color: "white", borderRadius: "var(--r-full)", display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, boxShadow: "var(--shadow-chunk-sm)", animationDelay: "0.5s" }}>
              <Icon.Bolt width="14" height="14" style={{ color: "var(--gold-400)" }}/> +50 XP
            </div>
          </div>
        </div>
      </section>

      {/* SUBJECT PICKER */}
      <section style={{ padding: "60px 32px", maxWidth: 1200, margin: "0 auto" }}>
        <SectionHeader
          eyebrow="DUA MATA PELAJARAN"
          title="Pilih mau belajar yang mana"
          subtitle="Informatika dan Koding & AI disusun sebagai jalur belajar berurutan dengan materi, misi, kuis, lab, dan gim edukasi."
        />
        <div className="landing-feature-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 30 }}>
          <Link to={kelasSaya} className="card card-hover" style={{ padding: 36, background: "linear-gradient(135deg, var(--info-100) 0%, white 100%)", position: "relative", overflow: "hidden", textDecoration: "none", color: "inherit" }}>
            <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "var(--info-400)", opacity: 0.2 }}/>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, position: "relative" }}>
              <div style={{ width: 64, height: 64, borderRadius: 18, background: "var(--info-500)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", border: "3px solid var(--ink)", boxShadow: "var(--shadow-chunk-sm)" }}>
                <Icon.Cpu width="36" height="36"/>
              </div>
              <span className="tag tag-info">18 Unit</span>
            </div>
            <h3 className="display" style={{ fontSize: 40, margin: "12px 0 8px", color: "var(--navy-950)" }}>Informatika</h3>
            <p style={{ color: "var(--ink-muted)", fontSize: 15, lineHeight: 1.55, margin: 0 }}>
              Berpikir komputasional, komputer, jaringan, data, media digital, keamanan, privasi, dan projek akhir.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 20 }}>
              {["BK", "Komputer", "Jaringan", "Data", "Keamanan", "Etika Digital"].map(t => (
                <span key={t} style={{ padding: "6px 12px", background: "white", border: "1.5px solid var(--ink)", borderRadius: "var(--r-full)", fontSize: 12, fontWeight: 600 }}>{t}</span>
              ))}
            </div>
            <div className="btn btn-info" style={{ marginTop: 24, display: "inline-flex" }}>
              Jelajahi Informatika <Icon.ArrowRight width="16" height="16"/>
            </div>
          </Link>

          <Link to={kelasSaya} className="card card-hover" style={{ padding: 36, background: "linear-gradient(135deg, var(--ai-100) 0%, white 100%)", position: "relative", overflow: "hidden", textDecoration: "none", color: "inherit" }}>
            <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "var(--ai-400)", opacity: 0.2 }}/>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, position: "relative" }}>
              <div style={{ width: 64, height: 64, borderRadius: 18, background: "var(--ai-500)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", border: "3px solid var(--ink)", boxShadow: "var(--shadow-chunk-sm)" }}>
                <Icon.Brain width="36" height="36"/>
              </div>
              <span className="tag tag-ai">18 Unit</span>
            </div>
            <h3 className="display" style={{ fontSize: 40, margin: "12px 0 8px", color: "var(--navy-950)" }}>Koding & AI</h3>
            <p style={{ color: "var(--ink-muted)", fontSize: 15, lineHeight: 1.55, margin: 0 }}>
              Koding, kecerdasan artifisial, pengolahan data, produksi konten digital, etika, dan proyek mini berbasis tantangan.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 20 }}>
              {["Koding", "AI", "Data", "Proyek Mini", "Eksperimen", "Etika"].map(t => (
                <span key={t} style={{ padding: "6px 12px", background: "white", border: "1.5px solid var(--ink)", borderRadius: "var(--r-full)", fontSize: 12, fontWeight: 600 }}>{t}</span>
              ))}
            </div>
            <div className="btn btn-ai" style={{ marginTop: 24, display: "inline-flex" }}>
              Jelajahi Koding & AI <Icon.ArrowRight width="16" height="16"/>
            </div>
          </Link>
        </div>
      </section>

      {/* INTERACTIVE FEATURES */}
      <section style={{ padding: "60px 32px", maxWidth: 1200, margin: "0 auto" }}>
        <SectionHeader
          eyebrow="BELAJAR AKTIF"
          title="3 cara seru belajar"
          subtitle="Bukan cuma baca teori — kamu nyoba, ngulik, dan bikin karya."
        />
        <div className="responsive-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginTop: 30 }}>
          <FeatureCard
            title="Modul Interaktif"
            subtitle={`${window.CURRICULUM.modules.length} modul`}
            description="Setiap topik disajikan dengan teks, ilustrasi, kuis instan, dan AI Tutor untuk tanya-jawab."
            icon="Book" bg="var(--gold-300)" to={kelasSaya}
          />
          <FeatureCard
            title="Misi Belajar"
            subtitle="Misi + peta konsep"
            description="Setelah membaca modul cetak, siswa menjalankan misi, menyusun konsep, lalu mengerjakan mini interaksi yang relevan."
            icon="Puzzle" bg="var(--info-300)" to={kelasSaya}
          />
          <FeatureCard
            title="Portofolio"
            subtitle="Tahap berikutnya"
            description="Refleksi, misi selesai, hasil kuis, badge, dan proyek mini akan terkumpul sebagai rekam belajar siswa."
            icon="Trophy" bg="var(--ai-300)" to="/dashboard"
          />
        </div>
      </section>

      {/* FEATURES DARK */}
      <section style={{ padding: "80px 32px", background: "var(--navy-950)", color: "white", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 40, right: 60, width: 180, height: 180, borderRadius: "50%", background: "var(--gold-400)", opacity: 0.1 }}/>
        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative" }}>
          <div className="responsive-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 48, alignItems: "start" }}>
            <div>
              <div className="tag" style={{ background: "rgba(255,255,255,0.1)", color: "var(--gold-400)", marginBottom: 16 }}>FITUR</div>
              <h2 className="display" style={{ fontSize: 52, margin: 0, lineHeight: 1 }}>
                Belajar aktif, bukan <span style={{ color: "var(--gold-400)" }}>pasif</span>.
              </h2>
              <p style={{ marginTop: 20, fontSize: 16, color: "rgba(255,255,255,0.7)", lineHeight: 1.6, maxWidth: 380 }}>
                Setiap modul dirancang supaya kamu ngulik, mencoba, dan bikin karya — bukan cuma baca teori.
              </p>
            </div>
            <div className="responsive-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                { icon: "Puzzle", title: "Drag & Drop Block", desc: "Rakit algoritma lewat block coding — tanpa typo.", color: "var(--gold-400)" },
                { icon: "Sparkles", title: "Playground AI", desc: "Chatbot mini, klasifikasi gambar & teks langsung.", color: "var(--ai-400)" },
                { icon: "Chart", title: "Simulasi Visual", desc: "Animasi sorting, searching, dan proses jaringan.", color: "var(--info-400)" },
                { icon: "Trophy", title: "Badge & Leaderboard", desc: "Koleksi lencana Pemuda Juara, kompetisi antar kelas.", color: "var(--red-500)" },
              ].map((f, i) => {
                const I = Icon[f.icon];
                return (
                  <div key={i} style={{ padding: 24, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: f.color, color: "var(--navy-950)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                      <I width="26" height="26"/>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 6 }}>{f.title}</div>
                    <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.55 }}>{f.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ padding: "60px 32px", background: "var(--bg-cream)" }}>
        <div className="responsive-grid-4" style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
          {[
            { n: window.CURRICULUM.modules.length, l: "Modul Pembelajaran", s: "Informatika & KKA" },
            { n: window.CURRICULUM.labs.length + window.CURRICULUM.games.length, l: "Aktivitas Misi", s: "Lab/gim kontekstual" },
            { n: "∞", l: "Refleksi", s: "Jurnal belajar siswa" },
            { n: 3, l: "Jenjang Kelas", s: "VII • VIII • IX" },
          ].map((s, i) => (
            <div key={i}>
              <div className="display" style={{ fontSize: 64, color: "var(--navy-950)", lineHeight: 1 }}>{s.n}</div>
              <div style={{ fontSize: 15, fontWeight: 700, marginTop: 4 }}>{s.l}</div>
              <div style={{ fontSize: 13, color: "var(--ink-muted)", marginTop: 2 }}>{s.s}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "80px 32px", textAlign: "center" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <h2 className="display" style={{ fontSize: 56, margin: 0, color: "var(--navy-950)" }}>
            Siap memulai?
          </h2>
          <p style={{ fontSize: 17, color: "var(--ink-muted)", marginTop: 16, marginBottom: 30, lineHeight: 1.5 }}>
            Masuk ke dashboard, pilih modul pertamamu, dan mulai koleksi XP & badge hari ini.
          </p>
          <Link to="/dashboard" className="btn btn-primary btn-lg">
            Masuk ke Dashboard <Icon.ArrowRight width="18" height="18"/>
          </Link>
        </div>
      </section>

      <Footer/>
    </div>
  );
};

const FeatureCard = ({ title, subtitle, description, icon, bg, to }) => {
  const I = Icon[icon];
  return (
    <Link to={to} className="card card-hover" style={{ padding: 26, background: "white", textDecoration: "none", color: "inherit", display: "block" }}>
      <div style={{ width: 56, height: 56, borderRadius: 14, background: bg, border: "2px solid var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18, color: "var(--navy-950)" }}>
        <I width="30" height="30"/>
      </div>
      <div style={{ fontSize: 11, fontWeight: 800, color: "var(--ink-subtle)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>{subtitle}</div>
      <h3 className="display" style={{ fontSize: 26, margin: "0 0 8px" }}>{title}</h3>
      <p style={{ fontSize: 14, color: "var(--ink-muted)", margin: 0, lineHeight: 1.55 }}>{description}</p>
    </Link>
  );
};

window.Landing = Landing;
