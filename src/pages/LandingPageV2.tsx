import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Network, Activity, ShieldAlert, Scan, ArrowRight, Zap, Target, Binary } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

// ===============
// NAVBAR COMPONENT
// ===============
const Navbar = () => {
    const navRef = useRef<HTMLElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                gsap.to(navRef.current, {
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(16px)',
                    borderBottom: '1px solid #E8E8E8',
                    duration: 0.3,
                });
            } else {
                gsap.to(navRef.current, {
                    backgroundColor: 'transparent',
                    backdropFilter: 'blur(0px)',
                    borderBottom: '1px solid transparent',
                    duration: 0.3,
                });
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 flex justify-center mt-6 px-4">
            <nav
                ref={navRef}
                className="flex items-center justify-between w-full max-w-4xl px-8 py-4 rounded-full transition-colors duration-300"
            >
                <div className="text-xl font-bold tracking-tight text-linkedin-text flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                    <div className="w-6 h-6 rounded-md bg-gradient-to-br from-linkedin-primary to-linkedin-primary-light" />
                    LeadFlow AI
                </div>
                <div className="hidden md:flex gap-8 text-linkedin-text-muted text-sm font-medium">
                    <a href="#features" className="hover:text-linkedin-primary transition hover:-translate-y-[1px]">Protocol</a>
                    <a href="#philosophy" className="hover:text-linkedin-primary transition hover:-translate-y-[1px]">Manifesto</a>
                    <a href="#pricing" className="hover:text-linkedin-primary transition hover:-translate-y-[1px]">Membership</a>
                </div>
                <button
                    onClick={() => navigate('/signup')}
                    className="group relative overflow-hidden bg-linkedin-primary text-white px-6 py-2 rounded-full font-bold text-sm tracking-wide transition-transform hover:scale-105 shadow-md shadow-linkedin-primary/20"
                >
                    <span className="relative z-10 flex items-center gap-2">
                        Access Terminal <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-linkedin-primary-dark transform scale-x-0 origin-left transition-transform group-hover:scale-x-100 z-0"></div>
                </button>
            </nav>
        </header>
    );
};

// ===============
// HERO COMPONENT
// ===============
const Hero = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                '.hero-el',
                { y: 40, opacity: 0 },
                { y: 0, opacity: 1, duration: 1.2, stagger: 0.15, ease: 'power3.out', delay: 0.2 }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={containerRef} className="relative h-[100dvh] flex items-end pb-32">
            {/* Background with subtle grid/shapes */}
            <div className="absolute inset-0 overflow-hidden bg-linkedin-bg">
                {/* Abstract shapes mimicking depth but strictly white/light-blue */}
                <div className="absolute top-[20%] right-[10%] w-[600px] h-[600px] bg-linkedin-primary-lighter/40 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-white rounded-full blur-[100px]" />

                {/* Subtle Grid overlay */}
                <div className="absolute inset-0 mix-blend-multiply opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#191919 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

                {/* Gradient fade down */}
                <div className="absolute inset-0 bg-gradient-to-t from-linkedin-bg via-linkedin-bg/50 to-transparent" />
            </div>

            <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col items-start gap-4">
                <div className="hero-el inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-mono text-linkedin-primary mb-4 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-linkedin-primary animate-pulse" />
                    SYSTEM V2 // ONLINE
                </div>

                <h1 className="hero-el text-6xl md:text-8xl lg:text-[7rem] leading-[0.9] tracking-tighter text-linkedin-text font-sans font-extrabold max-w-4xl">
                    Outreach is an <br />
                    <span className="font-serif italic font-light text-linkedin-primary">Algorithm.</span>
                </h1>

                <p className="hero-el text-lg max-w-xl text-linkedin-text-muted mt-6 font-medium">
                    Bridge the gap between raw data and high-value conversations. A digital instrument engineered for precision B2B acquisition.
                </p>

                <div className="hero-el mt-8 flex items-center gap-6">
                    <button
                        onClick={() => navigate('/signup')}
                        className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full bg-linkedin-primary text-white font-bold tracking-wide overflow-hidden transition-transform hover:scale-[1.03] duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] shadow-lg shadow-linkedin-primary/25"
                    >
                        <span className="relative z-10 hidden group-hover:block absolute inset-0 bg-white/10" />
                        <span className="relative z-10">Initialize Sequence</span>
                        <Zap size={18} className="relative z-10 group-hover:text-yellow-300 transition-colors" />
                    </button>

                    <button onClick={() => {
                        const features = document.getElementById('features');
                        features?.scrollIntoView({ behavior: 'smooth' });
                    }} className="text-sm font-bold text-linkedin-text hover:text-linkedin-primary transition flex items-center gap-2 border-b border-transparent hover:border-linkedin-primary pb-1">
                        View Capabilities
                    </button>
                </div>
            </div>
        </section>
    );
};

