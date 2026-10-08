import SiteHeader from './components/SiteHeader.jsx';
import SiteFooter from './components/SiteFooter.jsx';
import Hero from './sections/Hero.jsx';
import Belief from './sections/Belief.jsx';
import Services from './sections/Services.jsx';
import Process from './sections/Process.jsx';
import Packages from './sections/Packages.jsx';
import About from './sections/About.jsx';
import Newsletter from './sections/Newsletter.jsx';
import Contact from './sections/Contact.jsx';

export default function App() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Hero />
        <Belief />
        <Services />
        <Process />
        <Packages />
        <About />
        <Newsletter />
        <Contact />
      </main>
      <SiteFooter />
    </>
  );
}
