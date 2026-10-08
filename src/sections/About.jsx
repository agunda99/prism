import SpectrumRule from '../components/SpectrumRule.jsx';

export default function About() {
  return (
    <section className="about section-pad" id="about">
      <div className="section-kicker"><span>05</span><SpectrumRule /> A DIFFERENT KIND OF PRACTICE</div>
      <div className="about-grid">
        <div><h2>Senior in the room.<br /><em>Close to the work.</em></h2></div>
        <div className="about-copy">
          <p className="about-lead">Prism is a principal-led brand practice, based in Nairobi and working across Africa and beyond.</p>
          <p>One accountable lead stays close from the first diagnostic to the last decision. When the work needs a particular kind of depth, the right specialists join in. No hand-offs. No unnecessary layers. Just the people the work actually needs.</p>
          <div className="founder-lockup"><span className="founder-symbol">P</span><span><strong>PRISM</strong><small>FOUNDED BY AUSTINE [SURNAME]</small></span></div>
        </div>
      </div>
      <div className="about-bottom"><span>NAIROBI, KENYA</span><span>WORKING ACROSS AFRICA &amp; THE WORLD</span><span>INDEPENDENT BY DESIGN</span></div>
    </section>
  );
}
