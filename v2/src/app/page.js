'use client';
import { useEffect, useRef } from 'react';
import styles from "./page.module.css";
import MarginCanvas from './components/MarginCanvas';
import MarginCanvas2 from './components/MarginCanvas2';
import Link from 'next/link';

export default function Home() {
  const sectionsRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Only animate the thread above this section
            const thread = entry.target.previousElementSibling;
            if (thread?.classList.contains(styles.thread)) {
              setTimeout(() => {
                thread.classList.add(styles.visible);
              }, 300);
            }
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: '-50px',
      }
    );

    sectionsRef.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  const sections = [
    {
      title: "Who I Am",
      content: (
        <ul>
          <li>A builder who believes creative tools should be as open-ended as the ideas they shape.</li>
          {/* <li>A systems thinker fascinated by hierarchies, status, and the invisible forces that drive the internet.</li> */}
          {/* <li>A digital native who has been navigating forums, subcultures, and contradictions before I even knew the word for them.</li> */}
        </ul>
      )
    },
    {
      title: "Where I Started",
      content: (
        <ul>
          <li>My first love in software was D3.js—a visualization framework that taught me <i>if I can think it, I can build it</i>.</li>
          <li>My second love in software is generative AI, which enables  tools that don&apos;t just automate, but augment creativity.</li>
        </ul>
      )
    },    
    {
      title: "What I Think About",
      content: (
        <ul>
            <li>The internet&apos;s unintended consequences, and how it shapes modern hierarchies of power and status.</li>
            <li>How AI can shape not just what we create, but how we think.</li>
            <li>The future of digital tools—how they evolve from rigid interfaces to fluid, thought-driven environments.</li>                    
        </ul>
      )
    },    
    {
      title: "Where I'm Going",
      content: (
        <ul>
            <li>I&apos;m building a suite of AI tools that help people ideate, refine, and publish their best work.</li>
            <li>I write to make sense of the internet—and maybe, to help others do the same.</li>
            {/* <li>The future of digital tools—how they evolve from rigid interfaces to fluid, thought-driven environments.</li>                     */}
        </ul>
      )
    }
  ];

  return (
    <div className={styles.page}>
      <div id="about-me" className="w-3/4 h-fit" style={{ position: 'fixed', top: '2rem', left: '2rem', maxWidth: '600px' }}>
        <div className="flex flex-col justify-start h-fit p-10 text-left relative">
          <div style={{ background: "linear-gradient(90deg,#44ff9a -.55%,#44b0ff 22.86%,#8b44ff 48.36%,#f64 73.33%,#ebff70 99.34%)" }} className='absolute z-0 duration-1000 -inset-2 transitiona-all opacity-20 rounded-xl blur-2xl filter'></div>
          <div className="relative bg-white rounded-xl p-6! border border-gray-200 flex flex-col justify-between">
            <div>
          <h1 className="relative text-4xl font-bold text-gray-900">Hi, I'm Anjali</h1>
          <div className='relative'>Pictures and fancy stuff TK</div>
          <br/><br/>
          <div className="relative mt-6">
            <div className="absolute left-0 top-0 w-1 h-full bg-black"></div>
            <div className="relative left-5 space-y-12 pl-6">
              <div className="relative">
                <h2 className="text-xl font-semibold text-gray-800">Museboard</h2>
                <p className="text-gray-600">An infinite AI-powered canvas for ideation and creative exploration.</p>
              </div>
              <br/>
              <div className="relative">
                <h2 className="text-xl font-semibold text-gray-800">StyleSense.io</h2>
                <p className="text-gray-600">A platform for personalized beauty recommendations powered by AI.</p>
              </div>
              <br/>
              <div className="relative">
                <h2 className="text-xl font-semibold text-gray-800">Adobe Express Growth</h2>
                <p className="text-gray-600">Drove monetization and acquisition for one of Adobe&apos;s first freemium products.</p>
              </div>      
              <br/>
              <div className="relative">
                <h2 className="text-xl font-semibold text-gray-800">SampleSizeCalc.com</h2>
                <p className="text-gray-600">blah blah</p>
              </div>      
              <br/>
              <div className="relative">
                <h2 className="text-xl font-semibold text-gray-800">More to come...</h2>
              </div>
            </div>
          </div>
          </div>
          </div>
        </div>
      </div>
      <div id="cards-spiral" style={{ height: '300vh', marginLeft: 'auto', width: '50%' }}>
        <MarginCanvas />
        <main className={styles.main}>
          {sections.map((section, index) => (
            <div key={section.title}>
              {index > 0 && <div className={styles.thread} />}
              <section
                ref={(el) => (sectionsRef.current[index] = el)}
                className={styles.section}
                style={index === sections.length - 1 ? { position: 'sticky', top: 'calc(300vh - 300px)' } : {}}
              >
                <h2>{section.title}</h2>
                {section.content}
              </section>
            </div>
          ))}
        </main>
        <section className={styles.section} style={{ position: 'sticky', top: 'calc(300vh - 700px)' }}>
          <h2>Let's chat</h2>
          <ul>
            <li>Some of my closest friends were strangers who messaged on a whim.</li>
            <li>reach me quickest <Link href="https://x.com/anjali_shriva">@anjali_shriva</Link>.</li>
            <li>for a more serious medium, <Link href="mailto:anjali.shrivastava99@gmail.com">email me</Link>.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}