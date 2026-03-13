import { useState } from 'react';
import './PlanWizard.css';

const PlanWizard = () => {
    const [step, setStep] = useState(1);
    const [planType, setPlanType] = useState('One-on-One');

    const nextStep = () => setStep(s => Math.min(s + 1, 4));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    return (
        <div className="plan-wizard animate-fade-in">
            <div className="page-header">
                <h1 className="h1">Create New Plan</h1>
                <p className="text-muted">Configure student sessions and payment cycles.</p>
            </div>

            <div className="wizard-container glass-panel">
                <div className="wizard-progress">
                    {[1, 2, 3, 4].map(num => (
                        <div key={num} className={`progress-step ${step >= num ? 'active' : ''}`}>
                            <div className="step-number">{num}</div>
                            <span className="step-label">
                                {num === 1 ? 'Type & Subject' : num === 2 ? 'Schedule' : num === 3 ? 'Tutor' : 'Financials'}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="wizard-content">
                    {step === 1 && (
                        <div className="step-pane animate-fade-in">
                            <h2 className="h3">Select Plan Type</h2>
                            <div className="plan-type-cards">
                                {['One-on-One', 'Twin', 'Batch', 'Revision'].map(type => (
                                    <div
                                        key={type}
                                        className={`type-card ${planType === type ? 'selected' : ''}`}
                                        onClick={() => setPlanType(type)}
                                    >
                                        <h3 className="font-semibold">{type}</h3>
                                    </div>
                                ))}
                            </div>

                            <div className="form-group mt-4">
                                <label className="form-label">Subject</label>
                                <input type="text" className="form-input" placeholder="e.g. Grade 10 Mathematics" />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="step-pane animate-fade-in">
                            <h2 className="h3">Schedule Configuration</h2>
                            <div className="form-group">
                                <label className="form-label">Sessions Per Week</label>
                                <input type="number" className="form-input" defaultValue={2} min={1} max={7} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Session Duration</label>
                                <select className="form-select">
                                    <option value="1">1 Hour</option>
                                    <option value="1.5">1.5 Hours</option>
                                    <option value="2">2 Hours</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="step-pane animate-fade-in">
                            <h2 className="h3">Assign Tutor</h2>
                            <div className="form-group">
                                <label className="form-label">Search Tutors</label>
                                <input type="text" className="form-input" placeholder="Search by name or subject" />
                            </div>
                            <div className="tutor-list-mock">
                                {/* Mock tutors */}
                                <div className="tutor-mock-item selected">
                                    <div className="avatar-small">E</div>
                                    <div>
                                        <div className="font-semibold">Dr. Emily Chen</div>
                                        <div className="text-muted text-sm">Physics, Maths • Available</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="step-pane animate-fade-in">
                            <h2 className="h3">Financial Configuration</h2>
                            <p className="text-muted mb-4">4-Week Cycle Summary</p>

                            <div className="finance-grid">
                                <div className="form-group">
                                    <label className="form-label">Fee Per Session ($)</label>
                                    <input type="number" className="form-input" defaultValue={45} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Admission Fee ($)</label>
                                    <input type="number" className="form-input" defaultValue={100} />
                                </div>
                            </div>

                            <div className="finance-summary mt-4 p-4 border rounded">
                                <div className="flex justify-between mb-2">
                                    <span>Total Sessions (4 weeks):</span>
                                    <span className="font-semibold">8</span>
                                </div>
                                <div className="flex justify-between text-lg mt-2 pt-2 border-top">
                                    <span>Total Payable:</span>
                                    <span className="font-bold text-primary">
                                        <span style={{ color: 'var(--primary-color)' }}>$460</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="wizard-footer flex justify-between mt-4">
                    <button className="btn btn-secondary" onClick={prevStep} disabled={step === 1}>Back</button>

                    {step < 4 ? (
                        <button className="btn btn-primary" onClick={nextStep}>Continue</button>
                    ) : (
                        <button className="btn btn-primary bg-success" style={{ backgroundColor: 'var(--success-color)' }}>
                            Confirm & Generate Plan
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PlanWizard;