// ===============
// FEATURES COMPONENT
// ===============
const Features = () => {
    const sectionRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo('.feature-card',
                { y: 60, opacity: 0 },
                {
                    y: 0, opacity: 1,
                    stagger: 0.15,
                    duration: 1,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top 70%'
                    }
                }
            );
        }, sectionRef);
        return () => ctx.revert();
    }, []);

    // Card 1: Diagnostic Shuffler
    const [cards, setCards] = useState(["Profile Extraction", "Data Enrichment", "Connection Scoring"]);
    useEffect(() => {
        const interval = setInterval(() => {
            setCards(prev => {
                const next = [...prev];
                const last = next.pop();
                if (last) next.unshift(last);
                return next;
            });
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // Card 2: Telemetry Typewriter
    const typingSequence = [
        "[SCANNING] Tech Founders...",
        "[ENRICHING] 42 Profiles...",
        "[DRAFTING] Pitch Alpha...",
        "[SENDING] Connect Request..."
    ];
    const [typeIndex, setTypeIndex] = useState(0);
    const [text, setText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const currentWord = typingSequence[typeIndex];
        let timeoutId: ReturnType<typeof setTimeout>;

        if (isDeleting) {
            if (text === "") {
                setIsDeleting(false);
                setTypeIndex((prev) => (prev + 1) % typingSequence.length);
            } else {
                timeoutId = setTimeout(() => {
                    setText(prev => prev.slice(0, -1));
                }, 30);
            }
        } else {
            if (text === currentWord) {
                timeoutId = setTimeout(() => setIsDeleting(true), 2000);
            } else {
                timeoutId = setTimeout(() => {
                    setText(prev => currentWord.slice(0, prev.length + 1));
                }, 60);
            }
        }
        return () => clearTimeout(timeoutId);
    }, [text, isDeleting, typeIndex]);

    // Card 3: Rate-Limit Guardian
    const [cursorPos, setCursorPos] = useState({ x: 20, y: 80 });
    const [showBadge, setShowBadge] = useState(false);

    useEffect(() => {
        const sequence = async () => {
            while (true) {
                setShowBadge(false);
                // Move in
                setCursorPos({ x: 20, y: 80 });
                await new Promise(r => setTimeout(r, 800));
                // Move to target
                setCursorPos({ x: 70, y: 30 });
                await new Promise(r => setTimeout(r, 600));
                // Click action
                setShowBadge(true);
                await new Promise(r => setTimeout(r, 2000));
                // Move out
                setCursorPos({ x: 120, y: 120 });
                await new Promise(r => setTimeout(r, 1000));
            }
        };
        sequence();
    }, []);

    return (
        <section id="features" ref={sectionRef} className="py-32 px-6 md:px-12 bg-white relative z-10 min-h-screen flex flex-col justify-center">
            <div className="max-w-7xl mx-auto w-full">
                <h2 className="text-sm font-mono text-linkedin-primary uppercase tracking-[0.2em] mb-4 font-bold">Interactive Functional Artifacts</h2>
                <h3 className="text-4xl md:text-5xl font-extrabold font-sans mb-16 tracking-tight max-w-2xl text-linkedin-text">
                    Engineered for <span className="font-serif italic text-linkedin-primary font-light">Precision.</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Card 1 */}
                    <div className="feature-card bg-white border border-[#E8E8E8] rounded-[1.5rem] p-8 shadow-md shadow-[rgba(0,0,0,0.06)] flex flex-col h-[400px]">
                        <div className="flex items-center gap-3 mb-8 text-linkedin-primary">
                            <Network size={24} />
                            <h4 className="font-bold text-lg text-linkedin-text">Network Extractor</h4>
                        </div>
                        <div className="flex-1 relative flex items-center justify-center">
                            {cards.map((card, i) => (
                                <div
                                    key={card}
                                    className="absolute w-full py-4 text-center rounded-2xl bg-white text-linkedin-text font-medium text-sm transition-all duration-[800ms] shadow-lg border border-[#E8E8E8]"
                                    style={{
                                        transform: `translateY(${(i - 1) * -30}px) scale(${1 - i * 0.05})`,
                                        opacity: 1 - i * 0.3,
                                        zIndex: 3 - i,
                                        transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
                                    }}
                                >
                                    {card}
                                </div>
                            ))}
                        </div>
                        <p className="text-linkedin-text-muted text-sm mt-8">Continually cycling target pipelines for maximum relevance and engagement potential.</p>
                    </div>

                    {/* Card 2 */}
                    <div className="feature-card bg-white border border-[#E8E8E8] rounded-[1.5rem] p-8 shadow-md shadow-[rgba(0,0,0,0.06)] flex flex-col h-[400px]">
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-3 text-linkedin-primary">
                                <Activity size={24} />
                                <h4 className="font-bold text-lg text-linkedin-text">Campaign Telemetry</h4>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-mono uppercase bg-linkedin-bg px-2 py-1 rounded text-linkedin-text">
                                <div className="w-1.5 h-1.5 bg-linkedin-green rounded-full animate-pulse" />
                                Live Engine
                            </div>
                        </div>
                        <div className="flex-1 bg-linkedin-bg rounded-2xl p-4 font-mono text-sm text-linkedin-text flex items-start w-full overflow-hidden border border-[#E8E8E8] shadow-inner">
                            <div>
                                <span className="text-linkedin-text-light opacity-70">root@leadflow:~$</span>
                                <div className="mt-2 text-linkedin-text font-medium">
                                    {text}<span className="inline-block w-2 bg-linkedin-primary h-4 ml-1 animate-pulse" />
                                </div>
                            </div>
                        </div>
                        <p className="text-linkedin-text-muted text-sm mt-8">Real-time asynchronous execution logs providing absolute transparency.</p>
                    </div>

                    {/* Card 3 */}
                    <div className="feature-card bg-white border border-[#E8E8E8] rounded-[1.5rem] p-8 shadow-md shadow-[rgba(0,0,0,0.06)] flex flex-col h-[400px]">
                        <div className="flex items-center gap-3 mb-8 text-linkedin-primary">
                            <ShieldAlert size={24} />
                            <h4 className="font-bold text-lg text-linkedin-text">Rate-Limit Guardian</h4>
                        </div>
                        <div className="flex-1 relative bg-linkedin-bg/50 rounded-2xl border border-[#E8E8E8] overflow-hidden">
                            {/* Grid background */}
                            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #E8E8E8 1px, transparent 0)', backgroundSize: '20px 20px' }} />

                            {/* Animated Cursor */}
                            <div
                                className="absolute w-5 h-5 transition-all duration-[600ms] ease-out z-10"
                                style={{ left: `${cursorPos.x}%`, top: `${cursorPos.y}%` }}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M4 4L11.381 22.452L13.844 14.844L21.452 12.381L4 4Z" fill="#191919" stroke="#E8E8E8" strokeWidth="1.5" strokeLinejoin="round" />
                                </svg>
                            </div>

                            {/* Badge target */}
                            <div className="absolute top-[30%] left-[70%] transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-linkedin-primary/30 flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-linkedin-primary/50" />
                            </div>

                            {/* Success Badge */}
                            <div className={`absolute top-[45%] left-1/2 transform -translate-x-1/2 bg-white text-linkedin-green text-xs font-bold px-4 py-2 rounded-full border border-[#E8E8E8] transition-opacity duration-300 shadow-md whitespace-nowrap ${showBadge ? 'opacity-100' : 'opacity-0'}`}>
                                Safe Delivery Validated
                            </div>
                        </div>
                        <p className="text-linkedin-text-muted text-sm mt-8">Algorithmic pacing that perfectly matches human cadences, securing your domain standing.</p>
                    </div>

                </div>
            </div>
        </section>
    );
};

// ===============
// PHILOSOPHY COMPONENT
// ===============
const Philosophy = () => {
    const textRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const words = document.querySelectorAll('.phil-word');
            gsap.fromTo(words,
                { y: 30, opacity: 0 },
                {
                    y: 0, opacity: 1, stagger: 0.1, duration: 1.2, ease: "power3.out",
                    scrollTrigger: {
                        trigger: textRef.current,
                        start: "top 75%",
                    }
                }
            );
        }, textRef);
        return () => ctx.revert();
    }, []);

    return (
        <section id="philosophy" className="relative py-40 bg-linkedin-bg text-center overflow-hidden flex items-center justify-center">
            {/* Background texture via arbitrary elements */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #191919 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

            <div ref={textRef} className="relative z-10 max-w-4xl px-4">
                <p className="text-xl md:text-2xl text-linkedin-text-muted font-medium mb-8">
                    {"Most SDR tools focus on: Blind volume and spam.".split(' ').map((word, i) => (
                        <span key={i} className="phil-word inline-block mr-2">{word}</span>
                    ))}
                </p>
                <h2 className="text-5xl md:text-7xl font-serif italic text-linkedin-text leading-tight">
                    {"We focus on: ".split(' ').map((word, i) => (
                        <span key={i} className="phil-word inline-block mr-3">{word}</span>
                    ))}
                    <span className="text-linkedin-primary phil-word inline-block font-medium drop-shadow-sm">
                        Surgical precision.
                    </span>
                </h2>
            </div>
        </section>
    );
};

