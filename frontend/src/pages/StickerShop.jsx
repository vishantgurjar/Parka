import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../App';
import { Package, Truck, Sparkles, ShieldCheck, MapPin, CreditCard, ChevronRight, Check, ArrowLeft, Star } from 'lucide-react';
import SEO from '../components/SEO';

const StickerShop = () => {
    const { user } = useContext(AuthContext);
    const [step, setStep] = useState(1); 
    const [selectedType, setSelectedType] = useState('holographic');
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
        { 
            id: 'reflective', 
            name: 'Reflective Pro', 
            badge: 'HIGH VISIBILITY',
            desc: 'Ultra-bright reflective finish for maximum safety in low light.', 
            icon: <Sparkles className="text-slate-400" />, 
            theme: 'minimal-card-vip-gold' 
        },
        { 
            id: 'holographic', 
            name: 'Holographic VIP', 
            badge: 'BEST SELLER',
            desc: 'Stunning rainbow-shifting iridescent finish. Looks incredibly premium.', 
            icon: <Star className="text-purple-500" />, 
            theme: 'minimal-card-vip-diamond' 
        },
        { 
            id: 'glow', 
            name: 'Eclipse Glow', 
            badge: 'NIGHT SPECIAL',
            desc: 'Phosphorescent self-glowing material that charges under sunlight.', 
            icon: <div className="w-2 h-2 rounded-full bg-lime-400 shadow-[0_0_8px_#a3e635]" />, 
            theme: 'minimal-card-vip' 
        }
    ];

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) return resolve(true);
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleCheckout = async () => {
        if (!user) return alert("Please log in to place an order.");
        if (!address.street || !address.pincode || !phone) return alert("Please fill all delivery details.");
        
        setIsProcessing(true);
        const res = await loadRazorpay();
        if (!res) return alert("payment systems are currently unavailable. Please refresh.");

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
                description: `Premium ${selectedType} Smart Sticker`,
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
                        setStep(4);
                    }
                },
                theme: { color: "#111827" }
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
        <div className="min-h-screen bg-slate-50 pt-28 pb-16 px-4">
            <SEO title="Smart Sticker Store | Premium Vehicle Protection" description="Order physical premium holographic and reflective stickers for your vehicle." />
            
            <div className="max-w-5xl mx-auto">
                {/* Header & Stepper */}
                {step < 4 && (
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-100 mb-6 font-bold text-xs text-slate-500 tracking-widest uppercase">
                            Premium Merchandise
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
                            Smart <span className="text-teal-600">ID Decals</span>
                        </h1>
                        
                        <div className="flex items-center justify-center gap-4 mt-8">
                            {[1, 2, 3].map((s) => (
                                <React.Fragment key={s}>
                                    <div className={`flex items-center gap-2 group`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                            {step > s ? <Check size={14} /> : s}
                                        </div>
                                        <span className={`hidden md:block text-xs font-bold uppercase tracking-widest ${step >= s ? 'text-slate-900' : 'text-slate-400'}`}>
                                            {s === 1 ? 'Design' : s === 2 ? 'Address' : 'Payment'}
                                        </span>
                                    </div>
                                    {s < 3 && <div className={`w-8 h-px ${step > s ? 'bg-slate-900' : 'bg-slate-200'}`} />}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                )}

                {step === 1 && (
                    <div className="fadeInUp">
                        <div className="grid lg:grid-cols-3 gap-8 mb-16">
                            {stickerOptions.map((opt) => (
                                <div 
                                    key={opt.id}
                                    onClick={() => setSelectedType(opt.id)}
                                    className={`minimal-card flex flex-col cursor-pointer hover:-translate-y-2 transition-transform duration-500 ${opt.theme} ${selectedType === opt.id ? 'ring-2 ring-slate-900' : ''}`}
                                    style={{ background: '#fff' }}
                                >
                                    {/* Preview Area */}
                                    <div className="p-8 pb-0 relative aspect-[1.6/1] bg-slate-50 overflow-hidden">
                                        <div className="shimmer-shimmer opacity-40"></div>
                                        <div className="absolute top-4 left-4 inline-block bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black text-slate-900 border border-slate-200 shadow-sm z-10">
                                            {opt.badge}
                                        </div>
                                        
                                        {/* Mock Sticker Design */}
                                        <div className={`w-[85%] mx-auto mt-4 aspect-[1.6/1] minimal-card shadow-2xl relative flex flex-col justify-between overflow-hidden ${opt.id === 'holographic' ? 'bg-white' : ''}`}>
                                            <div className="minimal-sos-bar">EMERGENCY ACCESS</div>
                                            <div className="flex-1 flex items-center justify-center p-4">
                                                <div className="w-16 h-16 bg-white border-2 border-slate-100 rounded-lg flex items-center justify-center">
                                                  <div className="w-12 h-12 bg-teal-500/10 rounded-sm flex items-center justify-center text-teal-600 font-bold">QR</div>
                                                </div>
                                            </div>
                                            <div className="px-4 pb-4">
                                              <div className="minimal-label">VEHICLE PLATE</div>
                                              <div className="minimal-value" style={{fontSize: '0.8rem'}}>HR 51 X 0001</div>
                                            </div>
                                            <div className="shimmer-shimmer opacity-30"></div>
                                        </div>
                                    </div>

                                    {/* Info Area */}
                                    <div className="p-8">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-xl font-black text-slate-900 leading-tight">{opt.name}</h3>
                                                <p className="text-xs text-slate-400 mt-1 font-medium">{opt.desc}</p>
                                            </div>
                                            <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${selectedType === opt.id ? 'bg-slate-900 border-slate-900 text-white' : 'border-slate-200 text-slate-200'}`}>
                                                <Check size={16} />
                                            </div>
                                        </div>
                                        <div className="h-px bg-slate-100 w-full mb-6"></div>
                                        <div className="flex justify-between items-center">
                                            <div className="text-2xl font-black text-slate-900">₹{STICKER_PRICE}</div>
                                            <div className="text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">ONE-TIME FEE</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="text-center">
                            <button onClick={() => setStep(2)} className="bg-slate-900 text-white px-12 py-5 rounded-2xl font-bold text-lg hover:shadow-2xl transition-all hover:scale-[1.02] flex items-center gap-3 mx-auto">
                                Continue to Logistics <ChevronRight size={20} />
                            </button>
                            <p className="text-slate-400 text-sm mt-6 font-medium">No hidden charges. Free shipping across India.</p>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="max-w-2xl mx-auto fadeInUp">
                        <button onClick={() => setStep(1)} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 mb-8 font-bold text-sm transition-colors uppercase tracking-widest">
                            <ArrowLeft size={16} /> Back to selection
                        </button>
                        
                        <div className="minimal-card p-10 bg-white">
                            <h2 className="text-3xl font-black mb-10 text-slate-900 tracking-tight">Delivery <span className="text-teal-600">Details</span></h2>
                            
                            <div className="grid gap-8">
                                <div className="space-y-2">
                                    <label className="minimal-label">Complete Address</label>
                                    <input 
                                        type="text" 
                                        placeholder="Flat No, Apartment, Street Name"
                                        className="w-full p-4 border border-slate-100 bg-slate-50 rounded-xl focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all outline-none font-medium"
                                        value={address.street}
                                        onChange={(e) => setAddress({...address, street: e.target.value})}
                                    />
                                </div>
                                
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="minimal-label">City</label>
                                        <input 
                                            type="text" 
                                            placeholder="Gurugram"
                                            className="w-full p-4 border border-slate-100 bg-slate-50 rounded-xl focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all outline-none font-medium"
                                            value={address.city}
                                            onChange={(e) => setAddress({...address, city: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="minimal-label">Pin Code</label>
                                        <input 
                                            type="text" 
                                            placeholder="122001"
                                            className="w-full p-4 border border-slate-100 bg-slate-50 rounded-xl focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all outline-none font-medium"
                                            value={address.pincode}
                                            onChange={(e) => setAddress({...address, pincode: e.target.value})}
                                        />
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="minimal-label">Mobile Number</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">+91</div>
                                        <input 
                                            type="text" 
                                            placeholder="00000 00000"
                                            className="w-full p-4 pl-14 border border-slate-100 bg-slate-50 rounded-xl focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all outline-none font-medium"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <button onClick={() => setStep(3)} className="bg-slate-900 text-white py-5 rounded-2xl font-black text-lg hover:shadow-2xl transition-all hover:scale-[1.02] mt-4 shadow-xl">
                                    Continue to Secure Payment
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="max-w-md mx-auto fadeInUp">
                        <button onClick={() => setStep(2)} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 mb-8 font-bold text-sm transition-colors uppercase tracking-widest">
                            <ArrowLeft size={16} /> Edit Address
                        </button>
                        
                        <div className="minimal-card bg-white p-10 overflow-hidden relative">
                            <div className="absolute top-0 left-0 w-full h-2 bg-slate-900"></div>
                            <h2 className="text-3xl font-black mb-2 text-slate-900 tracking-tight">Summary</h2>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-10">Review your collection choice</p>
                            
                            <div className="space-y-6 mb-10">
                                <div className="flex justify-between items-center bg-slate-50 p-6 rounded-2xl">
                                    <div>
                                        <div className="text-[10px] font-black text-slate-400 uppercase mb-1">SELECTED DECAL</div>
                                        <div className="text-lg font-black text-slate-900 capitalize italic">{selectedType} Edition</div>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
                                      <Package className="text-slate-900" size={20} />
                                    </div>
                                </div>
                                
                                <div className="px-2 space-y-4">
                                    <div className="flex justify-between text-sm font-bold">
                                        <span className="text-slate-400 uppercase tracking-widest">Sticker Price</span>
                                        <span className="text-slate-900">₹{STICKER_PRICE}</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-bold">
                                        <span className="text-slate-400 uppercase tracking-widest">Convenience Fee</span>
                                        <span className="text-teal-600 uppercase">FREE</span>
                                    </div>
                                    <div className="h-px bg-slate-100 w-full my-2"></div>
                                    <div className="flex justify-between text-xl font-black">
                                        <span className="text-slate-900 uppercase tracking-tighter">Total Due</span>
                                        <span className="text-slate-900">₹{STICKER_PRICE}</span>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={handleCheckout} 
                                disabled={isProcessing}
                                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg hover:shadow-2xl transition-all hover:scale-[1.02] flex items-center justify-center gap-3 shadow-xl"
                            >
                                {isProcessing ? "INITIALIZING SECURE GATEWAY..." : <>Confirm & Pay Now <CreditCard size={20} /></>}
                            </button>
                            
                            <div className="flex items-center justify-center gap-4 mt-8 opacity-40">
                              <img src="https://img.icons8.com/color/48/000000/upi.png" alt="UPI" className="h-4 grayscale hover:grayscale-0 transition-all cursor-pointer" />
                              <img src="https://img.icons8.com/color/48/000000/visa.png" alt="Visa" className="h-4 grayscale hover:grayscale-0 transition-all cursor-pointer" />
                              <img src="https://img.icons8.com/color/48/000000/mastercard.png" alt="Mastercard" className="h-4 grayscale hover:grayscale-0 transition-all cursor-pointer" />
                            </div>
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="max-w-xl mx-auto text-center py-20 fadeInUp">
                        <div className="w-24 h-24 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-10 shadow-2xl relative">
                            <Check size={48} className="text-white" />
                            <div className="absolute inset-0 rounded-full bg-teal-500 animate-ping opacity-20"></div>
                        </div>
                        <h1 className="text-5xl font-black text-slate-900 mb-6 tracking-tight">Order Confirmed!</h1>
                        <p className="text-xl text-slate-500 mb-12 font-medium leading-relaxed">Your premium <span className="text-slate-900 font-bold capitalize">{selectedType}</span> ID sticker is being crafted for your vehicle. Expect delivery within 3-5 working days.</p>
                        
                        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                          <a href="/" className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-black text-lg shadow-xl hover:-translate-y-1 transition-all">Go to Dashboard</a>
                          <button className="text-slate-400 font-bold text-sm tracking-widest uppercase hover:text-slate-900 transition-colors">Track Order Details</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Footnote */}
            {step < 4 && (
                <div className="max-w-5xl mx-auto mt-24 border-t border-slate-200 pt-16 grid md:grid-cols-3 gap-12 text-slate-900">
                    <div className="flex gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center shrink-0"><Truck className="text-slate-400" /></div>
                        <div>
                            <h4 className="font-extrabold text-sm uppercase tracking-widest mb-2">Priority Shipping</h4>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed">Tracked express delivery to 19,000+ pin codes across India.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center shrink-0"><ShieldCheck className="text-slate-400" /></div>
                        <div>
                            <h4 className="font-extrabold text-sm uppercase tracking-widest mb-2">High Durability</h4>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed">UV-resistant, waterproof premium high-grade adhesive decals.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center shrink-0"><Sparkles className="text-slate-400" /></div>
                        <div>
                            <h4 className="font-extrabold text-sm uppercase tracking-widest mb-2">Smart QR Tech</h4>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed">Works instantly with any smartphone camera for SOS access.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StickerShop;
