import { Bot, Link2, Activity, CalendarCheck } from 'lucide-react'
import './FeaturesSection.css'

function FeaturesSection() {
    return (
        <section id="features" className="features-section" aria-labelledby="features-heading">
            <div className="container">
                <header className="section-header">
                    <h2 id="features-heading">Qualified appointments, on autopilot</h2>
                    <p>AI agents handle outreach, replies, and follow-up. You focus on closing.</p>
                </header>

                <div className="bento-grid">
                    {/* Card 1 — Large */}
                    <div className="bento-card bento-large">
                        <div className="bento-icon">
                            <Bot size={24} strokeWidth={1.75} />
                        </div>
                        <h3>Automatic AI reply handling</h3>
                        <p>Our AI agent reads replies, tags intent, answers questions, and routes hot prospects to booking.</p>
                        <div className="bento-visual chat-visual">
                            <div className="chat-bubble incoming">
                                <span className="chat-name">Sarah Chen</span>
                                <span>Hey, sounds interesting! What's the pricing?</span>
                            </div>
                            <div className="chat-bubble outgoing">
                                <span className="chat-name">AI Agent</span>
                                <span>Great question! We offer performance-based pricing. Let me book a quick call...</span>
                            </div>
                            <div className="chat-bubble incoming">
                                <span className="chat-name">Sarah Chen</span>
                                <span>Sure, send me a link! 🗓️</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 2 */}
                    <div className="bento-card">
                        <div className="bento-icon">
                            <Link2 size={24} strokeWidth={1.75} />
                        </div>
                        <h3>Connects to your favorite tools</h3>
                        <p>Seamless handoffs across CRM, email, LinkedIn, and Slack so nothing gets lost.</p>
                        <div className="bento-visual integrations-visual">
                            <div className="integration-dot" style={{ '--delay': '0s' } as React.CSSProperties}>CRM</div>
                            <div className="integration-dot" style={{ '--delay': '0.1s' } as React.CSSProperties}>Email</div>
                            <div className="integration-dot" style={{ '--delay': '0.2s' } as React.CSSProperties}>LinkedIn</div>
                            <div className="integration-dot" style={{ '--delay': '0.3s' } as React.CSSProperties}>Slack</div>
                        </div>
                    </div>

                    {/* Card 3 */}
                    <div className="bento-card">
                        <div className="bento-icon">
                            <Activity size={24} strokeWidth={1.75} />
                        </div>
                        <h3>Performance monitoring, nonstop</h3>
                        <p>We monitor fit + intent trends and tighten the system until your calendar stays clean.</p>
                        <div className="bento-visual chart-visual">
                            <div className="mini-bar" style={{ height: '40%' }}></div>
                            <div className="mini-bar" style={{ height: '55%' }}></div>
                            <div className="mini-bar" style={{ height: '45%' }}></div>
                            <div className="mini-bar" style={{ height: '70%' }}></div>
                            <div className="mini-bar" style={{ height: '85%' }}></div>
                            <div className="mini-bar accent" style={{ height: '95%' }}></div>
                        </div>
                    </div>

                    {/* Card 4 — Large */}
                    <div className="bento-card bento-large">
                        <div className="bento-icon">
                            <CalendarCheck size={24} strokeWidth={1.75} />
                        </div>
                        <h3>Meetings booked, automatically</h3>
                        <p>The system handles outreach + follow-up until qualified prospects land on your calendar.</p>
                        <div className="bento-visual calendar-visual">
                            <div className="cal-week">
                                <div className="cal-day">Mon</div>
                                <div className="cal-day">Tue</div>
                                <div className="cal-day">Wed</div>
                                <div className="cal-day">Thu</div>
                                <div className="cal-day">Fri</div>
                            </div>
                            <div className="cal-slots">
                                <div className="cal-slot booked" style={{ gridColumn: 1 }}>9:00 - Call</div>
                                <div className="cal-slot booked" style={{ gridColumn: 2 }}>10:00 - Demo</div>
                                <div className="cal-slot booked" style={{ gridColumn: 3 }}>11:00 - Call</div>
                                <div className="cal-slot booked" style={{ gridColumn: 4 }}>2:00 - Demo</div>
                                <div className="cal-slot booked" style={{ gridColumn: 5 }}>9:30 - Call</div>
                                <div className="cal-slot" style={{ gridColumn: 1 }}>2:00 PM</div>
                                <div className="cal-slot booked" style={{ gridColumn: 3 }}>3:00 - Demo</div>
                                <div className="cal-slot booked" style={{ gridColumn: 5 }}>1:00 - Call</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default FeaturesSection