// ===============
// PROTOCOL COMPONENT (Sticky Stacking)
// ===============
const Protocol = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Advanced ScrollTrigger Pinning for Stacked Cards
        const ctx = gsap.context(() => {
            const cards = gsap.utils.toArray('.protocol-card') as HTMLElement[];

            cards.forEach((card, index) => {
                if (index === cards.length - 1) return; // last card doesn't need to scale down
                let nextCard = cards[index + 1];

                gsap.to(card, {
                    scale: 0.9,
                    opacity: 0.4,
                    filter: "blur(10px)",
                    ease: "none",
                    scrollTrigger: {
                        trigger: nextCard,
                        start: "top bottom",
                        end: "top top",
                        scrub: true,
                    }
                });
            });
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={containerRef} className="bg-linkedin-bg relative pb-20">
            <div className="h-screen w-full sticky top-0 protocol-card flex items-center justify-center p-6 sm:p-12 z-10">
                <div className="w-full max-w-6xl h-full max-h-[800px] bg-white border border-[#E8E8E8] rounded-[2rem] p-12 flex flex-col justify-center overflow-hidden relative shadow-md">
                    <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at center, #0A66C2 0%, transparent 50%)' }} />
                    <div className="relative z-10 max-w-2xl">
                        <Scan size={48} className="text-linkedin-primary mb-8" />
                        <h2 className="text-6xl font-bold mb-4 text-linkedin-text">Phase I <br /><span className="font-serif italic text-linkedin-primary font-light">The Audience</span></h2>
                        <p className="text-2xl text-linkedin-text-muted font-medium leading-relaxed">
                            Deep Context Awareness.<br />We analyze thousands of unstructured data points to perfectly isolate your ideal buyer persona before a single message is sent.
                        </p>
                    </div>
                </div>
            </div>

            <div className="h-screen w-full sticky top-0 protocol-card flex items-center justify-center p-6 sm:p-12 z-20">
                <div className="w-full max-w-6xl h-full max-h-[800px] bg-white border border-[#E8E8E8] rounded-[2rem] p-12 flex flex-col justify-center overflow-hidden relative shadow-md">
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-linkedin-primary animate-[scan_3s_ease-in-out_infinite]" style={{ boxShadow: '0 0 20px rgba(10, 102, 194, 0.4)' }} />
                    <div className="relative z-10 w-full flex justify-end">
                        <div className="max-w-xl text-right">
                            <div className="flex justify-end mb-8"><Binary size={48} className="text-linkedin-primary" /></div>
                            <h2 className="text-6xl font-bold mb-4 text-linkedin-text">Phase II <br /><span className="font-serif italic text-linkedin-primary font-light">The Score</span></h2>
                            <p className="text-2xl text-linkedin-text-muted font-medium leading-relaxed">
                                Instant Lead Scoring.<br />Proprietary ML models rank prospects based on propensity to buy, ensuring priority delivery to high-yield targets.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="h-screen w-full sticky top-0 protocol-card flex items-center justify-center p-6 sm:p-12 z-30">
                <div className="w-full max-w-6xl h-full max-h-[800px] bg-linkedin-bg border border-[#E8E8E8] rounded-[2rem] p-12 flex flex-col justify-center overflow-hidden relative shadow-md">
                    <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path stroke="#0A66C2" strokeWidth="0.5" fill="none" d="M0,50 Q25,20 50,50 T100,50" className="animate-[pulse_4s_infinite]" />
                        <path stroke="#0A66C2" strokeWidth="0.3" fill="none" d="M0,60 Q25,30 50,60 T100,60" className="animate-[pulse_5s_infinite]" />
                    </svg>
                    <div className="relative z-10 max-w-2xl mx-auto text-center">
                        <Target size={48} className="text-linkedin-primary mx-auto mb-8 animate-pulse" />
                        <h2 className="text-6xl font-bold mb-4 text-linkedin-text">Phase III <br /><span className="font-serif italic text-linkedin-primary font-light">The Delivery</span></h2>
                        <p className="text-2xl text-linkedin-text-muted font-medium leading-relaxed mb-12">
                            Automated, hyper-personalized engagement sequences that mirror human outreach and break through the noise.
                        </p>
                        <button className="bg-linkedin-primary text-white px-8 py-4 rounded-full font-bold shadow-[0_4px_14px_rgba(10,102,194,0.39)] hover:shadow-[0_6px_20px_rgba(10,102,194,0.23)] hover:-translate-y-0.5 transition-all duration-300">
                            Initialize Phase III
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

// ===============
// MEMBERSHIP / CTA
// ===============
const CTAMembership = () => {
    const navigate = useNavigate();
    return (
        <section id="pricing" className="py-32 px-4 flex justify-center bg-white relative overflow-hidden border-t border-[#E8E8E8]">
            {/* Container Warp Glass */}
            <div className="relative w-full max-w-5xl rounded-[2rem] p-16 overflow-hidden bg-white border border-[#E8E8E8] shadow-lg flex flex-col items-center text-center group cursor-crosshair">

                {/* Animated Background Star Beams */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(10,102,194,0.05)_0,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
                    <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-linkedin-primary to-transparent opacity-0 group-hover:opacity-50 blur-[2px] transition-all duration-700 ease-out flex" />
                </div>

                <h2 className="relative z-10 text-5xl md:text-7xl font-extrabold tracking-tighter mb-6 text-linkedin-text">
                    Start Automating Outreach
                </h2>
                <p className="relative z-10 text-xl text-linkedin-text-muted font-medium max-w-2xl mb-12 font-serif italic">
                    Join leading B2B organizations who treat pipeline generation as an engineering problem.
                </p>

                <button
                    onClick={() => navigate('/signup')}
                    className="relative z-10 scale-100 hover:scale-[1.03] transition-transform duration-300"
                >
                    <div className="absolute inset-0 bg-linkedin-primary rounded-full blur-xl opacity-20 animate-pulse" />
                    <div className="relative px-12 py-5 bg-linkedin-primary text-white font-bold rounded-full text-lg tracking-wide flex items-center gap-3 shadow-md">
                        Engage Protocol <ArrowRight size={20} />
                    </div>
                </button>

            </div>
        </section>
    );
};

// ===============
// FOOTER
// ===============
const Footer = () => {
    return (
        <footer className="bg-linkedin-bg pt-24 pb-8 px-8 md:px-16 rounded-t-[2rem] relative overflow-hidden border-t border-[#E8E8E8] mt-16">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 relative z-10">

                <div className="md:col-span-5 flex flex-col justify-between">
                    <div>
                        <h3 className="text-2xl font-bold text-linkedin-text mb-2 flex items-center gap-2">
                            <div className="w-5 h-5 rounded bg-linkedin-primary" />
                            LeadFlow
                        </h3>
                        <p className="text-linkedin-text-muted font-serif italic">Precision B2B Acquisition.</p>
                    </div>

                    <div className="mt-16 sm:mt-0 flex items-center gap-3 bg-white w-max px-4 py-2 rounded-full border border-[#E8E8E8] shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-linkedin-green animate-[pulse_2s_infinite]" />
                        <span className="font-mono text-xs text-linkedin-text uppercase tracking-widest">System Operational</span>
                    </div>
                </div>

                <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm font-medium">
                    <div className="flex flex-col gap-4">
                        <h4 className="text-linkedin-text mb-2 font-bold">Protocol</h4>
                        <a href="#" className="text-linkedin-text-muted hover:text-linkedin-primary transition">Network Extraction</a>
                        <a href="#" className="text-linkedin-text-muted hover:text-linkedin-primary transition">Lead Scoring</a>
                        <a href="#" className="text-linkedin-text-muted hover:text-linkedin-primary transition">Automation Engine</a>
                    </div>
                    <div className="flex flex-col gap-4">
                        <h4 className="text-linkedin-text mb-2 font-bold">Company</h4>
                        <a href="#" className="text-linkedin-text-muted hover:text-linkedin-primary transition">Manifesto</a>
                        <a href="#" className="text-linkedin-text-muted hover:text-linkedin-primary transition">Engineers</a>
                        <a href="#" className="text-linkedin-text-muted hover:text-linkedin-primary transition">Careers</a>
                    </div>
                    <div className="flex flex-col gap-4">
                        <h4 className="text-linkedin-text mb-2 font-bold">Legal</h4>
                        <a href="#" className="text-linkedin-text-muted hover:text-linkedin-primary transition">Privacy Policy</a>
                        <a href="#" className="text-linkedin-text-muted hover:text-linkedin-primary transition">Terms of Service</a>
                    </div>
                </div>
            </div>

            {/* Signature Mark */}
            <div className="mt-32 relative flex justify-center h-32 overflow-hidden pointer-events-none select-none">
                <h1 className="text-[18vw] font-black text-linkedin-text opacity-[0.03] tracking-tighter leading-none absolute top-0 transform translate-y-8">
                    LEADFLOW
                </h1>
            </div>
        </footer>
    );
};

export default function LandingPageV2() {
    return (
        <div className="bg-linkedin-bg text-linkedin-text min-h-screen font-sans selection:bg-linkedin-primary/30 selection:text-linkedin-text overflow-hidden">
            <Navbar />
            <main>
                <Hero />
                <Features />
                <Philosophy />
                <Protocol />
                <CTAMembership />
            </main>
            <Footer />
        </div>
    );
}
