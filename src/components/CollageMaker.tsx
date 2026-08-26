'use client';
import { useState, useRef, useCallback, useEffect, ChangeEvent } from 'react';
import { X, ImagePlus, Download, Trash2, Type, RotateCcw, PenTool, Check, Minus, Plus, Crop } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '@/lib/cropImage';

interface CollageMakerProps {
  open: boolean;
  onClose: () => void;
  onSave?: (url: string) => void;
}
interface TextItem { id: string; text: string; x: number; y: number; color: string; fontSize: number; }
interface DrawPath { d: string; color: string; width: number; }

const LAYOUTS = [
  { id: '1_single',     slots: 1, label: 'Single' },
  { id: '2_vertical',   slots: 2, label: '2 Vertical' },
  { id: '2_horizontal', slots: 2, label: '2 Horizontal' },
  { id: '3_grid',       slots: 3, label: '3 Grid' },
  { id: '3_stacked',    slots: 3, label: '3 Stacked' },
  { id: '4_grid',       slots: 4, label: '4 Grid' },
];

const MARKER_COLORS = ['#EF4444','#F97316','#EAB308','#22C55E','#3B82F6','#8B5CF6','#FFFFFF','#000000'];
const TEXT_COLORS   = ['#000000','#EF4444','#3B82F6','#22C55E','#F97316','#8B5CF6','#FFFFFF'];

function scalePathD(d: string, scale: number) {
  return d.replace(/(-?\d+\.?\d*)/g, m => String(parseFloat(m) * scale));
}

function DraggableText({ item, selected, onSelect, onDrag, onDelete, onEdit }: {
  item: TextItem; selected: boolean;
  onSelect: () => void; onDrag: (dx: number, dy: number) => void;
  onDelete: () => void; onEdit: () => void;
}) {
  const last = useRef<{x:number;y:number}|null>(null);
  return (
    <div
      className={`absolute select-none cursor-move ${selected ? 'outline outline-2 outline-dashed outline-[#5B43EE] rounded' : ''}`}
      style={{ left: item.x, top: item.y, zIndex: 20, touchAction: 'none' }}
      onPointerDown={e => { e.stopPropagation(); onSelect(); last.current={x:e.clientX,y:e.clientY}; (e.target as HTMLElement).setPointerCapture(e.pointerId); }}
      onPointerMove={e => { if (!last.current) return; onDrag(e.clientX-last.current.x, e.clientY-last.current.y); last.current={x:e.clientX,y:e.clientY}; }}
      onPointerUp={() => { last.current=null; }}
      onDoubleClick={onEdit}
    >
      <span style={{ color: item.color, fontSize: item.fontSize, fontWeight:'bold', whiteSpace:'nowrap', textShadow:'0 1px 3px rgba(0,0,0,0.5)' }}>
        {item.text}
      </span>
      {selected && (
        <button className="absolute -top-3 -right-3 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center" onPointerDown={e=>e.stopPropagation()} onClick={onDelete}>
          <Trash2 size={11} color="#fff" />
        </button>
      )}
    </div>
  );
}

function SlotView({ i, images, activeSlot, activeTool, onSlotClick, onDeleteSlot }: {
  i: number; images: Record<number,string>; activeSlot: number|null; activeTool: string;
  onSlotClick:(i:number)=>void; onDeleteSlot:(i:number)=>void;
}) {
  const isActive = activeSlot===i && activeTool==='select';
  return (
    <div
      key={i}
      className={`relative flex flex-col flex-1 overflow-hidden rounded-lg cursor-pointer border-2 ${isActive?'border-[#5B43EE]':'border-transparent'} bg-[#D1D5DB]`}
      onClick={() => onSlotClick(i)}
    >
      {images[i] ? (
        <>
          <img src={images[i]} className="w-full h-full object-cover" alt={`Slot ${i+1}`} />
          {isActive && (
            <button className="absolute top-2 right-2 z-20 bg-red-500 rounded-full p-1.5 shadow" onClick={e=>{e.stopPropagation();onDeleteSlot(i);}}>
              <Trash2 size={14} color="#fff" />
            </button>
          )}
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center opacity-50">
          <ImagePlus size={24} className="text-gray-500" />
          <span className="text-xs font-semibold text-gray-500 mt-1">Tap to add</span>
        </div>
      )}
    </div>
  );
}

