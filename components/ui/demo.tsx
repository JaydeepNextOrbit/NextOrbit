// This is file of your component
// You can use any dependencies from npm; we import them automatically in package.json

import { cn } from "@/lib/utils";
import { useState } from "react";

export const Component = () => {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen w-full bg-white relative overflow-hidden"> 
 {/* Soft Lavender Center Glow */}
 <div 
   className="absolute inset-0 z-0 pointer-events-none" 
   style={{
     backgroundImage: `
       radial-gradient(circle at center, #c4b5fd, transparent)
     `,
   }} 
 />
 {/* Your Content Here */}
</div>
  );
};

export default Component;
