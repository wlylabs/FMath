import { Header } from './components/Header';
import { Features, Hero } from './components/Hero';
import { CalculatorSection, Faq, Footer, Methodology } from './components/Sections';

export function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <CalculatorSection />
        <Features />
        <Methodology />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
