import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../App';
import { Package, Truck, Sparkles, ShieldCheck, MapPin, Phone, CreditCard, ChevronRight, Check } from 'lucide-react';
import SEO from '../components/SEO';

const StickerShop = () => {
    const { user } = useContext(AuthContext);
    const [step, setStep] = useState(1); // 1: Selection, 2: Address, 3: Payment
    const [selectedType, setSelectedType] = useState('reflective');
    const [isProcessing, setIsProcessing] = useState(false);
    
    const [address, setAddress] = useState({
        street: '',
        city: '',
        state: '',
        pincode: ''
    });
    
    const [phone, setPhone] = useState(user?.phone || '');
    
    const STICKER_PRICE = 149;

    const stickerOptions = [
        { id: 'reflective', name: 'Reflective Pro', desc: 'High-visibility safety material', icon: <Sparkles className="text-teal-400" />, color: 'linear-gradient(135deg, #0d9488, #2dd4bf)' },
        { id: 'holographic', name: 'Holographic VIP', desc: 'Iridescent premium finish', icon: <div className="p-1 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 rounded-full"><Sparkles className="text-white" size={16} /></div>, color: 'linear-gradient(135deg, #8b5cf6, #ec4899)' },
        { id: 'glow', name: 'Eclipse Glow', desc: 'Glow-in-the-dark visibility', icon: <div className="text-lime-400 shadow-[0_0_10px_rgba(163,230,53,0.5)]"><Sparkles /></div>, color: 'linear-gradient(135deg, #4d7c0f, #a3e635)' }
    ];

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleCheckout = async () => {
        if (!address.street || !address.pincode || !phone) return alert("Please fill all details.");
        
        setIsProcessing(true);
        const res = await loadRazorpay();
        if (!res) return alert("Razorpay SDK failed to load. Are you online?");

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/stickers/order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: STICKER_PRICE })
            });
            const orderData = await response.json();

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SZhRunfEKtZwk4',
                amount: orderData.amount,
                currency: "INR",
                name: "Parkéé City Shop",
                description: `Premium ${selectedType} Sticker`,
                order_id: orderData.id,
                handler: async (response) => {
                    const verifyRes = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/stickers/finalize`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            ...response,
                            orderData: {
                                userId: user._id,
                                userName: user.name,
                                stickerType: selectedType,
                                amount: STICKER_PRICE,
                                deliveryAddress: address,
                                phone: phone
                            }
                        })
                    });
                    const final = await verifyRes.json();
                    if (final.success) {
                        setStep(4); // Success Step
                    }
                },
                theme: { color: "#0d9488" }
            };
            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            console.error(err);
            alert("Payment failed. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 bg-[#020617]">
            <SEO title="Smart Sticker Store | Parkéé City" description="Order physical premium holographic and reflective stickers for your vehicle." />
            
            <div className="max-w-4xl mx-auto">
                {/* Progress Bar */}
                {step < 4 && (
                <div className="flex items-center justify-between mb-12 max-w-md mx-auto relative">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-white/5 -translate-y-1/2 -z-10"></div>
                    <div className="absolute top-1/2 left-0 h-1 bg-teal-500 -translate-y-1/2 -z-10 transition-all duration-500" style={{ width: `${(step - 1) * 50}%` }}></div>
                    
                    {[1, 2, 3].map((s) => (
                        <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${step >= s ? 'bg-teal-500 text-white scale-110' : 'bg-slate-800 text-slate-500'}`}>
                            {step > s ? <Check size={20} /> : s}
                        </div>
                    ))}
                </div>
                )}

                {step === 1 && (
                    <div className="fadeIn">
                        <div className="text-center mb-12">
                            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-white">Choose Your <span className="shimmer-text">Premium Look</span></h1>
                            <p className="text-slate-400 text-lg">Turn your digital ID into a high-grade physical decal.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6 mb-12">
                            {stickerOptions.map((opt) => (
                                <div 
                                    key={opt.id}
                                    onClick={() => setSelectedType(opt.id)}
                                    className={`relative p-8 rounded-3xl cursor-pointer transition-all duration-300 border-2 ${selectedType === opt.id ? 'border-teal-500 bg-teal-500/10 scale-105' : 'border-white/5 bg-white/5 hover:border-white/20'}`}
                                >
                                    <div className="mb-6">{opt.icon}</div>
                                    <h3 className="text-xl font-bold mb-2 text-white">{opt.name}</h3>
                                    <p className="text-sm text-slate-400 mb-6">{opt.desc}</p>
                                    <div className="text-2xl font-black text-teal-400">₹{STICKER_PRICE}</div>
                                    
                                    {selectedType === opt.id && (
                                        <div className="absolute top-4 right-4 text-teal-500 bg-teal-500/20 p-1 rounded-full"><Check size={16} /></div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="text-center">
                            <button onClick={() => setStep(2)} className="btn-gradient px-12 py-4 rounded-2xl text-lg flex items-center gap-2 mx-auto">
                                Delivery Details <ChevronRight />
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="glass-card max-w-xl mx-auto fadeIn">
                        <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                            <MapPin className="text-teal-500" /> Delivery Address
                        </h2>
                        
                        <div className="space-y-6">
                            <div className="form-group">
                                <label>House / Street Address</label>
                                <input 
                                    type="text" 
                                    placeholder="Apartment, Street Name"
                                    value={address.street}
                                    onChange={(e) => setAddress({...address, street: e.target.value})}
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label>City</label>
                                    <input 
                                        type="text" 
                                        placeholder="Gurugram"
                                        value={address.city}
                                        onChange={(e) => setAddress({...address, city: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Pin Code</label>
                                    <input 
                                        type="text" 
                                        placeholder="122001"
                                        value={address.pincode}
                                        onChange={(e) => setAddress({...address, pincode: e.target.value})}
                                    />
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input 
                                    type="text" 
                                    placeholder="+91 00000 00000"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button onClick={() => setStep(1)} className="btn-secondary py-4 px-6 rounded-2xl">Back</button>
                                <button onClick={() => setStep(3)} className="btn-gradient py-4 flex-1 rounded-2xl">Continue to Checkout</button>
                            </div>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="max-w-md mx-auto glass-card text-center fadeIn">
                        <div className="w-20 h-20 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CreditCard size={40} className="text-teal-500" />
                        </div>
                        <h2 className="text-3xl font-bold mb-2">Order Summary</h2>
                        <p className="text-slate-400 mb-8">One last check before we finalize.</p>
                        
                        <div className="bg-white/5 rounded-2xl p-6 text-left mb-8">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-slate-400">Sticker Style</span>
                                <span className="font-bold text-white capitalize">{selectedType}</span>
                            </div>
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-slate-400">Price</span>
                                <span className="font-bold text-teal-400">₹{STICKER_PRICE}</span>
                            </div>
                            <div className="h-px bg-white/10 my-4"></div>
                            <div className="flex justify-between items-center text-xl">
                                <span className="font-bold">Total Payable</span>
                                <span className="font-black text-teal-400">₹{STICKER_PRICE}</span>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button onClick={() => setStep(2)} className="btn-secondary py-4 px-6 rounded-2xl">Edit Address</button>
                            <button 
                                onClick={handleCheckout} 
                                disabled={isProcessing}
                                className="btn-gradient py-4 flex-1 rounded-2xl text-lg flex items-center justify-center gap-2"
                            >
                                {isProcessing ? "Processing..." : <>Pay Securely <CreditCard size={18} /></>}
                            </button>
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="max-w-md mx-auto text-center py-20 fadeIn">
                        <div className="w-24 h-24 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-10 shadow-[0_0_50px_rgba(20,184,166,0.3)] pulse-anim">
                            <Check size={48} className="text-white" />
                        </div>
                        <h1 className="text-4xl font-extrabold mb-4 text-white">Order Placed!</h1>
                        <p className="text-slate-400 text-lg mb-10">Your custom {selectedType} sticker is being crafted. We'll notify you once it's shipped.</p>
                        
                        <a href="/" className="btn-gradient px-12 py-4 rounded-2xl inline-block">Return to Dashboard</a>
                    </div>
                )}
            </div>

            {/* Features Info */}
            {step < 4 && (
            <div className="max-w-4xl mx-auto mt-20 grid md:grid-cols-3 gap-8 border-t border-white/5 pt-12">
                <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center self-start"><Truck className="text-teal-500" /></div>
                    <div>
                        <h4 className="font-bold mb-1">Fast Delivery</h4>
                        <p className="text-sm text-slate-500">Ships within 48 hours to any part of India.</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center self-start"><ShieldCheck className="text-teal-500" /></div>
                    <div>
                        <h4 className="font-bold mb-1">Durable Quality</h4>
                        <p className="text-sm text-slate-500">Weatherproof, UV-resistant premium vinyl.</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center self-start"><Package className="text-teal-500" /></div>
                    <div>
                        <h4 className="font-bold mb-1">Safe Packaging</h4>
                        <p className="text-sm text-slate-500">Anti-scratch protection during transit.</p>
                    </div>
                </div>
            </div>
            )}
        </div>
    );
};

export default StickerShop;
