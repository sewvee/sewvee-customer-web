'use client';

import React from 'react';

export default function StitchingPage() {
  return (
    <div className="w-full h-[100dvh] flex flex-col bg-[#EFEAE2] overflow-hidden">
      <iframe
        src="/whatsapp-prototype.html?embedded=true"
        className="w-full h-full border-0 flex-1"
        title="Sewvee Online Stitching Flow"
      />
    </div>
  );
}
