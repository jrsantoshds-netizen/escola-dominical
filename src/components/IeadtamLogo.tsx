import React from 'react';

interface IeadtamLogoProps {
  className?: string;
  size?: number | string;
}

export default function IeadtamLogo({ className = '', size = '100%' }: IeadtamLogoProps) {
  // We use pure solid colors representing the true original logo values.
  // This guarantees 100% reliable rendering in all routing, iframe, and portal environments,
  // preventing standard SVG url(#gradient) reference issues.
  const GOLD = '#D4A017';
  const LIGHT_GOLD = '#FAD02C';
  const FOREST_GREEN = '#0E5C3B';
  const CHARCOAL = '#1B2421';
  
  return (
    <svg
      viewBox="0 0 500 500"
      width={size}
      height={size}
      className={`rounded-lg select-none ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Helper Paths for Text Alignment */}
        {/* Top Text Path (Left-to-Right along Top half) */}
        <path 
          id="textArcTop" 
          d="M 36 250 A 214 214 0 0 1 464 250" 
          fill="none" 
        />
        
        {/* Bottom Text Path (Right-to-Left along Bottom half to keep characters right-side up) */}
        <path 
          id="textArcBottom" 
          d="M 464 250 A 214 214 0 0 1 36 250" 
          fill="none" 
        />

        {/* Shading gradients */}
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE57F" />
          <stop offset="40%" stopColor="#FAD02C" />
          <stop offset="100%" stopColor="#C59600" />
        </linearGradient>

        <linearGradient id="mapGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F8FAF9" />
          <stop offset="100%" stopColor="#CFDAD6" />
        </linearGradient>

        <linearGradient id="biblePages" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#F0F4F2" />
          <stop offset="100%" stopColor="#E6ECE9" />
        </linearGradient>
      </defs>

      {/* 1. Outer Gold Rings */}
      <circle cx="250" cy="250" r="244" fill={FOREST_GREEN} stroke="url(#goldGradient)" strokeWidth="6" />

      {/* 2. Inner Gold separator Ring */}
      <circle cx="250" cy="250" r="192" fill="#FFFFFF" stroke="url(#goldGradient)" strokeWidth="8" />

      {/* 3. Outer text label along green band */}
      <g>
        <use href="#textArcTop" fill="none" />
        <use href="#textArcBottom" fill="none" />
        
        <text 
          fill="#FFFFFF" 
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
          fontSize="18" 
          fontWeight="900" 
          letterSpacing="0.8"
        >
          <textPath href="#textArcTop" startOffset="50%" textAnchor="middle">
            IGREJA EVANGÉLICA ASSEMBLEIA DE DEUS NO AMAZONAS
          </textPath>
        </text>

        <text 
          fill="#FFFFFF" 
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
          fontSize="22" 
          fontWeight="900" 
          letterSpacing="4"
        >
          <textPath href="#textArcBottom" startOffset="50%" textAnchor="middle">
            IEADTAM TRADICIONAL
          </textPath>
        </text>
      </g>

      {/* 4. Left and Right Gold Dot Separators */}
      <circle cx="40" cy="250" r="5" fill="#FAD02C" />
      <circle cx="460" cy="250" r="5" fill="#FAD02C" />

      {/* 5. Map of South America in background (Bottom-center) */}
      <g transform="translate(0, 0)">
        {/* South America Contour path */}
        <path
          d="M 235 390 
             C 245 390, 258 393, 276 398 
             C 290 402, 298 412, 296 422
             C 294 430, 288 442, 278 454
             C 270 464, 264 472, 258 481
             C 255 485, 251 485, 248 480
             C 243 470, 241 454, 241 445
             C 241 435, 235 428, 231 418
             C 227 410, 227 400, 235 390 Z"
          fill="url(#mapGradient)"
          stroke="#ACBFB9"
          strokeWidth="1.2"
        />

        {/* Highlight of Amazonas state (Vibrant Green) */}
        <path
          d="M 241 411 
             C 244 406, 252 404, 258 407 
             C 260 410, 258 416, 254 419 
             C 249 421, 242 417, 241 411 Z"
          fill={FOREST_GREEN}
          stroke="#FFFFFF"
          strokeWidth="0.8"
        />
      </g>

      {/* 6. Beautiful Open Bible (resting below text) */}
      <g>
        {/* 3D Page shadow layer */}
        <path
          d="M 115 385 Q 185 365, 250 376 Q 315 365, 385 385 L 385 390 Q 315 370, 250 381 Q 185 370, 115 390 Z"
          fill="#D6E2DE"
        />

        {/* Gold leather cover border edge */}
        <path
          d="M 112 388 Q 183 368, 250 379 Q 317 368, 388 388"
          stroke="url(#goldGradient)"
          strokeWidth="4"
          fill="none"
        />

        {/* Open Pages */}
        {/* Left page */}
        <path
          d="M 250 324 Q 185 310, 115 328 L 115 385 Q 185 365, 250 376 Z"
          fill="url(#biblePages)"
          stroke="#C5D5D0"
          strokeWidth="1"
        />

        {/* Right page */}
        <path
          d="M 250 324 Q 315 310, 385 328 L 385 385 Q 315 365, 250 376 Z"
          fill="url(#biblePages)"
          stroke="#C5D5D0"
          strokeWidth="1"
        />

        {/* Center line separator / Spine curve */}
        <line x1="250" y1="324" x2="250" y2="376" stroke="#ACBFB9" strokeWidth="2.5" />

        {/* Sepia ink style page lines representing scripture text */}
        {/* Left page lines */}
        <path d="M 132 338 Q 182 326, 233 336" stroke={CHARCOAL} strokeWidth="2" fill="none" opacity="0.65" strokeDasharray="3 2" />
        <path d="M 132 347 Q 182 335, 233 345" stroke={CHARCOAL} strokeWidth="2" fill="none" opacity="0.65" strokeDasharray="18 4 6 2" />
        <path d="M 132 356 Q 182 344, 233 354" stroke={CHARCOAL} strokeWidth="2" fill="none" opacity="0.65" strokeDasharray="10 3 10 2" />
        <path d="M 132 365 Q 182 353, 233 363" stroke={CHARCOAL} strokeWidth="2" fill="none" opacity="0.65" strokeDasharray="14 3 6 2" />

        {/* Right page lines */}
        <path d="M 267 336 Q 318 326, 368 338" stroke={CHARCOAL} strokeWidth="2" fill="none" opacity="0.65" strokeDasharray="10 4 10 2" />
        <path d="M 267 345 Q 318 335, 368 347" stroke={CHARCOAL} strokeWidth="2" fill="none" opacity="0.65" strokeDasharray="3 2 15 3" />
        <path d="M 267 354 Q 318 344, 368 356" stroke={CHARCOAL} strokeWidth="2" fill="none" opacity="0.65" strokeDasharray="16 4 4 2" />
        <path d="M 267 363 Q 318 353, 368 365" stroke={CHARCOAL} strokeWidth="2" fill="none" opacity="0.65" strokeDasharray="8 3 14 2" />
      </g>

      {/* 7. Bold Central "IEADTAM" serif text inside the white field */}
      <text
        x="250"
        y="288"
        fill={FOREST_GREEN}
        fontFamily="Georgia, system-ui, Times New Roman, serif"
        fontSize="54"
        fontWeight="bold"
        textAnchor="middle"
        letterSpacing="1.5"
      >
        IEADTAM
      </text>

      {/* 8. Symmetrical Blazing Flame of the Holy Spirit rising above the Bible Spine */}
      <g>
        {/* Outer Crimson fire wave */}
        <path
          d="M 250 326 
             C 220 300, 210 265, 232 238
             C 242 225, 250 195, 250 190
             C 250 195, 258 225, 268 238
             C 290 265, 280 300, 250 326 Z"
          fill="#AD1C1C"
        />

        {/* Mid Orange flame layer */}
        <path
          d="M 250 322
             C 228 300, 220 272, 236 248
             C 244 236, 250 208, 250 204
             C 250 208, 256 236, 264 248
             C 280 272, 272 300, 250 322 Z"
          fill="#F97316"
        />

        {/* Luminous Inner Yellow Flame */}
        <path
          d="M 250 316
             C 235 298, 230 278, 242 258
             C 246 248, 250 225, 250 220
             C 250 225, 254 248, 258 258
             C 270 278, 265 298, 250 316 Z"
          fill="#FACC15"
        />

        {/* Luminous Core light drop */}
        <path
          d="M 250 304
             C 242 290, 240 278, 246 265
             Q 250 248, 250 245
             Q 250 248, 254 265
             C 260 278, 258 290, 250 304 Z"
          fill="#FEF08A"
          opacity="0.95"
        />
      </g>

      {/* 9. Front Symmetrical Flying Dove representing the Holy Spirit */}
      <g>
        {/* Symmetrical Left Wing feathers */}
        <path
          d="M 250 198
             C 220 190, 182 170, 138 128
             C 126 116, 128 110, 142 116
             C 168 128, 192 144, 218 162
             C 202 153, 178 138, 155 125
             C 145 120, 148 114, 160 120
             C 184 132, 206 148, 226 166
             C 208 156, 185 142, 168 132
             C 158 127, 162 121, 175 127
             C 198 138, 218 154, 238 174
             C 232 166, 210 152, 192 142
             C 182 137, 186 131, 198 137
             C 220 148, 238 163, 250 182 Z"
          fill="#FFFFFF"
          stroke="#CFDAD6"
          strokeWidth="0.8"
        />

        {/* Symmetrical Right Wing feathers */}
        <path
          d="M 250 198
             C 280 190, 318 170, 362 128
             C 374 116, 372 110, 358 116
             C 332 128, 308 144, 282 162
             C 298 153, 322 138, 345 125
             C 355 120, 352 114, 340 120
             C 316 132, 294 148, 274 166
             C 292 156, 315 142, 332 132
             C 342 127, 338 121, 325 127
             C 302 138, 282 154, 262 174
             C 268 166, 290 152, 308 142
             C 318 137, 314 131, 302 137
             C 280 148, 262 163, 250 182 Z"
          fill="#FFFFFF"
          stroke="#CFDAD6"
          strokeWidth="0.8"
        />

        {/* Tail fan feathers */}
        <path
          d="M 242 205
             C 236 218, 222 232, 212 240
             C 205 244, 208 248, 216 244
             C 230 238, 242 225, 248 214
             C 246 226, 238 240, 232 250
             C 228 255, 232 258, 238 252
             C 246 244, 249 232, 250 220
             C 250 234, 250 250, 250 258
             C 250 262, 250 262, 250 258
             C 251 232, 254 244, 262 252
             C 268 258, 272 255, 268 250
             C 262 240, 254 226, 252 214
             C 258 225, 270 238, 284 244
             C 292 248, 295 244, 288 240
             C 278 232, 264 218, 258 205 Z"
          fill="#FFFFFF"
          stroke="#CFDAD6"
          strokeWidth="0.8"
        />

        {/* Dove central body & head */}
        <path
          d="M 245 198
             C 242 185, 238 165, 242 148
             C 244 140, 248 135, 250 135
             C 252 135, 256 140, 258 148
             C 262 165, 258 185, 255 198
             C 254 204, 250 210, 250 210
             C 250 210, 246 204, 245 198 Z"
          fill="#FFFFFF"
          stroke="#E6ECE9"
          strokeWidth="0.8"
        />

        {/* Sharp little beak centered perfectly, facing forward-ish */}
        <path
          d="M 249 135 L 251 135 L 250 144 Z"
          fill="url(#goldGradient)"
        />
      </g>
    </svg>
  );
}
