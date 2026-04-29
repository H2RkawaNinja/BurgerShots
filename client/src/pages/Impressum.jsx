import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const Impressum = () => (
  <div className="min-h-screen bg-dark-900 text-white">
    <Header />
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="font-display text-5xl tracking-wider mb-8">IMPRESSUM</h1>
      <div className="burger-card p-6 space-y-4 text-dark-300">
        <div>
          <h2 className="font-semibold text-white mb-1">Angaben gemäß § 5 TMG</h2>
          <p>BurgerShot GmbH<br />Musterstraße 1<br />12345 Musterstadt</p>
        </div>
        <div>
          <h2 className="font-semibold text-white mb-1">Kontakt</h2>
          <p>Telefon: +49 (0) 123 456789<br />E-Mail: info@burgershot.de</p>
        </div>
        <div>
          <h2 className="font-semibold text-white mb-1">Handelsregister</h2>
          <p>Handelsregister: HRB 12345<br />Registergericht: Amtsgericht Musterstadt</p>
        </div>
        <div>
          <h2 className="font-semibold text-white mb-1">Umsatzsteuer-ID</h2>
          <p>Umsatzsteuer-Identifikationsnummer gemäß §27a UStG: DE123456789</p>
        </div>
        <div>
          <h2 className="font-semibold text-white mb-1">Haftungsausschluss</h2>
          <p className="text-sm">Die Inhalte dieser Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.</p>
        </div>
      </div>
    </div>
    <Footer />
  </div>
);

export default Impressum;