export function CollageMaker({ open, onClose, onSave }: CollageMakerProps) {
  const { showToast } = useToast();
  const [layout, setLayout]         = useState(LAYOUTS[0]);
  const [images, setImages]         = useState<Record<number,string>>({});
  const [activeSlot, setActiveSlot] = useState<number|null>(null);
  const [activeTool, setActiveTool] = useState<'select'|'marker'|'text'>('select');
  const [paths, setPaths]           = useState<DrawPath[]>([]);
  const [currentPath, setCurrentPath] = useState<DrawPath|null>(null);
  const [markerColor, setMarkerColor] = useState('#EF4444');
  const [markerWidth, setMarkerWidth] = useState(4);
  const [textItems, setTextItems]   = useState<TextItem[]>([]);
  const [selectedTextId, setSelectedTextId] = useState<string|null>(null);
  const [addingText, setAddingText] = useState(false);
  const [draftText, setDraftText]   = useState('');
  const [textColor, setTextColor]   = useState('#FFFFFF');
  const [fontSize, setFontSize]     = useState(20);
  const [pendingPos, setPendingPos] = useState<{x:number;y:number}|null>(null);
  const [editingTextId, setEditingTextId] = useState<string|null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Crop State
  const [isCropping, setIsCropping] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const canvasRef  = useRef<HTMLDivElement>(null);
  const svgRef     = useRef<SVGSVGElement>(null);
  const fileRefs   = useRef<Record<number, HTMLInputElement|null>>({});
  const isDrawing  = useRef(false);
  const markerColorRef = useRef(markerColor);
  markerColorRef.current = markerColor;
  const markerWidthRef = useRef(markerWidth);
  markerWidthRef.current = markerWidth;

  useEffect(() => {
    if (open) {
      setImages({}); setActiveSlot(null); setPaths([]); setCurrentPath(null);
      setTextItems([]); setActiveTool('select'); setSelectedTextId(null);
      setIsCropping(false); setCrop({x:0, y:0}); setZoom(1);
    }
  }, [open]);

  const handleSlotClick = (i: number) => {
    if (activeTool !== 'select') return;
    setActiveSlot(i);
    if (!images[i]) fileRefs.current[i]?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, slotIdx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImages(prev => ({ ...prev, [slotIdx]: URL.createObjectURL(file) }));
    e.target.value = '';
  };

  const handleDeleteSlot = (i: number) => {
    setImages(prev => { const n={...prev}; delete n[i]; return n; });
    setActiveSlot(null);
  };

  const getSvgPoint = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = svgRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleSvgPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (activeTool === 'marker') {
      isDrawing.current = true;
      const {x,y} = getSvgPoint(e);
      setCurrentPath({ d:`M ${x} ${y}`, color:markerColorRef.current, width:markerWidthRef.current });
      (e.target as SVGElement).setPointerCapture(e.pointerId);
    } else if (activeTool === 'text') {
      const rect = svgRef.current!.getBoundingClientRect();
      setPendingPos({ x: e.clientX-rect.left, y: e.clientY-rect.top });
      setEditingTextId(null); setDraftText(''); setAddingText(true);
    }
  };

  const handleSvgPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (activeTool==='marker' && isDrawing.current && currentPath) {
      const {x,y} = getSvgPoint(e);
      setCurrentPath(prev => prev ? {...prev, d:`${prev.d} L ${x} ${y}`} : null);
    }
  };

  const handleSvgPointerUp = () => {
    if (activeTool==='marker' && isDrawing.current && currentPath) {
      isDrawing.current = false;
      setPaths(prev => [...prev, currentPath]);
      setCurrentPath(null);
    }
  };

  const confirmText = () => {
    if (!draftText.trim()) { setAddingText(false); setEditingTextId(null); return; }
    if (editingTextId) {
      setTextItems(prev => prev.map(t => t.id===editingTextId ? {...t,text:draftText.trim(),color:textColor,fontSize} : t));
    } else {
      setTextItems(prev => [...prev, { id:Date.now().toString(), text:draftText.trim(), x:pendingPos?.x??50, y:pendingPos?.y??50, color:textColor, fontSize }]);
    }
    setEditingTextId(null); setAddingText(false); setDraftText('');
  };

  const handleTextDrag = useCallback((id: string, dx: number, dy: number) => {
    setTextItems(prev => prev.map(t => t.id===id ? {...t, x:t.x+dx, y:t.y+dy} : t));
  }, []);

  const handleUndo = () => {
    if (selectedTextId) { setTextItems(p=>p.filter(t=>t.id!==selectedTextId)); setSelectedTextId(null); return; }
    if (paths.length>0) { setPaths(p=>p.slice(0,-1)); return; }
    if (textItems.length>0) { setTextItems(p=>p.slice(0,-1)); }
  };

  const exportCollage = useCallback(async (download=false) => {
    const SIZE=800; const GAP=4;
    const canvas=document.createElement('canvas');
    canvas.width=SIZE; canvas.height=SIZE;
    const ctx=canvas.getContext('2d')!;
    ctx.fillStyle='#E2E8F0'; ctx.fillRect(0,0,SIZE,SIZE);

    const loadImg = (src:string): Promise<HTMLImageElement> => new Promise((res,rej)=>{
      const img=new Image(); img.crossOrigin='anonymous';
      img.onload=()=>res(img);
      img.onerror=()=>{const i2=new Image();i2.onload=()=>res(i2);i2.onerror=rej;i2.src=src;};
      img.src=src;
    });

    type Slot={x:number;y:number;w:number;h:number};
    let slots:Slot[]=[];
    const H=SIZE,W=SIZE;
    if (layout.id==='1_single') slots=[{x:0,y:0,w:W,h:H}];
    else if (layout.id==='2_vertical') { const w=(W-GAP)/2; slots=[{x:0,y:0,w,h:H},{x:w+GAP,y:0,w,h:H}]; }
    else if (layout.id==='2_horizontal') { const h=(H-GAP)/2; slots=[{x:0,y:0,w:W,h},{x:0,y:h+GAP,w:W,h}]; }
    else if (layout.id==='3_grid') { const lw=(W-GAP)/2,rh=(H-GAP)/2; slots=[{x:0,y:0,w:lw,h:H},{x:lw+GAP,y:0,w:lw,h:rh},{x:lw+GAP,y:rh+GAP,w:lw,h:rh}]; }
    else if (layout.id==='3_stacked') { const th=(H-GAP)/2,tw=(W-GAP)/2; slots=[{x:0,y:0,w:tw,h:th},{x:tw+GAP,y:0,w:tw,h:th},{x:0,y:th+GAP,w:W,h:th}]; }
    else { const hw=(W-GAP)/2,hh=(H-GAP)/2; slots=[{x:0,y:0,w:hw,h:hh},{x:hw+GAP,y:0,w:hw,h:hh},{x:0,y:hh+GAP,w:hw,h:hh},{x:hw+GAP,y:hh+GAP,w:hw,h:hh}]; }

    setIsProcessing(true);
    try {
      for (let i=0;i<slots.length;i++) {
        if (!images[i]) continue;
        const img=await loadImg(images[i]);
        const s=slots[i];
        const sR=img.width/img.height,dR=s.w/s.h;
        let sw,sh,sx,sy;
        if (sR>dR) { sh=img.height;sw=img.height*dR;sx=(img.width-sw)/2;sy=0; }
        else { sw=img.width;sh=img.width/dR;sx=0;sy=(img.height-sh)/2; }
        ctx.drawImage(img,sx,sy,sw,sh,s.x,s.y,s.w,s.h);
      }
      const displaySize = canvasRef.current?.offsetWidth ?? SIZE;
      const scale = SIZE / displaySize;
      ctx.lineCap='round'; ctx.lineJoin='round';
      [...paths,...(currentPath?[currentPath]:[])].forEach(p=>{
        ctx.strokeStyle=p.color; ctx.lineWidth=p.width*scale;
        ctx.stroke(new Path2D(scalePathD(p.d,scale)));
      });
      textItems.forEach(t=>{
        ctx.font=`bold ${t.fontSize*scale}px Inter,sans-serif`;
        ctx.fillStyle=t.color;
        ctx.fillText(t.text,t.x*scale,t.y*scale+t.fontSize*scale);
      });
      const dataURL = canvas.toDataURL('image/jpeg', 0.92);
      if (download) {
        const a = document.createElement('a'); a.href = dataURL; a.download = `collage_${Date.now()}.jpg`; a.click();
        showToast('Collage downloaded!', 'success');
      } else {
        await onSave?.(dataURL);
        showToast('Reference photo submitted!', 'success');
        onClose();
      }
    } catch(err) { console.error(err); showToast('Failed to export','error'); }
    finally { setIsProcessing(false); }
  }, [images,layout,paths,currentPath,textItems,onSave,onClose,showToast]);

  if (!open) return null;
  const hasImages = Object.values(images).some(Boolean);

  const renderSlots = () => {
    const slot = (i: number) => (
      <SlotView key={i} i={i} images={images} activeSlot={activeSlot} activeTool={activeTool} onSlotClick={handleSlotClick} onDeleteSlot={handleDeleteSlot} />
    );
    const g='gap-1';
    if (layout.id==='1_single') return <div className="w-full h-full flex flex-col">{slot(0)}</div>;
    if (layout.id==='2_vertical') return <div className={`w-full h-full flex flex-row ${g}`}>{[0,1].map(slot)}</div>;
    if (layout.id==='2_horizontal') return <div className={`w-full h-full flex flex-col ${g}`}>{[0,1].map(slot)}</div>;
    if (layout.id==='3_grid') return <div className={`w-full h-full flex flex-row ${g}`}>{slot(0)}<div className={`flex-1 flex flex-col ${g}`}>{[1,2].map(slot)}</div></div>;
    if (layout.id==='3_stacked') return <div className={`w-full h-full flex flex-col ${g}`}><div className={`flex-1 flex flex-row ${g}`}>{[0,1].map(slot)}</div>{slot(2)}</div>;
    return <div className={`w-full h-full flex flex-col ${g}`}><div className={`flex-1 flex flex-row ${g}`}>{[0,1].map(slot)}</div><div className={`flex-1 flex flex-row ${g}`}>{[2,3].map(slot)}</div></div>;
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col" style={{touchAction:'none'}}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
        <span className="text-[18px] font-bold text-[#0F172A]">Collage &amp; Edit</span>
        <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100"><X size={22} /></button>
      </div>

      {/* Layout Pills */}
      <div className="flex overflow-x-auto gap-2.5 px-4 py-3 border-b border-gray-50 shrink-0 hide-scrollbar">
        {LAYOUTS.map(l => (
          <button key={l.id} onClick={()=>setLayout(l)}
            className={`px-4 py-2 rounded-full text-[13px] font-bold border whitespace-nowrap ${layout.id===l.id?'bg-[#5B43EE] text-white border-[#5B43EE]':'bg-white text-[#64748B] border-[#E2E8F0]'}`}>
            {l.label}
          </button>
        ))}
      </div>

      {/* Canvas */}
      <div className="flex-1 flex items-center justify-center bg-[#F1F5F9] p-3 min-h-0">
        <div ref={canvasRef} className="relative bg-[#E2E8F0] rounded-xl overflow-hidden" style={{width:'100%',maxWidth:500,aspectRatio:'1/1'}}>
          <div className="absolute inset-0 p-0.5">{renderSlots()}</div>

          {/* SVG Draw Layer */}
          <svg ref={svgRef} className="absolute inset-0 w-full h-full"
            style={{ cursor:activeTool==='marker'?'crosshair':activeTool==='text'?'text':'default', pointerEvents:activeTool==='select'?'none':'all', zIndex:10 }}
            onPointerDown={handleSvgPointerDown} onPointerMove={handleSvgPointerMove} onPointerUp={handleSvgPointerUp}>
            {paths.map((p,i) => <path key={i} d={p.d} stroke={p.color} strokeWidth={p.width} fill="none" strokeLinecap="round" strokeLinejoin="round"/>)}
            {currentPath && <path d={currentPath.d} stroke={currentPath.color} strokeWidth={currentPath.width} fill="none" strokeLinecap="round" strokeLinejoin="round"/>}
          </svg>

          {/* Text Items */}
          {textItems.map(item => (
            <DraggableText key={item.id} item={item} selected={selectedTextId===item.id}
              onSelect={()=>setSelectedTextId(item.id)}
              onDrag={(dx,dy)=>handleTextDrag(item.id,dx,dy)}
              onDelete={()=>{setTextItems(p=>p.filter(t=>t.id!==item.id));setSelectedTextId(null);}}
              onEdit={()=>{setDraftText(item.text);setTextColor(item.color);setFontSize(item.fontSize);setEditingTextId(item.id);setAddingText(true);}}
            />
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="shrink-0 border-t border-gray-100 bg-white">
        <div className="flex justify-around py-2">
          {[{id:'select',icon:<ImagePlus size={20}/>,label:'Select'},{id:'marker',icon:<PenTool size={20}/>,label:'Marker'},{id:'text',icon:<Type size={20}/>,label:'Text'}].map(t=>(
            <button key={t.id} onClick={()=>setActiveTool(t.id as 'select'|'marker'|'text')}
              className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl ${activeTool===t.id?'bg-[#EEF2FF] text-[#5B43EE]':'text-[#94A3B8]'}`}>
              {t.icon}<span className="text-[11px] font-semibold">{t.label}</span>
            </button>
          ))}
          <button onClick={() => {
            if (activeSlot !== null && images[activeSlot]) {
              setIsCropping(true);
            } else {
              showToast('Please select a photo slot first to crop', 'info');
            }
          }} className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl text-[#94A3B8] hover:bg-gray-50">
            <Crop size={20}/><span className="text-[11px] font-semibold">Crop</span>
          </button>
          <button onClick={handleUndo} className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl text-[#94A3B8]"><RotateCcw size={20}/><span className="text-[11px] font-semibold">Undo</span></button>
        </div>

        {activeTool==='marker' && (
          <div className="px-4 pb-2 space-y-2">
            <div className="flex gap-2 overflow-x-auto hide-scrollbar">
              {MARKER_COLORS.map(c=>(
                <button key={c} onClick={()=>setMarkerColor(c)}
                  className={`w-7 h-7 rounded-full shrink-0 border-2 ${markerColor===c?'border-[#5B43EE] scale-110':'border-transparent'}`}
                  style={{backgroundColor:c,boxShadow:'0 0 0 1px rgba(0,0,0,0.1)'}}/>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-[#64748B] font-semibold">Width</span>
              <button onClick={()=>setMarkerWidth(w=>Math.max(1,w-1))} className="p-1 rounded bg-gray-100"><Minus size={14}/></button>
              <span className="text-[13px] font-bold w-5 text-center">{markerWidth}</span>
              <button onClick={()=>setMarkerWidth(w=>Math.min(20,w+1))} className="p-1 rounded bg-gray-100"><Plus size={14}/></button>
            </div>
          </div>
        )}

        {activeTool==='text' && (
          <div className="px-4 pb-2 space-y-2">
            <div className="flex gap-2 overflow-x-auto hide-scrollbar">
              {TEXT_COLORS.map(c=>(
                <button key={c} onClick={()=>setTextColor(c)}
                  className={`w-7 h-7 rounded-full shrink-0 border-2 ${textColor===c?'border-[#5B43EE] scale-110':'border-transparent'}`}
                  style={{backgroundColor:c,boxShadow:'0 0 0 1px rgba(0,0,0,0.15)'}}/>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-[#64748B] font-semibold">Size</span>
              <button onClick={()=>setFontSize(f=>Math.max(10,f-2))} className="p-1 rounded bg-gray-100"><Minus size={14}/></button>
              <span className="text-[13px] font-bold w-5 text-center">{fontSize}</span>
              <button onClick={()=>setFontSize(f=>Math.min(60,f+2))} className="p-1 rounded bg-gray-100"><Plus size={14}/></button>
              <span className="text-[12px] text-[#94A3B8] ml-2">Tap canvas to place</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex gap-3 px-4 pb-6 pt-2 shrink-0 bg-white border-t border-gray-100">
        <button onClick={()=>exportCollage(true)} disabled={!hasImages||isProcessing}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#F1F5F9] text-[#0F172A] font-bold text-[14px] disabled:opacity-40">
          <Download size={18}/>Download
        </button>
        <button onClick={()=>exportCollage(false)} disabled={!hasImages||isProcessing}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#5B43EE] text-white font-bold text-[14px] disabled:opacity-40">
          {isProcessing ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <Check size={18}/>}
          {isProcessing?'Processing…':'Use as Reference'}
        </button>
      </div>

      {/* Cropper Modal Overlay */}
      {isCropping && activeSlot !== null && images[activeSlot] && (
        <div className="fixed inset-0 z-[70] bg-black flex flex-col">
          <div className="flex justify-between items-center px-4 py-4 shrink-0 bg-[#0F172A] z-10">
            <button onClick={() => setIsCropping(false)} className="text-white font-medium px-2 py-1 text-sm">Cancel</button>
            <span className="text-white font-bold text-sm">Crop Photo</span>
            <button 
              onClick={async () => {
                try {
                  const croppedImgUrl = await getCroppedImg(images[activeSlot], croppedAreaPixels);
                  setImages(prev => ({ ...prev, [activeSlot]: croppedImgUrl }));
                  setIsCropping(false);
                } catch(e) {
                  showToast('Failed to crop image', 'error');
                }
              }} 
              className="text-white font-bold bg-[#5B43EE] px-4 py-1.5 rounded-full text-sm"
            >
              Done
            </button>
          </div>
          <div className="flex-1 relative">
            <Cropper
              image={images[activeSlot]}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onCropComplete={(cA, cAP) => setCroppedAreaPixels(cAP)}
              onZoomChange={setZoom}
            />
          </div>
        </div>
      )}

      {/* Text Input Overlay */}
      {addingText && (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end" style={{background:'rgba(0,0,0,0.4)'}}>
          <div className="bg-[#1E293B] rounded-t-3xl p-5 pb-10">
            <p className="text-white font-bold text-[15px] mb-3">Add Text Annotation</p>
            <textarea autoFocus value={draftText} onChange={e=>setDraftText(e.target.value)}
              placeholder="Type your annotation..." maxLength={120}
              className="w-full bg-[#0F172A] rounded-xl p-3 text-[14px] border border-[#334155] min-h-[72px] resize-none outline-none placeholder:text-[#475569]"
              style={{color:textColor}}/>
            <div className="flex gap-3 mt-4">
              <button onClick={()=>{setAddingText(false);setEditingTextId(null);}} className="flex-1 py-3 rounded-xl bg-[#334155] text-[#94A3B8] font-semibold text-[14px]">Cancel</button>
              <button onClick={confirmText} className="flex-[2] py-3 rounded-xl bg-[#5B43EE] text-white font-bold text-[14px] flex items-center justify-center gap-2"><Check size={16}/>Place</button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file inputs */}
      {[0,1,2,3].map(i => (
        <input key={i} type="file" accept="image/*" className="hidden"
          ref={el=>{fileRefs.current[i]=el;}}
          onChange={e=>handleFileChange(e,i)}/>
      ))}
    </div>
  );
}
