import { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { ArrowRight, Sparkles, Heart, Calendar, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import jarHeroImage from '@/assets/jar-hero.jpg';

function FeatureCard({ icon: Icon, title, description, delay }: { icon: typeof Sparkles; title: string; description: string; delay: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay }} className="glass-panel p-6 md:p-8">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h3 className="text-xl font-display font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  );
}

export default function Index() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const jarY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const jarScale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md">
        <nav className="container-wide flex items-center justify-between h-16">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-medium">Empty Jar</span>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Link to="/app" className="btn-primary text-sm py-2.5">Open app<ArrowRight className="w-4 h-4" /></Link>
          </motion.div>
        </nav>
      </header>

      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-16">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 40%, hsl(35 90% 95% / 0.5) 0%, transparent 70%)' }} />
        <div className="container-wide relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[calc(100vh-4rem)]">
            <motion.div style={{ opacity: textOpacity }} className="text-center lg:text-left order-2 lg:order-1">
              <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-overline text-primary inline-block mb-4">A gratitude practice for the modern soul</motion.span>
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-display mb-6">One note a week.<br /><span className="gradient-text-accent">A year you can replay.</span></motion.h1>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-body-lg text-muted-foreground max-w-lg mx-auto lg:mx-0 mb-8">Collect your weekly moments of gratitude in a beautiful jar. At year's end, rediscover fifty-two reasons to smile.</motion.p>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/app" className="btn-primary text-lg px-8 py-4">Add this week's note<ArrowRight className="w-5 h-5" /></Link>
                <Link to="/app" className="btn-secondary text-lg px-8 py-4"><Play className="w-5 h-5" />See a sample year</Link>
              </motion.div>
            </motion.div>
            <motion.div style={{ y: jarY, scale: jarScale }} className="order-1 lg:order-2 flex items-center justify-center h-[400px] sm:h-[500px] lg:h-[600px]">
              <div className="relative">
                {/* Soft glow behind jar */}
                <div className="absolute inset-0 blur-3xl opacity-60 bg-gradient-to-b from-amber-200/40 via-orange-200/30 to-transparent scale-110" />
                <motion.img 
                  src={jarHeroImage} 
                  alt="Mason jar filled with warm fairy lights" 
                  className="relative z-10 w-auto h-[350px] sm:h-[450px] lg:h-[550px] object-contain drop-shadow-2xl"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  whileHover={{ scale: 1.02 }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-muted/30">
        <div className="container-wide">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-heading mb-4">Simple by design</h2>
            <p className="text-body-lg text-muted-foreground">No complex features. No endless customization. Just you, your thoughts, and a jar that fills with meaning.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard icon={Sparkles} title="Weekly ritual" description="One prompt per week keeps you focused. Write when you're ready—no pressure, no streaks." delay={0} />
            <FeatureCard icon={Heart} title="Capture what matters" description="Small wins, big moments, people you love. Tag and categorize however feels right." delay={0.1} />
            <FeatureCard icon={Calendar} title="Year in review" description="After 10 notes, unlock a cinematic replay of your year. Gratitude, visualized." delay={0.2} />
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-tight">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="glass-panel p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, hsl(35 90% 70% / 0.1) 0%, transparent 60%)' }} />
            <div className="relative z-10">
              <h2 className="text-heading mb-4">Start your jar today</h2>
              <p className="text-body-lg text-muted-foreground max-w-md mx-auto mb-8">It takes less than a minute to add your first note. Your future self will thank you.</p>
              <Link to="/app" className="btn-primary text-lg px-8 py-4">Begin your practice<ArrowRight className="w-5 h-5" /></Link>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="py-8 border-t border-border">
        <div className="container-wide flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-muted-foreground"><Sparkles className="w-4 h-4" /><span className="text-sm">Empty Jar</span></div>
          <p className="text-caption">Made with care. Collect what matters.</p>
        </div>
      </footer>
    </div>
  );
}
