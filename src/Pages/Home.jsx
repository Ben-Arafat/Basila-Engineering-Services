import '../App.css';
import Hero from '../Components/hero';
import Services from '../Components/services';
import Navbar from '../Components/navbar';
import WhyChooseUs from '../Components/WhyChooseUs';
import NeedAssistance from '../Components/need_assistance';
import Expertise from '../Components/expertise';
import SocialMedia from '../Components/socialMedia';
import Footer from '../Components/footer';
import Portfolio from '../Components/portfolio';



const Home = () => {
  return (
    <div className="bg-slate-950 w-auto h-auto">
      <div className = "relative z-10">
        <Hero />
      </div>

      <div className = "px-5 text-center pt-10 h-auto w-full place-items-center">
        <h1 className = "text-white text-2xl lg:text-5xl font-sans font-extrabold lg:font-extrabold antialiased md:subpixel-antialiased">Engineering Excellence. Sustainable Impact.</h1>
        <h2 className = "text-l lg:text-xl font-bold text-white mt-4">
          We don't just install systems - We deliver complete building performance solutions
        </h2>
        <Services />
      </div>

      <div>
        <WhyChooseUs />
      </div>

      <div>
        <NeedAssistance />
      </div>

      <div>
        <Expertise />
      </div>

      <div>
        <Portfolio />
      </div>

      <div>
        <SocialMedia />
      </div>

      <div>
        <Footer />
      </div>

      
    
    </div>

  )
}

export default Home;