import React, { useRef } from "react";
import { Dialog, DialogContent } from "./ui/dialog";
import { Mail, Phone, MapPin, MessageCircle, Facebook, Twitter, Globe, Download } from "lucide-react";
import html2canvas from "html2canvas";
import { Button } from "./ui/button";

// Define the SalesRep interface
interface SalesRep {
    id: string;
    name: string;
    title: string | null;
    email: string | null;
    phone: string | null;
    countries: string[] | null;
    avatar_url: string | null;
    social_links: {
        whatsapp?: string;
        wechat?: string;
        facebook?: string;
        twitter?: string;
        website?: string;
    } | null;
}

// ===================================================================================
// 1. HIDDEN PRINTABLE CARD (with updated, tighter spacing)
// ===================================================================================
const PrintableCard = React.forwardRef<HTMLDivElement, { rep: SalesRep }>(({ rep }, ref) => (
    <div
        ref={ref}
        style={{
            width: '320px',
            padding: '24px', // Reduced from 32px
            fontFamily: 'sans-serif',
            background: 'linear-gradient(to bottom right, #111827, #1f293b)',
            border: '1px solid #374151',
            borderRadius: '12px',
            color: '#ffffff',
        }}
    >
        {/* Header Section */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '16px' }}> {/* Reduced margin */}
            <div style={{
                height: '112px', width: '112px', borderRadius: '50%', border: '4px solid #f59e0b',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', backgroundColor: '#78350f'
            }}>
                {rep.avatar_url ? (
                    <img src={rep.avatar_url} alt={rep.name} style={{ height: '100%', width: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                    <span style={{ fontSize: '3rem', fontWeight: 'bold', color: '#fde68a' }}>{rep.name.charAt(0)}</span>
                )}
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0' }}>{rep.name}</h3>
            <p style={{ color: '#fcd34d', margin: '4px 0 0 0' }}>{rep.title || 'Sales Representative'}</p>
            {Array.isArray(rep.countries) && rep.countries.length > 0 && (
                <div style={{ marginTop: '8px', color: '#9ca3af' }}>
                    <MapPin size={14} style={{ display: 'inline-block', verticalAlign: 'middle' }} />
                    <span style={{ verticalAlign: 'middle', marginLeft: '4px' }}>{rep.countries.join(', ')}</span>
                </div>
            )}
        </div>
        {/* Contact Info Section */}
        <div style={{ margin: '16px 0', padding: '16px 0', borderTop: '1px solid #374151', borderBottom: '1px solid #374151', textAlign: 'center' }}> {/* Reduced margin & padding */}
             {rep.email && <p style={{ margin: '0 0 8px 0', color: '#7dd3fc' }}>{rep.email}</p>}
             {rep.phone && <p style={{ margin: '0', color: '#86efac' }}>{rep.phone}</p>}
        </div>
        {/* QR Code Section */}
        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}> {/* Reduced margin */}
            <div style={{ height: '120px', width: '120px', backgroundColor: '#374151', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', textAlign: 'center' }}>QR Code Placeholder</p>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '12px' }}>Scan to save contact</p> {/* Reduced margin */}
        </div>
    </div>
));


// ===================================================================================
// 2. MAIN DIALOG COMPONENT (with updated, tighter spacing)
// ===================================================================================
interface SalesRepNameCardPopupProps {
    rep: SalesRep;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const SalesRepNameCardPopup: React.FC<SalesRepNameCardPopupProps> = ({ rep, open, onOpenChange }) => {
    const printableCardRef = useRef<HTMLDivElement>(null);

    const handleSaveAsImage = async () => {
        const elementToCapture = printableCardRef.current;
        if (!elementToCapture) {
            console.error("Printable card element not found!");
            return;
        }
        try {
            const canvas = await html2canvas(elementToCapture, { scale: 2, useCORS: true, backgroundColor: null });
            const image = canvas.toDataURL("image/png", 1.0);
            const link = document.createElement("a");
            link.href = image;
            link.download = `${rep.name}_contact_card.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Error generating image:", error);
        }
    };

    return (
        <>
            {/* HIDDEN COMPONENT FOR SCREENSHOT */}
            <div style={{ position: 'fixed', top: '-9999px', left: '-9999px', zIndex: -1 }}>
                <PrintableCard rep={rep} ref={printableCardRef} />
            </div>

            {/* LIVE DIALOG */}
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="m-4 sm:max-w-xs p-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-lg border border-gray-700"> {/* Reduced padding */}
                    <div className="flex flex-col items-center text-center mb-4"> {/* Reduced margin */}
                         <div className="h-28 w-28 rounded-full border-4 border-amber-500 flex items-center justify-center mb-4 bg-amber-700">
                             {rep.avatar_url ? (
                                <img src={rep.avatar_url} alt={rep.name} className="h-full w-full rounded-full object-cover" />
                            ) : (
                                <span className="text-3xl font-bold text-amber-100">{rep.name.charAt(0)}</span>
                            )}
                        </div>
                        <h3 className="text-2xl font-bold text-white">{rep.name}</h3>
                        <p className="text-md text-amber-400 font-medium">{rep.title || 'Sales Representative'}</p>
                        {Array.isArray(rep.countries) && rep.countries.length > 0 && (
                            <div className="w-full text-sm text-gray-400 mt-2 text-center">
                                <MapPin size={14} className="inline-block align-middle text-gray-400" />
                                {' '}
                                <span className="align-middle">{rep.countries.join(', ')}</span>
                            </div>
                        )}
                    </div>
                     <div className="w-full text-center my-4 border-y border-gray-700 py-4"> {/* Reduced margin & padding */}
                        {rep.email && <a href={`mailto:${rep.email}`} className="flex items-center justify-center gap-3 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"><Mail size={16} />{rep.email}</a>}
                        {rep.phone && <a href={`tel:${rep.phone}`} className="mt-2 flex items-center justify-center gap-3 text-sm font-medium text-green-400 hover:text-green-300 transition-colors"><Phone size={16} />{rep.phone}</a>}
                    </div>
                    <div className="mt-4 flex flex-col items-center"> {/* Reduced margin */}
                        <div className="bg-gray-700 p-3 rounded-lg flex items-center justify-center" style={{ width: '120px', height: '120px' }}>
                            <p className="text-xs text-gray-400 text-center">QR Code Placeholder</p>
                        </div>
                        <p className="text-xs text-center text-gray-500 mt-3">Scan to save contact</p> {/* Reduced margin */}
                    </div>
                    <div className="mt-6 flex justify-center"> {/* Reduced margin */}
                        <Button onClick={handleSaveAsImage} className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                            <Download size={18} /> Save as Image
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default SalesRepNameCardPopup;
